import { canonicalLocale } from '../i18n/locale'
import type { UiMessages } from '../i18n/messages'
import type { UiCodec, UiParseResult } from './codec'

export type UiNumberCodecOptions = {
  locale: string
  min?: number
  max?: number
  allowNegative?: boolean
  excessPrecision?: 'round' | 'reject'
} & (
  | { scale: number; maximumFractionDigits?: never }
  | { scale?: never; maximumFractionDigits?: number }
)

export interface UiMoneyFormatOptions {
  locale: string
  currency: string
  scale: number
}

function checkFractionDigits(value: number) {
  if (!Number.isInteger(value) || value < 0 || value > 20)
    throw new RangeError('Fractional digits must be an integer from 0 to 20.')
}

function numberLocale(locale: string) {
  const tag = canonicalLocale(locale)
  if (!Intl.NumberFormat.supportedLocalesOf(tag).length)
    throw new RangeError(
      'The formatting locale is not supported by Intl.NumberFormat.',
    )
  return tag
}

function splitScaledInteger(digits: string, scale: number) {
  if (!scale) return { whole: digits, fraction: '' }
  const padded = digits.padStart(scale + 1, '0')
  return { whole: padded.slice(0, -scale), fraction: padded.slice(-scale) }
}

/** Expand the shortest decimal spelling so editing never needs an exponent. */
function splitNumber(value: number) {
  const [mantissa, exponent = '0'] = String(Math.abs(value)).split('e')
  const [whole, fraction = ''] = mantissa.split('.')
  const digits = whole + fraction
  const point = whole.length + Number(exponent)
  if (point <= 0) return { whole: '0', fraction: '0'.repeat(-point) + digits }
  return {
    whole: digits.slice(0, point).padEnd(point, '0'),
    fraction: digits.slice(point),
  }
}

function decimalText(whole: string, fraction: string) {
  return fraction ? `${whole}.${fraction}` : whole
}

function localeDigits(formatter: Intl.NumberFormat) {
  const integer = formatter
    .formatToParts(9876543210)
    .find(({ type }) => type === 'integer')!.value
  return Array.from(integer).reverse()
}

function localizeDigits(text: string, digits: string[]) {
  return Array.from(text, (digit) => digits[Number(digit)]).join('')
}

function localeSyntax(locale: string) {
  const formatter = new Intl.NumberFormat(numberLocale(locale), {
    useGrouping: false,
    signDisplay: 'always',
  })
  // ECMA-402 partitions the formatted number into semantic parts, including
  // digits, the decimal separator and any bidi literals on the localized sign.
  // https://tc39.es/ecma402/#sec-intl.numberformat.prototype.formattoparts
  const decimal = formatter
    .formatToParts(1.1)
    .find(({ type }) => type === 'decimal')!.value
  const digits = localeDigits(formatter)
  const ascii = new Map(digits.map((digit, index) => [digit, String(index)]))
  const signs = [-1, 1].map((value) => {
    const parts = formatter.formatToParts(value)
    const integer = parts.findIndex(({ type }) => type === 'integer')
    const prefix = parts
      .slice(0, integer)
      .map(({ value }) => value)
      .join('')
    const glyph = parts.find(
      ({ type }) => type === 'minusSign' || type === 'plusSign',
    )!.value
    return {
      negative: value < 0,
      prefix,
      spellings: [prefix, glyph, value < 0 ? '-' : '+'],
    }
  })
  return { decimal, digits, ascii, signs }
}

type NumberIssue = Extract<keyof UiMessages, `number${string}`>
function failure(key: NumberIssue): UiParseResult<never> {
  return { ok: false, issue: { namespace: 'uninterface', key } }
}

