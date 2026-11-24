import { computed, ref, watch } from 'vue'
import { useUiI18n } from '../i18n/context'
import { getIconOverride, useIconCatalogue } from '../icons/catalogue'
import type { UiFilePreviewViewProps } from './index'

export function useUiFilePreviewView(props: UiFilePreviewViewProps) {
  const i18n = useUiI18n()
  const catalogue = useIconCatalogue()
  const thumbnailFailed = ref(false)
  watch(
    () => [props.url, props.image, props.thumbnail],
    () => {
      thumbnailFailed.value = false
    },
    { flush: 'sync' },
  )
  // Each source gets its own handler so a late event cannot fail its replacement.
  const thumbnailCandidate = computed(() => {
    const url = props.thumbnail && props.image ? props.url : undefined
    if (!url) return undefined
    const candidate = {
      url,
      error() {
        if (thumbnailCandidate.value === candidate) thumbnailFailed.value = true
      },
    }
    return candidate
  })
  const thumbnailImage = computed(() =>
    thumbnailFailed.value ? undefined : thumbnailCandidate.value,
  )
  const kind = computed(() => {
    const mime = props.mediaType?.split(';')[0]?.trim().toLowerCase() ?? ''
    if (mime === 'application/pdf') return 'pdf'
    if (/^(audio|video)\//.test(mime))
      return mime.startsWith('audio/') ? 'audio' : 'video'
    if (
      [
        'application/zip',
        'application/x-zip-compressed',
        'application/gzip',
        'application/x-gzip',
        'application/x-tar',
        'application/x-7z-compressed',
        'application/vnd.rar',
        'application/x-rar-compressed',
      ].includes(mime)
    )
      return 'archive'
    if (
      [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.spreadsheet',
      ].includes(mime)
    )
      return 'spreadsheet'
    if (
      [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.oasis.opendocument.presentation',
      ].includes(mime)
    )
      return 'presentation'
    if (
      [
        'application/json',
        'application/ld+json',
        'application/xml',
        'text/xml',
        'text/html',
        'text/css',
        'text/javascript',
        'application/javascript',
      ].includes(mime)
    )
      return 'code'
    if (
      mime.startsWith('text/') ||
      [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.oasis.opendocument.text',
        'application/rtf',
      ].includes(mime)
    )
      return 'document'
    return 'file'
  })
  const sizeLabel = computed(() => {
    const bytes = props.size
    if (bytes === undefined || !Number.isFinite(bytes) || bytes < 0)
      return undefined
    const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
    let amount = bytes,
      unit = 0
    while (amount >= 1024 && unit < units.length - 1) {
      amount /= 1024
      unit++
    }
    // Avoid rounding to "1,024 KiB" at the next unit boundary.
    if (
      unit > 0 &&
      Math.round(amount * 10) / 10 >= 1024 &&
      unit < units.length - 1
    ) {
      amount /= 1024
      unit++
    }
    return `${i18n.number(amount, { maximumFractionDigits: unit === 0 ? 0 : 1 })} ${units[unit]}`
  })
  return {
    thumbnailImage,
    kind,
    sizeLabel,
    // The common default `file` must not mask backend MIME-family artwork.
    icon: computed(
      () =>
        getIconOverride(catalogue, `file.${kind.value}`)?.component ??
        getIconOverride(catalogue, 'file')?.component ??
        catalogue[`file.${kind.value}`]?.component,
    ),
  }
}
