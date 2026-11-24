import type { CorePack } from '../../packs'

export default {
  temporalDate: 'Enter a valid, complete calendar date.',
  temporalTime: 'Enter a valid, complete time.',
  temporalDateTime: 'Enter a valid, complete date and time.',
  temporalPrecision: 'The supplied time exceeds the configured precision.',
  temporalGap: 'This local datetime does not exist in the configured timezone.',
  temporalOverlap:
    'This local datetime is ambiguous in the configured timezone.',
  temporalStart: 'A start boundary is required.',
  temporalEnd: 'An end boundary is required.',
  temporalBoundary: 'Complete the boundary or explicitly open it.',
  temporalUnrestricted: 'An unrestricted interval is not allowed.',
  temporalDateOrder: 'End date must be on or after start date.',
  temporalOrder: 'End must follow start; the end is exclusive.',
  temporalUnavailable: 'This value or interval is unavailable.',
  temporalInvalid: 'Invalid temporal value or timezone configuration.',
  pickDate: 'Choose date',
  pickTime: 'Choose time',
  pickDateTime: 'Choose date and time',
  rangeStart: 'Start',
  rangeDateEnd: 'End (inclusive)',
  rangeEnd: 'End (exclusive)',
  rangeMode: 'Range boundaries',
  rangeBounded: 'Both boundaries',
  rangeStartOnly: 'Start only',
  rangeEndOnly: 'End only',
  rangeUnrestricted: 'Unrestricted',
  rangeNextDay: 'Next day',
  temporalDuration:
    'A time interval must be greater than zero and at most 24 hours.',
  openBoundary: 'Unbounded',
} satisfies CorePack<'temporal'>
