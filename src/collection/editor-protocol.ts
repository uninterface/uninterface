import type { InjectionKey } from 'vue'
import type { UiListBinding, UiListKey } from '../bindings/list'
import type { UiFieldControl } from '../controls/field'

export interface EditorFocusRequest {
  key: UiListKey
  candidates: readonly UiListKey[]
  isCurrent(): boolean
}

export interface EditorView {
  binding: UiListBinding<any, any, any>
  register(
    field: () => UiFieldControl<any, any>,
    focus: () => Promise<boolean | null>,
  ): () => void
  registerCreation(focus: () => Promise<boolean | null>): () => void
  recoverFocus(request: EditorFocusRequest): Promise<boolean>
}

export const collectionEditorViewKey: InjectionKey<EditorView> = Symbol(
  'uninterface.collection-editor-view',
)

export interface EditorActionOrigin {
  consumed?: boolean
  added(key: UiListKey, isCurrent: () => boolean): Promise<void>
  cancel(): void
}

// The origin is captured synchronously at dispatch, never held in an ambient
// context across an await. Every controller and borrowing view has its own scope.
export const collectionEditorSessions = new WeakMap<
  object,
  { origin?: EditorActionOrigin }
>()
