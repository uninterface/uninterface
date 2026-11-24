import { computed, watch } from 'vue'
import { useMessages } from '../i18n/messages'
import { parseTemporal, type UiTemporalRange } from '../temporal/control'
import type { UiTemporalInputViewProps } from './index'

export type UiTemporalBoundaryMode =
  | 'bounded'
  | 'start'
  | 'end'
  | 'unrestricted'

/** Canonical time values may encode the following day; the editor displays clocks. */
export function temporalClock(value: string) {
  const match = /^(\d{2}):(.*)$/.exec(value)
  return match && Number(match[1]) >= 24 && Number(match[1]) < 48
    ? String(Number(match[1]) - 24).padStart(2, '0') + ':' + match[2]
    : value
}

/** Shared range editing coordination; native formatting and widgets stay backend-owned. */
export function useUiTemporalRange(props: UiTemporalInputViewProps) {
  const messages = useMessages('temporal')
  const range = computed<UiTemporalRange>(() =>
    props.value && typeof props.value === 'object'
      ? props.value
      : { start: '', end: '' },
  )
  const mode = computed<UiTemporalBoundaryMode>(() =>
    range.value.start === null
      ? range.value.end === null
        ? 'unrestricted'
        : 'end'
      : range.value.end === null
        ? 'start'
        : 'bounded',
  )
  const modes = computed(() => [
    {
      value: 'bounded' as const,
      label: messages.value.rangeBounded,
      symbol: '↔',
    },
    ...(props.options.allowOpenEnd
      ? [
          {
            value: 'start' as const,
            label: messages.value.rangeStartOnly,
            symbol: '→',
          },
        ]
      : []),
    ...(props.options.allowOpenStart
      ? [
          {
            value: 'end' as const,
            label: messages.value.rangeEndOnly,
            symbol: '←',
          },
        ]
      : []),
    ...(props.options.allowOpenStart &&
    props.options.allowOpenEnd &&
    props.options.allowUnrestricted
      ? [
          {
            value: 'unrestricted' as const,
            label: messages.value.rangeUnrestricted,
            symbol: '∞',
          },
        ]
      : []),
  ])
  const retained = new Map<'start' | 'end', string>()
  let reported: string | undefined
  watch(
    () => props.value,
    (value) => {
      if (JSON.stringify(value) !== reported) retained.clear()
      reported = undefined
    },
    { flush: 'sync' },
  )
  function report(value: UiTemporalRange | null) {
    if (props.binding.disabled || props.readonly) return
    reported = JSON.stringify(value)
    void props.update(value)
  }
  function display(side: 'start' | 'end') {
    const value = range.value[side]
    if (value === null) return ''
    if (props.kind === 'time' && side === 'end' && mode.value === 'bounded') {
      const parsed = parseTemporal('time', range.value, {
        range: true,
        precision: props.options.precision,
      })
      if (parsed.ok) return temporalClock(props.display(value))
    }
    return props.display(value)
  }
  const nextDay = computed(() => {
    if (props.kind !== 'time' || mode.value !== 'bounded') return false
    const result = parseTemporal('time', range.value, {
      range: true,
      precision: props.options.precision,
    })
    return (
      result.ok &&
      typeof result.value === 'object' &&
      result.value !== null &&
      Number(result.value.end?.split(':')[0]) >= 24
    )
  })
  function selectMode(value: UiTemporalBoundaryMode) {
    if (
      props.binding.disabled ||
      props.readonly ||
      !modes.value.some((item) => item.value === value) ||
      value === mode.value
    )
      return
    for (const side of ['start', 'end'] as const) {
      if (range.value[side] !== null) retained.set(side, display(side))
    }
    report({
      start:
        value === 'end' || value === 'unrestricted'
          ? null
          : (retained.get('start') ?? ''),
      end:
        value === 'start' || value === 'unrestricted'
          ? null
          : (retained.get('end') ?? ''),
    })
  }
  function updateEndpoint(side: 'start' | 'end', value: string) {
    // Reproject both clocks so changing start recomputes next-day intent.
    report({
      start:
        range.value.start === null
          ? null
          : props.candidate(side === 'start' ? value : display('start')),
      end:
        range.value.end === null
          ? null
          : props.candidate(side === 'end' ? value : display('end')),
    })
  }
  function updateRange(value: { start: string; end: string }) {
    report({
      start: props.candidate(value.start),
      end: props.candidate(value.end),
    })
  }
  function clear() {
    if (props.binding.disabled || props.readonly) return
    retained.clear()
    report(null)
  }
  return {
    range,
    mode,
    modes,
    messages,
    nextDay,
    display,
    selectMode,
    updateEndpoint,
    updateRange,
    clear,
  }
}
