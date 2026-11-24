import {
  parseTemporal,
  type UiTemporalKind,
  type UiTemporalPrecision,
} from './control'
export interface UiTemporalPresentation {
  locale?: string
  hourCycle?: 'h12' | 'h23'
}
export interface UiTemporalPresentationContext {
  dateFormatWish?: 'YMD' | 'DMY' | 'MDY'
  kind: UiTemporalKind
  locale: string
  precision: UiTemporalPrecision
  hourCycle: 'h12' | 'h23'
}
/** Locale projection with a matching numeric parser; never Date.parse on user text. */
export function temporalPresentation(context: UiTemporalPresentationContext) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    calendar: 'gregory',
    numberingSystem: 'latn',
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC',
    numberingSystem: 'latn',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: context.hourCycle,
    ...(context.precision !== 'minute' ? { second: '2-digit' } : {}),
    ...(context.precision === 'millisecond'
      ? { fractionalSecondDigits: 3 }
      : {}),
  }
  const dateFormat = new Intl.DateTimeFormat(context.locale, dateOptions),
    timeFormat = new Intl.DateTimeFormat(context.locale, timeOptions)
  const dateParts = dateFormat.formatToParts(new Date('2006-11-22T13:04:05Z'))
  const localeOrder = dateParts
    .filter((part) => ['year', 'month', 'day'].includes(part.type))
    .map((part) => part.type)
  const order = context.dateFormatWish
    ? {
        YMD: ['year', 'month', 'day'],
        DMY: ['day', 'month', 'year'],
        MDY: ['month', 'day', 'year'],
      }[context.dateFormatWish]
    : localeOrder
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Recognize the locale's own date literals without accepting arbitrary words.
  const localeDate = new RegExp(
    '^' +
      dateParts
        .map((part) => {
          if (part.type === 'year') return '(\\d{4})'
          if (part.type === 'month' || part.type === 'day') return '(\\d{1,2})'
          return escape(part.value).replace(/\s+/g, '\\s*')
        })
        .join('') +
      '$',
  )
  const periodFormat = new Intl.DateTimeFormat(context.locale, {
    ...timeOptions,
    hourCycle: 'h12',
  })
  const period = (hour: number) =>
    periodFormat
      .formatToParts(new Date(Date.UTC(2006, 10, 22, hour)))
      .find((part) => part.type === 'dayPeriod')
      ?.value.toLocaleLowerCase(context.locale)
  const periods: [string | undefined, 'am' | 'pm'][] = [
    [period(1), 'am'],
    [period(13), 'pm'],
    ['a.m.', 'am'],
    ['p.m.', 'pm'],
    ['am', 'am'],
    ['pm', 'pm'],
  ]
  function formatDate(value: string) {
    const match = /^\d{4}-\d{2}-\d{2}$/.test(value)
    if (!match) return value
    if (context.dateFormatWish) {
      const [year, month, day] = value.split('-')
      return {
        YMD: value,
        DMY: `${day}/${month}/${year}`,
        MDY: `${month}/${day}/${year}`,
      }[context.dateFormatWish]
    }
    const date = new Date(value + 'T00:00:00Z')
    return Number.isNaN(date.getTime()) ? value : dateFormat.format(date)
  }
  function formatTime(value: string) {
    const match = /^(\d{2,4}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value)
    if (!match || Number(match[1]) > 23) return value
    const date = new Date(
      `2000-01-01T${match[1]}:${match[2]}:${match[3] ?? '00'}.${(match[4] ?? '').padEnd(3, '0')}Z`,
    )
    return Number.isNaN(date.getTime()) ? value : timeFormat.format(date)
  }
  function parseDate(value: string) {
    const text = value.trim()
    if (!text) return ''
    // Common numeric separators (or whitespace); month/day order is never guessed.
    const numeric =
      /^(\d{1,4})\s*([/.-])\s*(\d{1,2})\s*\2\s*(\d{1,4})\.?$/.exec(text)
    const spaced = /^(\d{1,4})\s+(\d{1,2})\s+(\d{1,4})$/.exec(text)
    const local = localeDate.exec(text)
    const parts = numeric
      ? [numeric[1]!, numeric[3]!, numeric[4]!]
      : (spaced?.slice(1) ?? local?.slice(1))
    if (!parts) return value
    const keys =
      parts[0]!.length === 4
        ? ['year', 'month', 'day']
        : numeric || spaced
          ? order
          : localeOrder
    const values = Object.fromEntries(keys.map((key, i) => [key, parts[i]]))
    if (values.year?.length !== 4) return value
    return `${values.year}-${values.month!.padStart(2, '0')}-${values.day!.padStart(2, '0')}`
  }
  function parseTime(value: string) {
    let text = value.trim().toLocaleLowerCase(context.locale)
    if (!text) return ''
    let half: 'am' | 'pm' | undefined
    for (const [label, candidate] of periods) {
      if (!label) continue
      if (text.startsWith(label)) {
        half = candidate
        text = text.slice(label.length).trim()
        break
      }
      if (text.endsWith(label)) {
        half = candidate
        text = text.slice(0, -label.length).trim()
        break
      }
    }
    // The dot clock separator is used by locales such as Finnish. Fractions
    // require seconds; never silently discard a malformed or out-of-range unit.
    const match =
      /^(\d{1,4})\s*([:.])\s*(\d{1,2})(?:\s*\2\s*(\d{1,2})(?:\s*[.,]\s*(\d+))?)?$/.exec(
        text,
      )
    if (!match) return value
    let hour = Number(match[1])
    const minute = Number(match[3]),
      second = Number(match[4] ?? 0)
    if (minute > 59 || second > 59) return value
    if (half) {
      if (hour < 1 || hour > 12) return value
      hour = (hour % 12) + (half === 'pm' ? 12 : 0)
    }
    const clock = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    if (context.precision === 'minute') return clock
    const seconds = clock + ':' + String(second).padStart(2, '0')
    if (context.precision === 'second') return seconds
    return seconds + '.' + (match[5] ?? '').slice(0, 3).padEnd(3, '0')
  }
  return {
    format(value: string) {
      if (
        !parseTemporal(context.kind, value, {
          precision: context.precision,
          range: false,
        }).ok
      )
        return value
      if (context.kind === 'date') return formatDate(value)
      if (context.kind === 'time') return formatTime(value)
      const [date, time] = value.split('T')
      return time === undefined
        ? value
        : formatDate(date!) + ' ' + formatTime(time)
    },
    parse(value: string) {
      if (context.kind === 'date') return parseDate(value)
      if (context.kind === 'time') return parseTime(value)
      const text = value.trim()
      if (!text) return ''
      // Retain the old middle-dot spelling for pasted text, but never require
      // it for typing. Ordinary whitespace can also occur within a localized
      // date or AM/PM marker, so find the boundary with a complete date/clock.
      if (/[Tt·]/.test(text)) {
        const parts = text.split(/\s*[Tt·]\s*/)
        return parts.length === 2
          ? parseDate(parts[0]!) + 'T' + parseTime(parts[1]!)
          : value
      }
      for (const gap of text.matchAll(/\s+/g)) {
        const date = parseDate(text.slice(0, gap.index))
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue
        const time = parseTime(text.slice(gap.index! + gap[0].length))
        if (/^\d{2,4}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/.test(time))
          return date + 'T' + time
      }
      return value
    },
  }
}
