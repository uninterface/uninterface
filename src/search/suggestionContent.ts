import type { UiSearchResult } from './control'

export interface SuggestionSlotProps<T> {
  item: T
  label: string
  active: boolean
  disabled: boolean
  labelParts: ReturnType<typeof suggestionLabelParts>
}

/** Segment the resolved label using provider-supplied UTF-16 offsets. */
export function suggestionLabelParts({
  label,
  matchRanges = [],
}: UiSearchResult) {
  const parts: { text: string; matched: boolean }[] = []
  const ranges = matchRanges
    .filter(
      ([start, end]) =>
        Number.isInteger(start) &&
        Number.isInteger(end) &&
        start >= 0 &&
        start < end &&
        end <= label.length,
    )
    .sort(([first], [second]) => first - second)
  let offset = 0
  for (const [start, end] of ranges) {
    if (end <= offset) continue
    if (start > offset) {
      parts.push({ text: label.slice(offset, start), matched: false })
    }
    const last = parts.at(-1)
    if (start <= offset && last?.matched) last.text += label.slice(offset, end)
    else parts.push({ text: label.slice(start, end), matched: true })
    offset = end
  }
  if (offset < label.length)
    parts.push({ text: label.slice(offset), matched: false })
  return parts
}
