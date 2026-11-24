# createUiTimeCodec

Dates, times and intervals: `createUiTimeCodec` is exported from `@uninterface/uninterface`.

## API

```ts
export function createUiTimeCodec(options?: UiTemporalOptions): UiCodec<UiTemporalValue, UiTemporalValue>;
```

## Ownership and implementation

The temporal control owns a field and semantic validation; presentation controls formatting only. Date-only ranges include both endpoint dates; A-to-A is one calendar day. Time and datetime ranges include the start and exclude the end. A null endpoint is explicitly unbounded. UTC editing requires an explicit timezone; a local datetime is not an instant. Keep the control alive for the editing session and dispose it afterward.

See the [dates, times and intervals guide](../../guides/temporal-inputs.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify impossible dates and DST gaps fail, reset restores the baseline, extended-hour time ranges retain their end, and invalid text stays editable.
