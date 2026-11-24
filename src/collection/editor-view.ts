import {
  inject,
  nextTick,
  onActivated,
  onDeactivated,
  onScopeDispose,
  provide,
  toRaw,
  watch,
} from 'vue'
import { buttonActivationKey } from '../bindings/button'
import type { UiListKey } from '../bindings/list'
import type { UiFieldControl } from '../controls/field'
import type { UiListValueEditor } from '../controls/list-value'
import type { UiCollectionEditorControl } from '../controls/collection-editor'
import {
  collectionEditorSessions,
  collectionEditorViewKey,
  type EditorView,
  type EditorActionOrigin,
} from './editor-protocol'

export interface UiCollectionEditorViewOptions<E> {
  /** Business field order; omission treats the whole row as one custom field. */
  fields?: (editor: E) => readonly UiFieldControl<any, any>[]
  /** Reveal a filtered/paged inserted or invalid row without changing its draft. */
  reveal?: (key: UiListKey, reason: 'add' | 'invalid') => void | Promise<void>
}

export interface UiCollectionEditorView {
  focusInvalid(): Promise<boolean>
  /** Escape hatch for a custom editor not using Uninterface's field context. */
  register(
    field: UiFieldControl<any, any>,
    handle: {
      focus(): boolean | null | Promise<boolean | null>
    },
  ): () => void
}

/** Borrow one controller for one view; mounting never creates or resets drafts. */
export function useUiCollectionEditor<
  T,
  E extends UiListValueEditor<T>,
  F,
  S extends string,
>(
  control: UiCollectionEditorControl<T, E, F, S>,
  options: UiCollectionEditorViewOptions<E> = {},
): UiCollectionEditorView {
  control = toRaw(control)
  const session = collectionEditorSessions.get(control)
  if (!session)
    throw new Error(
      'useUiCollectionEditor requires a collection editor control.',
    )
  const fields = new Set<{
    field: () => UiFieldControl<any, any>
    focus: () => Promise<boolean | null>
  }>()
  const creations = new Set<() => Promise<boolean | null>>()
  const cancellations = new Set<() => void>()
  let active = true
  let disposed = false
  let generation = 0
  let ownerDocument: Document | undefined
  const available = () => active && !disposed && !control.state.disposed
  function cancel() {
    generation++
    for (const stop of cancellations) stop()
    cancellations.clear()
  }
  onActivated(() => {
    active = true
  })
  onDeactivated(() => {
    active = false
    cancel()
  })
  onScopeDispose(() => {
    disposed = true
    active = false
    cancel()
    fields.clear()
    creations.clear()
  })
  function register(
    field: () => UiFieldControl<any, any>,
    focus: () => Promise<boolean | null>,
  ) {
    if (disposed) return () => {}
    const entry = { field, focus }
    fields.add(entry)
    return () => {
      fields.delete(entry)
    }
  }
  async function focusRow(
    key: UiListKey,
    invalid: boolean,
    isCurrent: () => boolean,
  ) {
    const editor = control.value.findEditor(key)
    if (!editor) return false
    const order = options.fields?.(editor) ?? [editor.field]
    for (const field of order) {
      if (invalid && !field.state.issue) continue
      for (const entry of fields) {
        if (
          !available() ||
          !isCurrent() ||
          control.value.findEditor(key) !== editor
        )
          return false
        if (
          toRaw(entry.field()) !== toRaw(field) ||
          field.state.effectiveDisabled
        )
          continue
        if ((await entry.focus()) === true) return true
      }
    }
    return false
  }
  const view: EditorView = {
    binding: control.bindings.list,
    register,
    registerCreation(focus) {
      if (disposed) return () => {}
      creations.add(focus)
      return () => {
        creations.delete(focus)
      }
    },
    async recoverFocus(request) {
      const version = ++generation
      const revision = control.value.field.state.revision
      const current = () =>
        available() &&
        version === generation &&
        request.isCurrent() &&
        revision === control.value.field.state.revision
      await nextTick()
      if (control.state.pending && available()) {
        await new Promise<void>((resolve) => {
          const stop = watch(
            () => [control.state.pending, control.state.disposed],
            () => {
              if (!control.state.pending || control.state.disposed) finish()
            },
            { flush: 'sync' },
          )
          const finish = () => {
            stop()
            cancellations.delete(finish)
            resolve()
          }
          cancellations.add(finish)
        })
        await nextTick()
      }
      for (const key of request.candidates) {
        if (!current()) return true
        if (await focusRow(key, false, current)) return true
      }
      for (const focus of creations) {
        if (!current()) return true
        if ((await focus()) === true) return true
      }
      return !current()
    },
  }
  provide(collectionEditorViewKey, view)
  const parentActivation = inject(buttonActivationKey, undefined)
  provide(buttonActivationKey, (binding, invoke, event) => {
    const invokeHere = () => {
      cancel()
      const version = generation
      const document = (event.target as Node | null)?.ownerDocument
      if (document) ownerDocument = document
      const focused = document?.activeElement
      let moved = false
      const changed = () => {
        if (
          document?.activeElement !== focused &&
          document?.activeElement !== document?.body
        )
          moved = true
      }
      document?.addEventListener('focusin', changed)
      const stop = () => {
        moved = true
        document?.removeEventListener('focusin', changed)
        cancellations.delete(stop)
      }
      cancellations.add(stop)
      const previous = session.origin
      const origin: EditorActionOrigin = {
        async added(key, isCurrent) {
          const current = () =>
            available() && !moved && version === generation && isCurrent()
          if (!current()) return
          await options.reveal?.(key, 'add')
          await nextTick()
          if (current()) await focusRow(key, false, current)
        },
        cancel: stop,
      }
      session.origin = origin
      try {
        // The control captures the origin before its first await.
        return invoke()
      } finally {
        session.origin = previous
        // Unrelated ordinary actions do not leave a document listener alive.
        if (!origin.consumed) stop()
      }
    }
    return parentActivation
      ? parentActivation(binding, invokeHere, event)
      : invokeHere()
  })
  return Object.freeze({
    async focusInvalid() {
      if (!available()) return false
      cancel()
      const version = generation
      const document = ownerDocument ?? globalThis.document
      const focused = document?.activeElement
      let moved = false
      const changed = () => {
        if (
          document.activeElement !== focused &&
          document.activeElement !== document.body
        )
          moved = true
      }
      const stop = () => {
        moved = true
        document?.removeEventListener('focusin', changed)
        cancellations.delete(stop)
      }
      cancellations.add(stop)
      document?.addEventListener('focusin', changed)
      const current = () => available() && version === generation && !moved
      try {
        return await control.value.revealInvalid(
          async (key) => {
            if (current()) await options.reveal?.(key, 'invalid')
            await nextTick()
          },
          (_editor, key) => focusRow(key, true, current),
        )
      } finally {
        stop()
      }
    },
    register(
      field: UiFieldControl<any, any>,
      handle: { focus(): boolean | null | Promise<boolean | null> },
    ) {
      return register(
        () => field,
        async () => handle.focus(),
      )
    },
  })
}
