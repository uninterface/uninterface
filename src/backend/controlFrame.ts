import {
  computed,
  inject,
  onActivated,
  onDeactivated,
  onScopeDispose,
  provide,
  ref,
  shallowReactive,
  type InjectionKey,
} from 'vue'
import type { UiFocusHandle } from './index'

/** Presentation ownership, independent of value and validation bindings. */
export interface UiControlFrameBinding {
  readonly owner: 'self' | 'parent'
}
export interface UiControlFrameParticipantOptions {
  focus: UiFocusHandle['focus']
  /** Attributes an existing failure; never creates or aggregates validation. */
  invalid?(): boolean
}
export interface UiControlFrameOptions {
  disabled?(): boolean
  /** Used when no registered participant accepts focus. */
  focusEditor?: UiFocusHandle['focus']
}
interface Participant extends UiControlFrameParticipantOptions {
  active(): boolean
  engaged(): boolean
}
interface ControlFrameContext {
  register(participant: Participant): () => void
}
const controlFrameKey: InjectionKey<ControlFrameContext> =
  Symbol('ui.control-frame')

/** Internal boundary for an explicitly independent field or popup content. */
export function isolateControlFrame() {
  provide(controlFrameKey, undefined as unknown as ControlFrameContext)
}

/** Establish a control-frame owner for explicitly participating descendants. */
export function provideUiControlFrame(options: UiControlFrameOptions = {}) {
  if (inject(controlFrameKey, undefined))
    throw new Error('Control frames cannot be nested.')
  const participants = shallowReactive(new Set<Participant>())
  provide(controlFrameKey, {
    register(participant) {
      participants.add(participant)
      return () => participants.delete(participant)
    },
  })
  const engaged = computed(() =>
    [...participants].some((part) => part.active() && part.engaged()),
  )
  async function focus(): Promise<boolean | null> {
    if (options.disabled?.()) return false
    const ordered = [...participants].filter((part) => part.active())
    ordered.sort(
      (a, b) => Number(b.invalid?.() ?? false) - Number(a.invalid?.() ?? false),
    )
    for (const part of ordered) {
      if (options.disabled?.()) return false
      if (
        participants.has(part) &&
        part.active() &&
        (await part.focus()) === true
      )
        return true
    }
    return options.focusEditor?.() ?? null
  }
  return { focus, engaged }
}

/** Opt into the nearest control frame; without one the editor owns its frame. */
export function useUiControlFrameParticipant(
  options: UiControlFrameParticipantOptions,
) {
  const parent = inject(controlFrameKey, undefined)
  const frame: UiControlFrameBinding = Object.freeze({
    owner: parent ? 'parent' : 'self',
  })
  const active = ref(true)
  const engaged = ref(false)
  let alive = true
  const unregister = parent?.register({
    ...options,
    active: () => active.value,
    engaged: () => engaged.value,
  })
  onDeactivated(() => {
    active.value = false
    engaged.value = false
  })
  onActivated(() => {
    active.value = true
  })
  onScopeDispose(() => {
    alive = false
    unregister?.()
  })
  return {
    frame,
    /** Retain parent engagement while an owned popup is active. Close/dispose releases it. */
    setEngaged(value: boolean) {
      if (alive && active.value) engaged.value = value
    },
  }
}
