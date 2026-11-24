# UiTemporalOptions

Dates, times and intervals: `UiTemporalOptions` is exported from `@uninterface/uninterface`.

## API

```ts
export interface UiTemporalOptions {
 range?:boolean
 precision?:UiTemporalPrecision
 valueMode?:'local'|'utc'
 timeZone?:string
 disambiguation?:'reject'|'earlier'|'later'
 defaultTime?:string
 allowOpenStart?:boolean
 allowOpenEnd?:boolean
 allowUnrestricted?:boolean
 allowEmptyRange?:boolean
 allowed?:UiTemporalEligibility
 dateAllowed?:UiTemporalEligibility
 timeAllowed?:UiTemporalEligibility
 rangeAllowed?:(range:UiTemporalRange)=>boolean
}
```

`allowEmptyRange` applies to datetime ranges only. Equal date boundaries describe one included day; equal clock boundaries describe 24 hours. Time-only ranges have a within-day start and a positive duration no greater than 24 hours; an end clock at or before start means the following day. Explicit canonical ends such as 26:00 remain valid within that limit. Open time boundaries use ordinary 00:00–23:59 clock values. Longer intervals require datetime or another representation.

## Ownership and implementation

Temporal value, range and session rules are defined in the [temporal guide](../../guides/temporal-inputs.md); this type does not create a control or own its lifetime.

See the [dates, times and intervals guide](../../guides/temporal-inputs.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify impossible dates and DST gaps fail, reset restores the baseline, extended-hour time ranges retain their end, and invalid text stays editable.