/** Localized decimal editing for ordinary numbers and exact scaled integers. */
export function createUiNumberCodec(options: UiNumberCodecOptions) {
  const {
    scale,
    min,
    max,
    allowNegative = true,
    excessPrecision = 'round',
  } = options
  const precision = scale ?? options.maximumFractionDigits ?? 20
  checkFractionDigits(precision)
  if (scale !== undefined && options.maximumFractionDigits !== undefined)
    throw new RangeError('Specify either scale or maximumFractionDigits.')
  if (excessPrecision !== 'round' && excessPrecision !== 'reject')
    throw new RangeError('Invalid excess precision policy.')
  const isSupported =
    scale === undefined ? Number.isFinite : Number.isSafeInteger
  if (
    (min !== undefined && !isSupported(min)) ||
    (max !== undefined && !isSupported(max))
  )
    throw new RangeError(
      'Numeric bounds must use the codec’s value representation.',
    )
  if (min !== undefined && max !== undefined && min > max)
    throw new RangeError('The minimum must not exceed the maximum.')
  const syntax = localeSyntax(options.locale)

  function quantize(
    whole: string,
    fraction: string,
    negative: boolean,
  ): UiParseResult<number> {
    if (fraction.length > precision && excessPrecision === 'reject')
      return failure('numberPrecision')
    whole = whole.replace(/^0+(?=\d)/, '')
    // Reject magnitudes beyond the decimal lengths of MAX_VALUE and
    // MAX_SAFE_INTEGER before constructing a BigInt from the draft.
    if (whole.length > (scale === undefined ? 309 : 16))
      return failure('numberRange')

    // Round the decimal digits before converting to Number. Binary arithmetic
    // would move ties such as 1.005 and lose cents near the safe integer limit.
    const kept = fraction.slice(0, precision).padEnd(precision, '0')
    const roundUp = fraction.length > precision && fraction[precision] >= '5'
    const magnitude = BigInt(whole + kept) + (roundUp ? 1n : 0n)
    const sign = negative && magnitude !== 0n ? '-' : ''
    if (scale !== undefined) {
      const value = Number(sign + magnitude)
      return Number.isSafeInteger(value)
        ? { ok: true, value }
        : failure('numberRange')
    }

    const rounded = splitScaledInteger(String(magnitude), precision)
    const text = decimalText(rounded.whole, rounded.fraction.replace(/0+$/, ''))
    const value = Number(sign + text)
    if (!Number.isFinite(value)) return failure('numberRange')
    // Compare against the shortest round-trip decimal spelling. This accepts
    // ordinary values such as 0.1 while detecting further loss during conversion.
    const represented = splitNumber(value)
    if (decimalText(represented.whole, represented.fraction) !== text)
      return failure('numberRange')
    return { ok: true, value }
  }

  return {
    parse(input): UiParseResult<number> {
      let text = input.trim()
      if (!text) return failure('numberEmpty')
      let negative = false
      for (const sign of syntax.signs) {
        const spelling = sign.spellings.find((prefix) =>
          text.startsWith(prefix),
        )
        if (spelling === undefined) continue
        negative = sign.negative
        text = text.slice(spelling.length)
        break
      }
      const [whole, fraction, ...extra] = Array.from(
        text,
        (digit) => syntax.ascii.get(digit) ?? digit,
      )
        .join('')
        .split(syntax.decimal)
      if (
        extra.length ||
        !whole ||
        /\D/.test(whole) ||
        (fraction !== undefined && (!fraction || /\D/.test(fraction)))
      )
        return failure('numberInvalid')
      if (negative && !allowNegative) return failure('numberNegative')
      const parsed = quantize(whole, fraction ?? '', negative)
      if (!parsed.ok) return parsed
      if (min !== undefined && parsed.value < min)
        return failure('numberMinimum')
      if (max !== undefined && parsed.value > max)
        return failure('numberMaximum')
      return parsed
    },
    format(value) {
      if (!isSupported(value) || (!allowNegative && value < 0))
        throw new RangeError('The value cannot be formatted by this codec.')
      const negative = value < 0
      let parts: { whole: string; fraction: string }
      if (scale !== undefined) {
        parts = splitScaledInteger(String(Math.abs(value)), scale)
      } else {
        const input = splitNumber(value)
        const result = quantize(input.whole, input.fraction, negative)
        if (!result.ok)
          throw new RangeError(
            'The value cannot be formatted at the configured precision.',
          )
        parts = splitNumber(result.value)
        value = result.value
      }
      const fraction = parts.fraction
        ? syntax.decimal + localizeDigits(parts.fraction, syntax.digits)
        : ''
      return (
        (value < 0 ? syntax.signs[0].prefix : '') +
        localizeDigits(parts.whole, syntax.digits) +
        fraction
      )
    },
  } satisfies UiCodec<number>
}

/** Read-only currency display of exact integer minor units. */
export function formatUiMoney(
  value: number,
  options: UiMoneyFormatOptions,
): string {
  const { locale, currency, scale } = options
  checkFractionDigits(scale)
  if (!Number.isSafeInteger(value))
    throw new RangeError('Money must be a safe integer in minor units.')
  const tag = numberLocale(locale)
  const formatter = new Intl.NumberFormat(tag, {
    style: 'currency',
    currency,
    minimumFractionDigits: scale,
    maximumFractionDigits: scale,
  })
  const { whole, fraction } = splitScaledInteger(String(Math.abs(value)), scale)
  const signedWhole = Number(whole) * (value < 0 ? -1 : 1)
  // Keep the signed whole part exact (including -0). Supply fractional digits
  // separately to avoid binary division and preserve every minor unit.
  if (!scale) return formatter.format(signedWhole)
  const digits = localeDigits(
    new Intl.NumberFormat(tag, { useGrouping: false }),
  )
  return formatter
    .formatToParts(signedWhole)
    .map((part) =>
      part.type === 'fraction' ? localizeDigits(fraction, digits) : part.value,
    )
    .join('')
}
