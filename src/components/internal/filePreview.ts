import { computed, onScopeDispose, shallowRef, watch } from 'vue'
import type { UiFileDescriptor } from '../../files/control'
export function useFilePreview(file: () => UiFileDescriptor | null) {
  // Release the URLs created here when the preview is replaced or unmounted.
  // Caller-supplied URLs have a separate owner. https://w3c.github.io/FileAPI/#url-intro
  const local = shallowRef<string>()
  function release() {
    if (local.value) {
      URL.revokeObjectURL(local.value)
      local.value = undefined
    }
  }
  watch(
    () => [file()?.key, file()?.value, file()?.previewUrl, file()?.contentUrl],
    () => {
      release()
      const value = file()
      if (
        value &&
        !value.previewUrl &&
        !value.contentUrl &&
        typeof Blob !== 'undefined' &&
        value.value instanceof Blob &&
        typeof URL.createObjectURL === 'function'
      )
        local.value = URL.createObjectURL(value.value)
    },
    { immediate: true },
  )
  onScopeDispose(release)
  return computed(() => file()?.previewUrl ?? file()?.contentUrl ?? local.value)
}
