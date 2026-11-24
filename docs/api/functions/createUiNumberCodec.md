# createUiNumberCodec

```ts
function createUiNumberCodec(options: UiNumberCodecOptions): {
  parse(input: string): UiParseResult<number>
  format(value: number): string
}
```

Import from `@uninterface/uninterface`. Creates a synchronous [UiCodec](../types/UiCodec.md) for a text draft. Use it with [createUiFieldControl](createUiFieldControl.md) or call its methods directly. The [options](../types/UiNumberCodecOptions.md) select a formatting locale and the numeric representation. A codec keeps the locale it was created with and requires no injected application context.

`parse` consumes an entire ungrouped decimal. The locale determines the decimal separator, native digits, and sign glyphs. The parser also accepts ASCII digits and a leading ASCII plus or minus. It trims outer whitespace. Supply at least one integer digit and, if a decimal separator is present, at least one fractional digit. For example, the `de-DE` codec accepts `12,50`. Grouping, internal whitespace, exponent notation, currency symbols, alternate decimal separators, and nonnumeric suffixes are unsupported.

Parsing rounds excess fractional places by default in decimal arithmetic, to nearest with ties away from zero. Use `excessPrecision: 'reject'` to reject excess digits, including trailing zeros. Inclusive bounds apply to the rounded value in the codec's output units. Blank text, malformed or incomplete text, unsupported precision or range, and configured sign or bound violations return built-in message descriptors. A consuming composition can map blank drafts to its own absence value before delegating to `parse`.

`format` emits localized, ungrouped editing text. A scaled integer always uses exactly `scale` fractional places. An ordinary number uses up to `maximumFractionDigits` with trailing fractional zeros omitted. Formatting normalizes negative zero to zero, applies the configured precision policy, and can render values outside configured bounds for subsequent validation. Invalid options, unsupported values, and unformattable values throw. See [numbers and money](../../guides/number-and-money.md) for round-trip guarantees and field examples.
