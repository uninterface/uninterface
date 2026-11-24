<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import {
    computed,
    inject,
    ref,
    toRaw,
    useAttrs,
    useId,
    useSlots,
    watchEffect,
    onMounted,
    nextTick,
  } from 'vue'
  import View from '@uninterface/backend/UiUploadRegion.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import type { UiFocusHandle, UiUploadRegionViewProps } from '../backend'
  import type {
    UiUploadRegionProps,
    UiUploadRegionAction,
  } from '../files/region-types'
  import { uploadRegionField } from '../files/region'
  import { fieldKey, controlBinding } from '../controls/context'
  import { useIssueText, useMessages } from '../i18n/messages'
  import { useUploadProgressPresentation } from './internal/uploadProgress'
  import { useFilePreview } from './internal/filePreview'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import { availableHeightKey } from '../layout/hosting'
  defineOptions({ inheritAttrs: false })
  const props = withDefaults(
    defineProps<UiZOrderProps & UiUploadRegionProps>(),
    {
      progress: undefined,
      preview: undefined,
    },
  )
  const view = ref<UiFocusHandle>(),
    id = useId(),
    attrs = useAttrs(),
    slots = useSlots()
  const context = inject(fieldKey, undefined),
    messages = useMessages('files')
  const issue = useIssueText(() => props.binding.issue)
  const heightOffer = inject(availableHeightKey, undefined),
    mounted = ref(false)
  onMounted(async () => {
    await nextTick()
    mounted.value = true
  })
  const actionNames: UiUploadRegionAction[] = [
    'cancel',
    'retry',
    'retryDelivery',
    'remove',
  ]
  watchEffect(() => {
    if (props.binding?.target !== 'upload-region')
      throw new Error('UiUploadRegion requires an upload-region binding.')
    if (Object.keys(slots).length)
      throw new Error(
        'UiUploadRegion uses semantic participation props, not content slots.',
      )
    for (const key of [
      'file',
      'upload-controller',
      'uploadController',
      'multiple',
      'webkitdirectory',
    ])
      if (attrs[key] !== undefined)
        throw new Error(
          'UiUploadRegion requires single-file binding ownership; unsupported attribute: ' +
            key,
        )
    if (props.actions?.some((name) => !actionNames.includes(name)))
      throw new Error('Unknown upload-region action.')
    if (
      props.extent &&
      !['compact', 'regular', 'large', 'fill'].includes(props.extent)
    )
      throw new Error('Invalid upload region extent.')
    if (
      mounted.value &&
      props.extent === 'fill' &&
      heightOffer?.value === undefined
    )
      throw new Error(
        'UiUploadRegion extent=fill requires a definite local height offer; use a preset in an unbounded host.',
      )
    const owner = uploadRegionField(props.binding)
    if (
      context &&
      !context.value.group &&
      (owner === null ||
        (owner !== undefined && toRaw(owner) !== toRaw(context.value.field)))
    )
      throw new Error('UiUploadRegion requires its matching destination field.')
  })
  const fieldBinding = computed(() =>
    context
      ? controlBinding(context.value, props.disabled)
      : {
          id,
          disabled: !!props.disabled,
          invalid: !!props.binding.issue,
          validating: props.binding.busy,
        },
  )
  const available = () => !fieldBinding.value.disabled && !props.readonly
  const previewFile = computed(() =>
    (props.preview ?? props.binding.role === 'retained')
      ? props.binding.file
      : null,
  )
  const url = useFilePreview(() => previewFile.value)
  const transfer = useUploadProgressPresentation(
    () => props.binding.progress!,
    () => ({
      activity: props.progress !== false,
      cancel:
        props.binding.progress?.status === 'failed' &&
        (!props.actions || props.actions.includes('cancel')),
      retry: !props.actions || props.actions.includes('retry'),
      disabled: !!fieldBinding.value.disabled,
      readonly: props.readonly,
      issueId: fieldBinding.value.id + '-upload-issue',
      announcement: 'polite',
    }),
  )
  const resolved = computed<UiUploadRegionViewProps>(() => {
    const b = props.binding,
      m = messages.value,
      progress = b.progress
    const labels = {
      cancel: m.cancel,
      retry: m.retry,
      retryDelivery: m.retryDelivery,
      remove: m.removeFile,
    }
    return {
      phase: b.phase,
      binding: fieldBinding.value,
      label: context?.value.label ?? String(attrs['aria-label'] ?? ''),
      readonly: !!props.readonly,
      canAcquire: available() && b.canAcquire,
      busy: b.busy,
      occupied: b.occupied,
      revision: b.revision,
      fileName: b.fileName,
      issue: issue.value,
      requiredLabel: fieldBinding.value.required ? m.required : null,
      chooseLabel: m.chooseFile,
      accept: props.accept,
      capture: props.capture,
      extent: props.extent ?? 'regular',
      allocatedHeight: props.extent === 'fill' ? heightOffer?.value : undefined,
      preview: previewFile.value
        ? {
            name: previewFile.value.name,
            mediaType: previewFile.value.mediaType,
            presentation: 'tile',
            size: previewFile.value.size,
            image: !!previewFile.value.mediaType?.startsWith('image/'),
            url: url.value,
            alt: props.previewAlt ?? previewFile.value.name,
          }
        : null,
      progress:
        progress &&
        (props.progress !== false ||
          transfer.value.issue ||
          transfer.value.canRetry)
          ? transfer.value
          : null,
      actions: actionNames
        .filter(
          (name) =>
            name !== 'retry' &&
            !(name === 'cancel' && progress?.status === 'failed') &&
            (!props.actions || props.actions.includes(name)) &&
            b.actions[name] &&
            !b.actions[name]!.disabled,
        )
        .map((name) => ({
          name,
          label: labels[name],
          accessibleLabel: name === 'cancel' ? m.cancelUpload : undefined,
          disabled:
            !!fieldBinding.value.disabled ||
            (!!props.readonly && name !== 'cancel'),
          async invoke() {
            const action = props.binding.actions[name]
            if (
              fieldBinding.value.disabled ||
              (props.readonly && name !== 'cancel') ||
              !action ||
              action.disabled ||
              action.loading
            )
              return
            await action.activate?.()
          },
        })),
      async select(files, revision) {
        await props.binding.acquire(files, { revision, available })
      },
    }
  })
  provideStrategyView(useUiStrategyNode('upload-region'))
  assertUiCapabilities(uiBackend, ['upload.region.v2', 'progress.bar.v1'])
  defineExpose({ focus: () => view.value?.focus() ?? Promise.resolve(null) })
  const messagesReady = messages.ready
</script>
<template>
  <View
    v-if="messagesReady"
    ref="view"
    v-bind="{ ...$attrs, ...resolved }"
  />
</template>
