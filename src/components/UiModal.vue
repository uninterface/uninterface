<script setup lang="ts" generic="T">
  import { provideZModal } from '../stacking/overlays'
  import type { UiZOrderProps } from '../stacking/authoring'

  import {
    nextTick,
    onBeforeUnmount,
    onDeactivated,
    onActivated,
    onErrorCaptured,
    provide,
    ref,
    shallowRef,
    watch,
    useAttrs,
  } from 'vue'
  import View from '@uninterface/backend/UiModal.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import type { UiModalViewHandle } from '../backend'
  import {
    attachModalPresentation,
    type UiModalControl,
    type UiModalSession,
    type UiModalCloseTrigger,
  } from '../controls/modal'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import { availableHeightKey } from '../layout/hosting'
  import { useMessages } from '../i18n/messages'
  import { validateModalWidth } from '../frame/modal-width'
  defineOptions({ inheritAttrs: false })
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        control: UiModalControl<T>
        title: string
        width?: 'auto' | 'available'
        preferredWidth?: number | string
        minWidth?: number | string
        maxWidth?: number | string
        closeOn?: readonly UiModalCloseTrigger[]
        bodyScroll?: 'body' | 'content'
      }
    >(),
    { closeOn: () => ['close-button', 'escape'], width: 'auto' },
  )
  const slots = defineSlots<{
    default(scope: { session: UiModalSession<T> }): any
    'header-extra'?(scope: { session: UiModalSession<T> }): any
    actions?(scope: { session: UiModalSession<T> }): any
    footer?(scope: { session: UiModalSession<T> }): any
  }>()
  function assertSlots() {
    if (slots.actions && slots.footer)
      throw new Error('UiModal: use either actions or footer, not both.')
  }
  assertSlots()
  assertUiCapabilities(uiBackend, ['modal.v1', 'modal.width.v1'])
  provideStrategyView(useUiStrategyNode('modal'))
  const attrs = useAttrs()
  function viewAttributes() {
    assertSlots()
    if (
      props.bodyScroll !== undefined &&
      !['body', 'content'].includes(props.bodyScroll)
    )
      throw new Error('UiModal: unsupported bodyScroll.')
    if (props.bodyScroll === 'content')
      assertUiCapabilities(uiBackend, ['modal.content-scroll.v1'])
    validateModalWidth(props)
    const result = { ...attrs }
    // The named modal and internal lifecycle events are resolved inputs, not
    // competing consumer attribute channels.
    for (const name of [
      'role',
      'aria-modal',
      'aria-label',
      'aria-labelledby',
      'aria-describedby',
      'onCancel',
    ])
      delete result[name]
    return result
  }
  const messages = useMessages()
  // Content-sized frames own their body scrolling. They cannot offer a measured
  // content height to a descendant whose size determines that same measurement.
  provide(availableHeightKey, ref(undefined))
  const view = ref<UiModalViewHandle>()
  const session = shallowRef<UiModalSession<T>>()
  let detach: (() => Promise<void>) | undefined
  function attach(control: UiModalControl<T>) {
    let presented: UiModalSession<T> | undefined
    let presentedView: UiModalViewHandle | undefined
    const release = attachModalPresentation(control, {
      async open(current) {
        if (!props.title.trim())
          throw new Error('UiModal requires a nonempty title.')
        presented = current
        session.value = current
        await nextTick()
        if (!view.value || session.value !== current)
          throw new Error('UiModal view was removed during opening.')
        presentedView = view.value
        if (!current.signal.aborted) await presentedView.open()
      },
      async close() {
        try {
          await presentedView?.close()
        } finally {
          if (session.value === presented) {
            session.value = undefined
          }
          presentedView = undefined
          presented = undefined
          await nextTick()
        }
      },
    })
    detach = () => {
      detach = undefined
      return release()
    }
  }
  watch(
    () => props.control,
    (control, _, cleanup) => {
      attach(control)
      cleanup(() => {
        void detach?.()
      })
    },
    { immediate: true },
  )
  onActivated(() => {
    if (!detach) attach(props.control)
  })
  onErrorCaptured((error) => {
    props.control.state.session?.fail(error)
    return false
  })
  function cancel(reason: UiModalCloseTrigger) {
    // Read live core policy: stale view events must not bypass a changed prop.
    if (!props.closeOn.includes(reason) || props.control.state.pendingClose)
      return
    void session.value?.cancel(reason)
  }
  onBeforeUnmount(() => {
    void detach?.()
  })
  onDeactivated(() => {
    void detach?.()
  })
  provideZModal(() => props.zOrder)
</script>
<template>
  <View
    v-if="session"
    :key="session.id"
    ref="view"
    v-bind="viewAttributes()"
    :title="title"
    :width="width"
    :preferred-width="preferredWidth"
    :min-width="minWidth"
    :max-width="maxWidth"
    :close-label="messages.close"
    :close-on="closeOn"
    :pending-close="control.state.pendingClose"
    :body-scroll="bodyScroll"
    @cancel="cancel"
  >
    <template
      v-if="$slots['header-extra']"
      #header-extra
    >
      <slot
        name="header-extra"
        :session="session"
      />
    </template>
    <slot :session="session" />
    <template
      v-if="$slots.actions"
      #actions
    >
      <slot
        name="actions"
        :session="session"
      />
    </template>
    <template
      v-if="$slots.footer"
      #footer
    >
      <slot
        name="footer"
        :session="session"
      />
    </template>
  </View>
</template>
