import type { UiMessageDescriptor } from '../i18n/types'
import { shallowRef } from 'vue'
import { createUiFieldControl, type UiFieldControl } from '../controls/field'
import type { UiCodec, UiParseResult } from '../controls/codec'
import type { UiValidationRule } from '../controls/validation'
import { uiDefaultInputEquals } from '../controls/value'

export type UiTemporalKind = 'date' | 'time' | 'datetime'
export type UiTemporalPrecision = 'minute' | 'second' | 'millisecond'
export interface UiTemporalRange<T = string> {
  start: T | null
  end: T | null
}
export type UiTemporalValue<T = string> = T | UiTemporalRange<T> | null
export type UiTemporalEligibility =
  | ((value: string) => boolean)
  | { values: Readonly<Record<string, boolean>>; otherwise: boolean }
export interface UiTemporalOptions {
  range?: boolean
  precision?: UiTemporalPrecision
  valueMode?: 'local' | 'utc'
  timeZone?: string
  disambiguation?: 'reject' | 'earlier' | 'later'
  defaultTime?: string
  allowOpenStart?: boolean
  allowOpenEnd?: boolean
  allowUnrestricted?: boolean
  allowEmptyRange?: boolean
  allowed?: UiTemporalEligibility
  dateAllowed?: UiTemporalEligibility
  timeAllowed?: UiTemporalEligibility
  rangeAllowed?: (range: UiTemporalRange) => boolean
}
export interface UiTemporalInputBinding<T = unknown> {
  readonly kind: UiTemporalKind
  readonly field: UiFieldControl<T, UiTemporalValue>
  readonly options: Readonly<UiTemporalOptions>
  readonly disabled: boolean
  /** Canonical values to local wall-clock projection, preserving the instant. */
  display(value: string): string
  candidate(value: string): string
  eligible(value: string): boolean
  set(value: UiTemporalValue): Promise<void>
  validate(): Promise<boolean>
}
export interface UiTemporalControl<T = UiTemporalValue> {
  readonly field: UiFieldControl<T, UiTemporalValue>
  readonly bindings: {
    dateInput?: UiTemporalInputBinding<T>
    timeInput?: UiTemporalInputBinding<T>
    dateTimeInput?: UiTemporalInputBinding<T>
  }
  dispose(): void
}
const pad = (value: number, length = 2) => String(value).padStart(length, '0')
function calendar(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new Error('Enter a complete calendar date.')
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(0)
  date.setUTCFullYear(year!, month! - 1, day!)
  date.setUTCHours(0, 0, 0, 0)
  if (
    year! < 1 ||
    month! < 1 ||
    month! > 12 ||
    day! < 1 ||
    date.getUTCMonth() !== month! - 1 ||
    date.getUTCDate() !== day
  )
    throw new Error('Enter a valid calendar date.')
  return date
}
function time(value: string, precision: UiTemporalPrecision, extended = false) {
  const match = /^(\d{2,4}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value)
  if (!match) throw new Error('Enter a complete time.')
  const hour = Number(match[1]),
    minute = Number(match[2]),
    second = Number(match[3] ?? 0),
    ms = Number((match[4] ?? '').padEnd(3, '0'))
  if ((!extended && hour > 23) || minute > 59 || second > 59)
    throw new Error('Enter a valid time.')
  if (
    (precision === 'minute' && (second || ms)) ||
    (precision === 'second' && ms)
  )
    throw new Error('The supplied time exceeds the configured precision.')
  return {
    hour,
    minute,
    second,
    ms,
    text: `${pad(hour)}:${pad(minute)}${precision === 'minute' ? '' : ':' + pad(second)}${precision === 'millisecond' ? '.' + pad(ms, 3) : ''}`,
  }
}
/** Time-only ranges are clock intervals of more than zero and at most 24 hours. */
function normalizeTimeRange(
  range: UiTemporalRange,
  precision: UiTemporalPrecision,
) {
  const start = range.start === null ? null : time(range.start, precision)
  const end = range.end === null ? null : time(range.end, precision, true)
  if (!start || !end) {
    if (end && end.hour > 23)
      throw new Error('An unbounded time interval requires clock times.')
    return
  }
  const ms = (v: ReturnType<typeof time>) =>
    ((v.hour * 60 + v.minute) * 60 + v.second) * 1000 + v.ms
  if (end.hour < 24 && ms(end) <= ms(start)) {
    end.hour += 24
    range.end =
      String(end.hour).padStart(2, '0') + end.text.slice(end.text.indexOf(':'))
  }
  const duration = ms(end) - ms(start)
  if (duration <= 0 || duration > 86400000)
    throw new Error(
      'A time interval must be greater than zero and at most 24 hours.',
    )
}

