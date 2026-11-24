import { feedbackTargets as targets } from './driver'
import type {
  UiFloatingFeedbackTarget,
  UiFloatingFeedbackRoute,
  UiFeedbackSendOptions,
} from './floating-types'
import type { UiTextSource } from '../text/source'
import { shallowRef, toRaw } from 'vue'
import type { UiButtonBinding } from '../bindings/button'
import type { UiButtonVariant } from '../presentation/button'
import type { UiThemeColor } from '../presentation/theme'
import type {
  UiNoticeKind,
  UiNoticeVariant,
  UiNoticeAnnouncement,
} from '../presentation/notice'

/** Ordinary UiButton authoring; a binding and a manual click handler are exclusive. */
export type UiFeedbackAction = {
  key: string
  label: UiTextSource
  color?: UiThemeColor
  variant?: UiButtonVariant
  disabled?: boolean
  form?: string
} & (
  | { binding: UiButtonBinding; onClick?: never; type?: never; loading?: never }
  | {
      binding?: never
      onClick?: (event: MouseEvent) => void
      type?: 'button' | 'submit' | 'reset'
      loading?: boolean
    }
)

export interface UiFeedbackMessage {
  kind?: UiNoticeKind
  color?: UiThemeColor
  variant?: UiNoticeVariant
  title?: UiTextSource
  message?: UiTextSource
  details?: readonly UiTextSource[]
  announcement?: UiNoticeAnnouncement
  dismissible?: boolean
  actions?: readonly UiFeedbackAction[]
}

/** A getter keeps translations and availability live without sending again. */
export type UiFeedbackMessageSource =
  | UiFeedbackMessage
  | (() => UiFeedbackMessage)

export interface UiFeedbackHandle {
  readonly active: boolean
  /** Patch the current content, or replace its source with a getter. Inactive handles are inert. */
  update(value: Partial<UiFeedbackMessage> | (() => UiFeedbackMessage)): void
  dismiss(): void
}

export interface UiNoticeBinding {
  readonly target: 'notice'
  readonly current: UiFeedbackMessage | undefined
  dismiss(): void
}

export interface UiFeedbackTarget {
  readonly bindings: { readonly notice: UiNoticeBinding }
  reset(): void
  dispose(): void
}

export interface UiFeedbackRoute {
  send(message: UiFeedbackMessageSource): UiFeedbackHandle
  reset(): void
  dispose(): void
}

type Delivery = { owner: symbol; source: UiFeedbackMessageSource }
/** Create a virtual, single-current-message target independently of a view. */
export function createUiFeedbackTarget(): UiFeedbackTarget {
  const current = shallowRef<Delivery>()
  let disposed = false
  const clear = (owner?: symbol) => {
    if (owner === undefined || current.value?.owner === owner)
      current.value = undefined
  }
  const target: UiFeedbackTarget = Object.freeze({
    bindings: Object.freeze({
      notice: Object.freeze({
        target: 'notice' as const,
        get current() {
          const source = current.value?.source
          return typeof source === 'function' ? source() : source
        },
        dismiss: () => clear(),
      }),
    }),
    reset: () => clear(),
    dispose: () => {
      disposed = true
      clear()
    },
  })
  targets.set(target, {
    clear,
    send(owner, source, options) {
      if (options !== undefined)
        throw new Error(
          'Inline notice routes do not accept floating presentation options.',
        )
      if (disposed)
        throw new Error('Cannot send feedback to a disposed target.')
      let delivery: Delivery = { owner, source }
      current.value = delivery
      const active = () => current.value === delivery
      return Object.freeze({
        get active() {
          return active()
        },
        update(value: Partial<UiFeedbackMessage> | (() => UiFeedbackMessage)) {
          if (!active()) return
          const previous = delivery.source
          const next =
            typeof value === 'function'
              ? value
              : () => ({
                  ...(typeof previous === 'function' ? previous() : previous),
                  ...value,
                })
          delivery = { owner, source: next }
          current.value = delivery
        },
        dismiss() {
          if (active()) clear()
        },
      })
    },
  })
  return target
}

/** Connect explicitly to a target; route cleanup never clears another route's delivery. */
export function createUiFeedbackRoute(options: {
  target: UiFloatingFeedbackTarget
}): UiFloatingFeedbackRoute
export function createUiFeedbackRoute(options: {
  target: UiFeedbackTarget
}): UiFeedbackRoute
export function createUiFeedbackRoute(options: {
  target: UiFeedbackTarget | UiFloatingFeedbackTarget
}): UiFeedbackRoute {
  const target = targets.get(toRaw(options.target))
  if (!target) throw new Error('Expected a factory-created feedback target.')
  const owner = Symbol('feedback route')
  let disposed = false
  const reset = () => target.clear(owner)
  return Object.freeze({
    send(source: UiFeedbackMessageSource, options?: UiFeedbackSendOptions) {
      if (disposed)
        throw new Error('Cannot send feedback through a disposed route.')
      return target.send(owner, source, options)
    },
    reset,
    dispose() {
      disposed = true
      reset()
    },
  })
}
