import { useMessages } from '../i18n/messages'
import {
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onMounted,
  watch,
  onScopeDispose,
  provide,
  useId,
} from 'vue'
import Viewport from '@uninterface/backend/FeedbackViewport.vue'
import { uiBackend } from '@uninterface/backend'
import { assertUiCapabilities } from '../backend/capabilities'
import { feedbackRegistryKey } from './registry'
import { createFeedbackQueue } from './queue'
import FeedbackPresentation from './presentation'
import type {
  UiFeedbackTargetOptions,
  UiFloatingFeedbackTarget,
} from './floating-types'

function create(
  kind: 'toast' | 'notification',
  options: UiFeedbackTargetOptions,
): UiFloatingFeedbackTarget {
  const instance = getCurrentInstance()
  const registry = inject(feedbackRegistryKey, undefined)
  if (!instance || !registry)
    throw new Error(
      'Create toast/notification targets during setup inside createUiApplication.',
    )
  assertUiCapabilities(uiBackend, ['feedback.floating.v1'])
  const queue = createFeedbackQueue(kind, options, `feedback-${useId()}`)
  // Capture the creator's logical scope, including modal portals, strategies,
  // native theme and business injection. No global Vue service or render app.
  const inherited = (
    instance as typeof instance & { provides: Record<PropertyKey, unknown> }
  ).provides
  const Context = defineComponent({
    name: 'FeedbackDestination',
    setup() {
      const keys = new Set<PropertyKey>()
      for (let scope = inherited; scope; scope = Object.getPrototypeOf(scope))
        for (const key of Reflect.ownKeys(scope))
          if (!keys.has(key)) {
            keys.add(key)
            provide(key as string, scope[key])
          }
      const messages = useMessages('feedback')
      onMounted(() => {
        watch(
          messages.ready,
          (ready) => {
            if (ready) queue.ready()
          },
          { immediate: true, flush: 'post' },
        )
      })
      return () =>
        messages.ready.value
          ? h(
              Viewport,
              {
                placement: queue.config.placement,
                kind,
                label: messages.value.notifications,
              },
              {
                default: () =>
                  queue.entries
                    .filter((e) => e.handle.phase !== 'queued')
                    .map((entry) =>
                      h(FeedbackPresentation, {
                        key: entry.handle.id,
                        entry,
                        config: queue.config,
                        kind,
                      }),
                    ),
              },
            )
          : null
    },
  })
  let release: (() => void) | undefined
  const target: UiFloatingFeedbackTarget = Object.freeze({
    kind,
    state: queue.target.state,
    reset: queue.target.reset,
    dispose() {
      queue.target.dispose()
      release?.()
      release = undefined
    },
  })
  // Public wrapper has the same driver, with presentation cleanup on disposal.
  feedbackTargets.set(target, feedbackTargets.get(queue.target)!)
  release = registry.add(Context, target.dispose)
  onScopeDispose(target.dispose)
  return target
}
import { feedbackTargets } from './driver'
export function createUiToastTarget(
  options: UiFeedbackTargetOptions = {},
): UiFloatingFeedbackTarget {
  return create('toast', options)
}
export function createUiNotificationTarget(
  options: UiFeedbackTargetOptions = {},
): UiFloatingFeedbackTarget {
  return create('notification', options)
}
