# UiCodec

A codec translates between an accepted business value and an editing representation, keeping parsing/formatting out of presentation components.

```ts
interface UiCodec<T, D = string> {
  parse(input: D): UiParseResult<T> | Promise<UiParseResult<T>>
  format(value: T): D
}
```

Import from `@uninterface/uninterface`. `parse` accepts the full editing representation and returns an explicit success/value or failure/issue. Ordinary invalid user input should return failure, not throw. `format` supplies the canonical editing representation used for initialization, explicit validation, and accepted baselines. Parsing may return immediately or resolve asynchronously. Formatting remains synchronous. Both must preserve their documented interpretation for the supplied configuration and must not mutate control state or persist data. Throwing or rejecting signals failure to complete parsing, not ordinary invalid input.

For localized decimal numbers and exact scaled integers, use [createUiNumberCodec](../functions/createUiNumberCodec.md). The [numbers and money guide](../../guides/number-and-money.md) shows how to choose the editing representation and use read-only currency formatting.

`parse` may normalize a value according to the codec's declared policy. For example, a money codec can parse `"567.869"` into 56787 integer cents and format that value as `"567.87"`. Rounding precision, tie-breaking, supported range, and any information loss must be documented by that codec; the library does not impose rounding on every number.

A formatter must produce a representation its parser accepts for supported values. Parsing a formatted value must recover an equivalent business value, and repeating parse-and-format must leave the editing representation unchanged under the codec's equivalence policy. Both functions must remain deterministic for their supplied configuration. Parsing must not silently accept trailing junk. Business configuration supplies locale/currency facts; a backend must not replace the codec with a framework's own coercion. Changes of formatting locale during unfinished editing remain business-managed.

`createUiFieldControl` defaults its editing type to `T` with an identity codec; `UiCodec` itself defaults `D` to string because explicit codecs commonly edit text. Parsing supports asynchronous operations and formatting is synchronous.

Acceptance: valid values round-trip according to the codec's declared normalization, invalid representations remain editable with meaningful issues, and no presentation change determines numeric interpretation.

The shared field control awaits parsing and applies parse-and-format during explicit `await validate()`, before evaluating business rules. A parseable value can be formatted even when a business rule rejects it. Unparseable input remains unchanged. `read()` and automatic feedback checks during `set()` preserve the editing representation. Formatting the draft does not update the accepted baseline or persist data. Codecs supply only `parse` and `format`; application-specific rules remain separate.

Validation and codec issues may be literal strings or [UiMessageDescriptor](UiMessageDescriptor.md) objects. Views resolve descriptors against application resources so existing feedback changes language without revalidation. Literal strings remain unchanged.

Choice groups pass their complete raw value to the codec: string or undefined for UiRadioGroup, and a duplicate-free string array for UiCheckboxGroup. Format returns the same representation. See [choice groups](../../guides/choice-groups.md) for typed single/collection examples and membership dirty comparison.