function localDateTime(
  value: string,
  precision: UiTemporalPrecision,
  defaultTime?: string,
) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value) && defaultTime)
    value += 'T' + defaultTime
  const split = value.split('T')
  if (split.length !== 2) throw new Error('Enter a complete date and time.')
  const date = calendar(split[0]!),
    clock = time(split[1]!, precision, true)
  date.setUTCHours(clock.hour, clock.minute, clock.second, clock.ms)
  if (date.getUTCFullYear() > 9999)
    throw new Error('Datetime exceeds the supported calendar.')
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}${precision === 'minute' ? '' : ':' + pad(date.getUTCSeconds())}${precision === 'millisecond' ? '.' + pad(date.getUTCMilliseconds(), 3) : ''}`
}
function fixedOffset(zone: string): number | undefined {
  if (zone === 'UTC' || zone === 'Z') return 0
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(zone)
  if (!match) return undefined
  const hours = Number(match[2]),
    minutes = Number(match[3])
  if (hours > 23 || minutes > 59)
    throw new Error('Invalid fixed timezone offset.')
  return (match[1] === '-' ? -1 : 1) * (hours * 60 + minutes) * 60000
}
export function projectInstant(
  instant: number,
  zone: string,
  precision: UiTemporalPrecision,
): string {
  const fixed = fixedOffset(zone)
  let date: Date
  if (fixed !== undefined) date = new Date(instant + fixed)
  else {
    const parts = new Intl.DateTimeFormat('en-CA-u-ca-iso8601-nu-latn', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(instant))
    const get = (key: string) => parts.find((part) => part.type === key)!.value
    date = new Date(
      `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}.${pad(((instant % 1000) + 1000) % 1000, 3)}Z`,
    )
  }
  return localDateTime(date.toISOString().slice(0, -1), 'millisecond').slice(
    0,
    precision === 'minute' ? 16 : precision === 'second' ? 19 : 23,
  )
}
export function resolveLocal(
  value: string,
  zone: string,
  disambiguation: 'reject' | 'earlier' | 'later' = 'reject',
): number {
  const canonical = localDateTime(value, 'millisecond'),
    wall = Date.parse(canonical + 'Z'),
    fixed = fixedOffset(zone)
  if (fixed !== undefined) return wall - fixed
  // Offset candidates are bounded samples around the date, not an enumeration of the time domain.
  const offsets = new Set<number>()
  for (let hours = -48; hours <= 48; hours += 6) {
    const sample = wall + hours * 3600000
    offsets.add(
      Date.parse(projectInstant(sample, zone, 'millisecond') + 'Z') - sample,
    )
  }
  const matches = [...offsets]
    .map((offset) => wall - offset)
    .filter(
      (candidate) =>
        projectInstant(candidate, zone, 'millisecond') === canonical,
    )
    .sort((a, b) => a - b)
  if (matches.length === 0)
    throw new Error(
      'This local datetime does not exist in the configured timezone.',
    )
  if (matches.length > 1 && disambiguation === 'reject')
    throw new Error(
      'This local datetime is ambiguous in the configured timezone.',
    )
  return disambiguation === 'later' ? matches[matches.length - 1]! : matches[0]!
}
function permits(rule: UiTemporalEligibility | undefined, value: string) {
  if (!rule) return true
  const result =
    typeof rule === 'function'
      ? rule(value)
      : Object.hasOwn(rule.values, value)
        ? rule.values[value]
        : rule.otherwise
  if (typeof result !== 'boolean')
    throw new Error('Temporal eligibility must return a synchronous boolean.')
  return result
}
function canonical(
  kind: UiTemporalKind,
  value: string,
  options: UiTemporalOptions,
): string {
  const precision = options.precision ?? 'minute'
  if (kind === 'date') {
    calendar(value)
    return value
  }
  if (kind === 'time') return time(value, precision, options.range).text
  if (options.valueMode === 'utc') {
    if (value.endsWith('Z'))
      return (
        localDateTime(value.slice(0, -1), precision, options.defaultTime) + 'Z'
      )
    if (!options.timeZone)
      throw new Error('UTC datetime editing requires an explicit timeZone.')
    const local = localDateTime(value, precision, options.defaultTime)
    return (
      projectInstant(
        resolveLocal(local, options.timeZone, options.disambiguation),
        'UTC',
        precision,
      ) + 'Z'
    )
  }
  if (/Z$|[+-]\d{2}:\d{2}$/.test(value))
    throw new Error('Local datetime must not contain a zone suffix.')
  return localDateTime(value, precision, options.defaultTime)
}
function displayed(
  kind: UiTemporalKind,
  value: string,
  options: UiTemporalOptions,
) {
  if (kind === 'datetime' && options.valueMode === 'utc' && value.endsWith('Z'))
    return projectInstant(
      Date.parse(value),
      options.timeZone ?? 'UTC',
      options.precision ?? 'minute',
    )
  return value
}
function eligible(
  kind: UiTemporalKind,
  value: string,
  options: UiTemporalOptions,
) {
  const wall = displayed(kind, value, options)
  return (
    permits(options.allowed, value) &&
    (kind === 'datetime'
      ? permits(options.dateAllowed, wall.split('T')[0]!) &&
        permits(options.timeAllowed, wall.split('T')[1]!)
      : true)
  )
}
export function parseTemporal(
  kind: UiTemporalKind,
  input: UiTemporalValue,
  options: UiTemporalOptions,
): UiParseResult<UiTemporalValue> {
  try {
    if (input === null || input === '') return { ok: true, value: null }
    if (options.range) {
      if (
        typeof input !== 'object' ||
        !Object.hasOwn(input, 'start') ||
        !Object.hasOwn(input, 'end')
      )
        throw new Error('A range requires start and end members.')
      const { start, end } = input
      if (start === null && end === null && !options.allowUnrestricted)
        throw new Error('An unrestricted interval is not allowed.')
      if (start === null && !options.allowOpenStart)
        throw new Error('A start boundary is required.')
      if (end === null && !options.allowOpenEnd)
        throw new Error('An end boundary is required.')
      if (start === '' || end === '')
        throw new Error('Complete the boundary or explicitly open it.')
      const range = {
        start: start === null ? null : canonical(kind, start, options),
        end: end === null ? null : canonical(kind, end, options),
      }
      if (kind === 'time')
        normalizeTimeRange(range, options.precision ?? 'minute')
      if (range.start !== null && !eligible(kind, range.start, options))
        throw new Error('The start boundary is unavailable.')
      if (range.end !== null && !eligible(kind, range.end, options))
        throw new Error('The end boundary is unavailable.')
      if (
        kind !== 'time' &&
        range.start !== null &&
        range.end !== null &&
        (range.start > range.end ||
          (kind === 'datetime' &&
            !options.allowEmptyRange &&
            range.start === range.end))
      )
        throw new Error(
          kind === 'date'
            ? 'End date must be on or after start date.'
            : 'End must follow start; the end is exclusive.',
        )
      if (options.rangeAllowed && !options.rangeAllowed(range))
        throw new Error('This interval is unavailable.')
      return { ok: true, value: range }
    }
    if (typeof input !== 'string')
      throw new Error('A scalar temporal input requires a string.')
    const value = canonical(kind, input, options)
    if (!eligible(kind, value, options))
      throw new Error('This value is unavailable.')
    return { ok: true, value }
  } catch (error) {
    return {
      ok: false,
      issue: temporalIssue(error),
    }
  }
}
export function createUiDateCodec(
  options: UiTemporalOptions = {},
): UiCodec<UiTemporalValue, UiTemporalValue> {
  return {
    parse: (input) => parseTemporal('date', input, options),
    format: (value) => value,
  }
}
export function createUiTimeCodec(
  options: UiTemporalOptions = {},
): UiCodec<UiTemporalValue, UiTemporalValue> {
  return {
    parse: (input) => parseTemporal('time', input, options),
    format: (value) => value,
  }
}
export function createUiDateTimeCodec(
  options: UiTemporalOptions & { output: 'date' },
): UiCodec<UiTemporalValue<Date>, UiTemporalValue>
export function createUiDateTimeCodec(
  options: UiTemporalOptions & { output: 'unixSeconds' | 'unixMilliseconds' },
): UiCodec<UiTemporalValue<number>, UiTemporalValue>
export function createUiDateTimeCodec(
  options?: UiTemporalOptions & { output?: 'string' },
): UiCodec<UiTemporalValue, UiTemporalValue>
export function createUiDateTimeCodec(
  options: UiTemporalOptions & {
    output?: 'string' | 'date' | 'unixSeconds' | 'unixMilliseconds'
  } = {},
): UiCodec<any, UiTemporalValue> {
  const output = options.output ?? 'string'
  function convert(value: string) {
    if (output === 'string') return value
    const epoch = value.endsWith('Z')
      ? Date.parse(value)
      : options.timeZone
        ? resolveLocal(value, options.timeZone, options.disambiguation)
        : NaN
    if (!Number.isFinite(epoch))
      throw new Error('Instant conversion requires an explicit timezone.')
    return output === 'date'
      ? new Date(epoch)
      : output === 'unixSeconds'
        ? epoch / 1000
        : epoch
  }
  function format(value: Date | number | string): string {
    if (output === 'string') return value as string
    const epoch =
      output === 'date'
        ? (value as Date).getTime()
        : Number(value) * (output === 'unixSeconds' ? 1000 : 1)
    if (!Number.isFinite(epoch)) throw new Error('Invalid instant.')
    if (options.valueMode === 'utc')
      return projectInstant(epoch, 'UTC', options.precision ?? 'minute') + 'Z'
    if (!options.timeZone)
      throw new Error('Instant formatting requires an explicit timezone.')
    return projectInstant(
      epoch,
      options.timeZone,
      options.precision ?? 'minute',
    )
  }
  return {
    parse(input) {
      const result = parseTemporal('datetime', input, options)
      if (!result.ok) return result
      try {
        const value = result.value
        return {
          ok: true,
          value:
            value === null
              ? null
              : typeof value === 'string'
                ? convert(value)
                : {
                    start: value.start === null ? null : convert(value.start),
                    end: value.end === null ? null : convert(value.end),
                  },
        }
      } catch (error) {
        return { ok: false, issue: temporalIssue(error) }
      }
    },
    format(value) {
      return value === null
        ? null
        : typeof value === 'object' && !(value instanceof Date)
          ? {
              start: value.start === null ? null : format(value.start),
              end: value.end === null ? null : format(value.end),
            }
          : format(value)
    },
  }
}
function createTemporal<T>(
  kind: UiTemporalKind,
  initial: T,
  options: UiTemporalOptions & {
    codec?: UiCodec<T, UiTemporalValue>
    rules?: UiValidationRule<T>[]
  },
): UiTemporalControl<T> {
  const definition = Object.freeze({ ...options })
  const base: UiCodec<any, UiTemporalValue> = options.codec ?? {
    parse: (input: UiTemporalValue) => ({ ok: true, value: input }),
    format: (value: UiTemporalValue) => value,
  }
  const codec: UiCodec<T, UiTemporalValue> = {
    async parse(input) {
      const result = parseTemporal(kind, input, definition)
      if (!result.ok) return result
      return base.parse(result.value)
    },
    format: base.format,
  }
  const field = createUiFieldControl(initial, codec, options.rules ?? [], {
    inputEquals(a, b) {
      const left = parseTemporal(kind, a, definition),
        right = parseTemporal(kind, b, definition)
      return left.ok && right.ok
        ? uiDefaultInputEquals(left.value, right.value)
        : uiDefaultInputEquals(a, b)
    },
  })
  const disposed = shallowRef(false)
  const binding: UiTemporalInputBinding<T> = {
    kind,
    field,
    options: definition,
    get disabled() {
      return disposed.value || field.state.effectiveDisabled
    },
    display(value) {
      try {
        return displayed(kind, value, definition)
      } catch {
        return value
      }
    },
    candidate(value) {
      try {
        return canonical(kind, value, definition)
      } catch {
        return value
      }
    },
    eligible(value) {
      try {
        const normalized = canonical(kind, value, definition)
        return eligible(kind, normalized, definition)
      } catch {
        return false
      }
    },
    async set(value) {
      if (!binding.disabled) await field.set(value)
    },
    validate: field.validate,
  }
  return {
    field,
    bindings: {
      [kind === 'date'
        ? 'dateInput'
        : kind === 'time'
          ? 'timeInput'
          : 'dateTimeInput']: binding,
    },
    dispose() {
      disposed.value = true
    },
  }
}
export function createUiDateControl<T = UiTemporalValue>(
  initial: T,
  options: UiTemporalOptions & {
    codec?: UiCodec<T, UiTemporalValue>
    rules?: UiValidationRule<T>[]
  } = {},
): UiTemporalControl<T> & {
  bindings: { dateInput: UiTemporalInputBinding<T> }
} {
  return createTemporal('date', initial, options) as any
}
export function createUiTimeControl<T = UiTemporalValue>(
  initial: T,
  options: UiTemporalOptions & {
    codec?: UiCodec<T, UiTemporalValue>
    rules?: UiValidationRule<T>[]
  } = {},
): UiTemporalControl<T> & {
  bindings: { timeInput: UiTemporalInputBinding<T> }
} {
  return createTemporal('time', initial, options) as any
}
export function createUiDateTimeControl<T = UiTemporalValue>(
  initial: T,
  options: UiTemporalOptions & {
    codec?: UiCodec<T, UiTemporalValue>
    rules?: UiValidationRule<T>[]
  } = {},
): UiTemporalControl<T> & {
  bindings: { dateTimeInput: UiTemporalInputBinding<T> }
} {
  return createTemporal('datetime', initial, options) as any
}

const temporalIssueKeys: Record<string, string> = {
  'A time interval must be greater than zero and at most 24 hours.':
    'temporalDuration',
  'An unbounded time interval requires clock times.': 'temporalTime',
  'Enter a complete calendar date.': 'temporalDate',
  'Enter a valid calendar date.': 'temporalDate',
  'Enter a complete time.': 'temporalTime',
  'Enter a valid time.': 'temporalTime',
  'Enter a complete date and time.': 'temporalDateTime',
  'The supplied time exceeds the configured precision.': 'temporalPrecision',
  'This local datetime does not exist in the configured timezone.':
    'temporalGap',
  'This local datetime is ambiguous in the configured timezone.':
    'temporalOverlap',
  'A start boundary is required.': 'temporalStart',
  'An end boundary is required.': 'temporalEnd',
  'Complete the boundary or explicitly open it.': 'temporalBoundary',
  'An unrestricted interval is not allowed.': 'temporalUnrestricted',
  'End date must be on or after start date.': 'temporalDateOrder',
  'End must follow start; the end is exclusive.': 'temporalOrder',
  'This value is unavailable.': 'temporalUnavailable',
  'This interval is unavailable.': 'temporalUnavailable',
  'The start boundary is unavailable.': 'temporalUnavailable',
  'The end boundary is unavailable.': 'temporalUnavailable',
}
function temporalIssue(error: unknown): UiMessageDescriptor {
  return {
    namespace: 'uninterface',
    key:
      error instanceof Error
        ? (temporalIssueKeys[error.message] ?? 'temporalInvalid')
        : 'temporalInvalid',
  }
}
