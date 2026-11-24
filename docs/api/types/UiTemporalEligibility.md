# UiTemporalEligibility

Dates, times and intervals: `UiTemporalEligibility` is exported from `@uninterface/uninterface`.

## API

```ts
export type UiTemporalEligibility=((value:string)=>boolean)|{values:Readonly<Record<string,boolean>>;otherwise:boolean}
```

## Ownership and implementation

Temporal value, range and session rules are defined in the [temporal guide](../../guides/temporal-inputs.md); this type does not create a control or own its lifetime.

See the [dates, times and intervals guide](../../guides/temporal-inputs.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify impossible dates and DST gaps fail, reset restores the baseline, extended-hour time ranges retain their end, and invalid text stays editable.
