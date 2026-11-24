# formatUiMoney

```ts
function formatUiMoney(value: number, options: UiMoneyFormatOptions): string
```

Import from `@uninterface/uninterface`. Formats a safe integer in the supplied currency's configured minor units for read-only display. The function is synchronous and uses locale-aware currency symbols or codes, grouping, digits and sign placement. The output preserves all supplied minor units, including at the safe integer limits.

```ts
formatUiMoney(1251, { locale: 'de-DE', currency: 'USD', scale: 2 })
```

Supply all fields in [UiMoneyFormatOptions](../types/UiMoneyFormatOptions.md). Invalid formatting options and values outside the safe integer range throw. Currency text may include spaces or direction marks from `Intl`. For editable text, use [createUiNumberCodec](createUiNumberCodec.md) with the same locale and scale.
