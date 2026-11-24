# UiTemporalPresentation

Dates, times and intervals: `UiTemporalPresentation` is exported from `@uninterface/uninterface`.

## API

```ts
export interface UiTemporalPresentation {
 locale?:string
 hourCycle?:'h12'|'h23'

}
```

## Ownership and implementation

Locale and hourCycle are presentation preferences fulfilled by the backend. Arbitrary display format/parse adapters are not part of this API. Codecs convert between the fixed temporal string representation and business values; they do not determine appearance.

Temporal value, range and session rules are defined in the [temporal guide](../../guides/temporal-inputs.md); this type does not create a control or own its lifetime.

See the [dates, times and intervals guide](../../guides/temporal-inputs.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Change locale and hourCycle while retaining the field value, raw draft and focus. Verify the backend changes display preferences without changing codec or timezone semantics.
