import {
  computed,
  defineComponent,
  h,
  onErrorCaptured,
  type PropType,
} from 'vue'
import View from '@uninterface/backend/FeedbackItem.vue'
import { uiBackend } from '@uninterface/backend'
import UiButton from '../components/UiButton.vue'
import FeedbackActions from '../components/internal/FeedbackActions'
import { useZComponent } from '../stacking/runtime'
import { resolveUiText } from '../text/source'
import { useMessages } from '../i18n/messages'
import { assertThemeColor } from '../presentation/theme'
import type { FeedbackEntry, createFeedbackQueue } from './queue'

export default /* @__PURE__ */ defineComponent({
  name: 'FeedbackPresentation',
  props: {
    entry: { type: Object as PropType<FeedbackEntry>, required: true },
    config: {
      type: Object as PropType<
        ReturnType<typeof createFeedbackQueue>['config']
      >,
      required: true,
    },
    kind: {
      type: String as PropType<'toast' | 'notification'>,
      required: true,
    },
  },
  setup(props) {
    useZComponent()
    const messages = useMessages('feedback')
    const feedback = computed(() => {
      const source = props.entry.source.value
      return typeof source === 'function' ? source() : source
    })
    onErrorCaptured(() => {
      props.entry.close('presentation-error', true)
    })
    return () => {
      if (!messages.ready.value) return null
      const entry = props.entry,
        value = feedback.value
      const kind = value.kind ?? 'info'
      const announcement = value.announcement ?? 'polite'
      if (!['info', 'success', 'warning', 'error', 'custom'].includes(kind))
        throw new Error('Unsupported feedback kind.')
      if (!['off', 'polite', 'assertive'].includes(announcement))
        throw new Error('Unsupported feedback announcement.')
      if (value.color !== undefined && kind !== 'custom')
        throw new Error('Feedback color requires custom kind.')
      if (
        value.variant !== undefined &&
        !['filled', 'outline', 'soft'].includes(value.variant)
      )
        throw new Error('Unsupported feedback variant.')
      const color =
        kind === 'custom' ? value.color : kind === 'error' ? 'danger' : kind
      if (color) assertThemeColor(uiBackend, color)
      const custom = entry.options.content
      return h(
        View,
        {
          id: entry.handle.id,
          surface: props.kind,
          placement: props.config.placement,
          timing: entry.timing.value,
          viewportLabel: messages.value.notifications,
          kind,
          color,
          variant: value.variant,
          title: resolveUiText(value.title),
          message: resolveUiText(value.message),
          details: value.details?.map((detail) => resolveUiText(detail)),
          announcement,
          dismissible: value.dismissible ?? true,
          closeLabel: messages.value.close,
          open: entry.handle.phase === 'visible',
          pauseOnHover: props.config.pauseOnHover,
          pauseOnFocus: props.config.pauseOnFocus,
          pauseWhenHidden: props.config.pauseWhenHidden,
          onPresented: entry.presented,
          onExited: entry.exited,
          onPause: entry.pause,
          onDismissRequest: () => {
            if (feedback.value.dismissible !== false) entry.handle.dismiss()
          },
        },
        {
          ...(custom
            ? {
                default: () =>
                  custom({
                    item: entry.handle,
                    feedback: feedback.value,
                    dismiss: entry.handle.dismiss,
                  }),
              }
            : {}),
          ...(value.actions?.length
            ? {
                actions: () =>
                  h(FeedbackActions, null, {
                    default: () =>
                      feedback.value.actions?.map((action) => {
                        const { key, label, ...button } = action
                        return h(UiButton, { key, ...button }, () =>
                          resolveUiText(label),
                        )
                      }),
                  }),
              }
            : {}),
        },
      )
    }
  },
})
