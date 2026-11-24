import { computed, nextTick, onBeforeUpdate, ref, useAttrs, watch } from 'vue'
import { useUiFieldDescription } from './fieldStrategies'
import type { UiUploadRegionViewProps } from './index'

/** Shared interaction mechanics only; every adapter owns its complete markup. */
export function useUiUploadRegionView(props: UiUploadRegionViewProps) {
  const root = ref<HTMLElement>(),
    input = ref<HTMLInputElement>()
  const dragging = ref(false)
  const attrs = useAttrs()
  const description = useUiFieldDescription(() => props.binding)
  let chooserRevision: number | undefined
  const labelled = computed(() => ({
    id: props.binding.id,
    'aria-label': String(
      attrs['aria-label'] ?? (props.label || props.chooseLabel),
    ),
    'aria-labelledby': attrs['aria-labelledby'] as string | undefined,
    'aria-describedby':
      [
        description.value,
        props.requiredLabel ? props.binding.id + '-upload-required' : '',
        props.issue ? props.binding.id + '-upload-issue' : '',
        attrs['aria-describedby'],
      ]
        .filter(Boolean)
        .join(' ') || undefined,
    'aria-invalid': props.binding.invalid || !!props.issue || undefined,
    'aria-busy': props.busy || undefined,
  }))
  function rememberChooser() {
    chooserRevision = props.revision
  }
  function choose() {
    if (!props.canAcquire) return
    chooserRevision = props.revision
    if (input.value) {
      input.value.value = ''
      input.value.click()
    }
  }
  async function changed() {
    const files = [...(input.value?.files ?? [])]
    if (input.value) input.value.value = ''
    const revision = chooserRevision ?? props.revision
    chooserRevision = undefined
    if (files.length) await props.select(files, revision)
  }
  function dragover(event: DragEvent) {
    event.preventDefault()
    event.stopImmediatePropagation()
    dragging.value = props.canAcquire
    if (event.dataTransfer)
      event.dataTransfer.dropEffect = props.canAcquire ? 'copy' : 'none'
  }
  function dragleave(event: DragEvent) {
    if (!root.value?.contains(event.relatedTarget as Node | null))
      dragging.value = false
  }
  async function drop(event: DragEvent) {
    event.preventDefault()
    event.stopImmediatePropagation()
    dragging.value = false
    if (!props.canAcquire) return
    const items = [...(event.dataTransfer?.items ?? [])]
    if (items.some((item) => item.webkitGetAsEntry?.()?.isDirectory)) {
      await props.select([], props.revision)
      return
    }
    await props.select([...(event.dataTransfer?.files ?? [])], props.revision)
  }
  function focusTarget() {
    if (props.binding.disabled) return undefined
    return (
      root.value?.querySelector<HTMLElement>(
        '[data-upload-choose]:not(:disabled):not([hidden]), [data-upload-action]:not(:disabled)',
      ) ?? root.value
    )
  }
  let pendingFocus = false
  watch(
    () => props.binding.disabled,
    (disabled) => {
      if (!disabled) return
      pendingFocus = false
      dragging.value = false
      const active = root.value?.ownerDocument
        .activeElement as HTMLElement | null
      if (active && root.value?.contains(active)) active.blur()
    },
    { flush: 'post' },
  )
  onBeforeUpdate(() => {
    const focused = root.value?.ownerDocument
      .activeElement as HTMLElement | null
    if (!focused || !root.value?.contains(focused)) return
    void nextTick(() => {
      if (props.binding.disabled) return
      if (
        root.value &&
        (!root.value.contains(focused) ||
          focused.matches(':disabled, [hidden]') ||
          (pendingFocus && focused === root.value))
      ) {
        const target = focusTarget()
        pendingFocus = target === root.value
        target?.focus()
      }
    })
  })
  return {
    root,
    input,
    dragging,
    labelled,
    choose,
    rememberChooser,
    changed,
    dragover,
    dragleave,
    drop,
    async focus() {
      if (props.binding.disabled) return false
      const target = focusTarget()
      if (!target) return null
      target.focus()
      return target.ownerDocument.activeElement === target
    },
  }
}
