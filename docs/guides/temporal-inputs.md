# Dates, times and intervals

Temporal controls distinguish calendar values, wall-clock times and instants. Use createUiDateControl, createUiTimeControl or createUiDateTimeControl to own the field and obtain the matching component binding. A business component creates one control per editing session; its consumer supplies domain data rather than rebuilding codecs and validation. Dispose the control when that session ends.

```ts
import { createUiDateControl, createUiTimeControl, createUiDateTimeControl } from '@uninterface/uninterface'
const birthday = createUiDateControl('2000-02-29')
const shift = createUiTimeControl({ start: '22:00', end: '02:00' }, { range: true })
const appointment = createUiDateTimeControl('2026-10-21T17:00Z', {
  valueMode: 'utc', timeZone: 'America/Los_Angeles', precision: 'minute',
  disambiguation: 'reject',
})
```

```vue
<UiField :field="birthday.field" label="Birthday">
  <UiDateInput :binding="birthday.bindings.dateInput" />
</UiField>
<UiField :field="shift.field" label="Shift" group>
  <UiTimeInput :binding="shift.bindings.timeInput" />
</UiField>
<UiField :field="appointment.field" label="Appointment">
  <UiDateTimeInput :binding="appointment.bindings.dateTimeInput" />
</UiField>
```

Calendar dates use YYYY-MM-DD with years 0001–9999. Time precision is minute by default, or second/millisecond. Raw values are fixed-format temporal strings, independent of visible presentation. Codecs parse those strings into business values and format business values back into those strings; native segment order, separators, month names and input appearance belong to the backend. Incomplete drafts remain invalid editable strings until corrected.

Free-form text editors normalize ordinary user input before passing canonical values to the control. They accept leading/trailing whitespace, repeated whitespace between date and time, spaces around separators, unpadded month/day/clock units, common numeric date separators, and explicit localized or English AM/PM. Numeric day/month order follows the editor's presentation; an explicit four-digit year first is unambiguous. Two-digit years, missing date parts, arbitrary words and timezone suffixes are not inferred. Whitespace-only input clears a scalar editor; in a range it leaves an incomplete endpoint, never an unbounded one.

Extra clock precision is truncated, not rounded: typing `2020-12-30 12:33:32` into a minute editor projects `2020-12-30T12:33`. Second editors discard fractions, and millisecond editors retain the first three fractional digits. Omitted smaller units become zero. Supplied minutes and seconds are checked before truncation, so `12:33:99` is still invalid. Impossible dates and business eligibility rules still fail. The focused text remains editable; blur shows the normalized presentation. This is text-editor behavior, not a relaxation of the canonical codec or a guarantee about browser/toolkit-owned segmented inputs. Business code must continue to provide values at the configured precision.

A date-only range includes both dates. A-to-A is one day; A-to-B includes every instant of B when interpreted as whole days. The precise equivalent is midnight at A through, but excluding, midnight after B—not a cutoff at 23:59:59 that would omit fractional seconds. Converting calendar dates into instants still requires an explicit timezone; a calendar day need not be 24 elapsed hours.

Time and datetime ranges include start and exclude end. Time-only ranges represent more than zero and at most 24 hours. When complete ordinary clocks have end <= start, the end is the following day: 22:00→02:00 normalizes to 22:00→26:00; equal clocks mean 24 hours. The start must be within a day. Explicit extended ends are accepted only within the 24-hour limit and invalid longer values remain visible for correction. Use datetime or another representation for longer intervals. Backends display ordinary clocks with a localized next-day indication. Datetime ranges never infer overnight intent from reversed endpoints; their dates are explicit.

A range is `{ start, end }`. Null endpoints are unbounded only when allowOpenStart/allowOpenEnd permit them; empty strings mean unfinished input. Both unbounded additionally requires allowUnrestricted. Null as the entire value means no supplied value, distinct from an unrestricted interval. `allowEmptyRange` permits equal datetime endpoints only. Domain requiredness belongs in a validation rule.

`allowed` accepts a synchronous predicate or `{ values, otherwise }` lookup. Datetime additionally supports dateAllowed and timeAllowed against its displayed local parts. `rangeAllowed` checks interval business rules. Endpoint eligibility alone does not prove every instant in the interval is allowed. Do not enumerate an unbounded timeline to implement validation.

Local datetime values carry no zone suffix. UTC values end in Z; editing them requires an explicit timeZone, either IANA or a fixed offset. DST gaps fail. Overlaps reject by default, with explicit earlier/later choices. `defaultTime` can supply a time for a date-only datetime entry. No implicit system-timezone conversion is used for instant codecs.

createUiDateCodec/createUiTimeCodec validate canonical strings and optional ranges. createUiDateTimeCodec additionally supports output date, unixSeconds and unixMilliseconds. Pass the codec to the owning control when business values differ from editing strings. For example:

```ts
import { createUiDateTimeCodec } from '@uninterface/uninterface'
const instantOptions = { valueMode: 'utc', timeZone: 'UTC' } as const
const codec = createUiDateTimeCodec({ ...instantOptions, output: 'date' })
const recorded = createUiDateTimeControl(new Date('2026-10-21T17:00:00Z'), {
  ...instantOptions, codec,
})
```

Presentation may specify locale or hourCycle. It never changes canonical value formats, eligibility or timezone meaning. There is no custom display format/parse callback. Each backend translates its editing UI into the fixed raw representation, preserving unfinished drafts. Alt+ArrowDown requests a picker where supported; popup dismissal and native browser limitations remain backend-specific.

UiDateInput and UiDateTimeInput also accept `date-format-wish="YMD"`, `"DMY"` or `"MDY"` as a numeric date-order preference where supported. Omission uses the presentation locale. Verify the selected backend's display and input interpretation; this preference does not change the business value's canonical format or timezone.

Backends use compatible range/segment editors or lossless endpoint compositions. Values a native widget cannot represent, including unsupported precision, must retain a lossless editing path. Segment synchronization belongs to the backend; shared temporal controls own normalization and validation. Concrete limits and fallbacks belong in backend documentation.

Where a range picker is available, partial calendar selection remains a picker draft until an accepted complete selection. Date selection preserves endpoint time precision. Panels preserve dismissal and keyboard access. Same-day-only picker facilities cannot represent overnight intervals without adaptation; backend documentation states the chosen integration.

When unbounded endpoints are permitted, one leading boundary selector offers the allowed modes: both specified, start only, end only, unrestricted. Both specified is the default for an empty editor; existing values determine their mode. Menu/select presentation, endpoint arrangement and narrow-width adaptation remain backend-owned. Unbounded endpoints and next-day intervals need accessible identification. Switching modes restores retained drafts within the editing session. External value changes/reset and Clear discard those drafts. Clear produces an absent whole value; it never selects unrestricted. All actions obey disabled/readonly. One outer frame remains throughout; native range surfaces and fallback endpoint compositions share its presentation.

Observable checks include leap dates, inclusive single-day ranges, overnight/equal-clock ranges, over-24-hour rejection, precision, DST gaps/overlaps, timezone projection, all allowed boundary modes, preserved partial drafts, reset and codec round trips. DOM checks establish behavior; browser acceptance establishes layout, native keyboard/touch operation and paint.

Use `presentation` to customize the time display without changing its canonical business value:

```vue
<UiTimeInput
  :binding="clock.bindings.timeInput"
  :presentation="{ locale: 'en-US', hourCycle: 'h12' }"
/>
```

To verify an enabled range kind, exercise every boundary mode offered by its definition. Adapter-owned popups participate through the [control-frame contract](control-frames.md); browser-owned picker UI follows native focus behavior.
