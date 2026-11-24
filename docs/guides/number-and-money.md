# Edit numbers and monetary amounts

Use [createUiNumberCodec](../api/functions/createUiNumberCodec.md) with a text field. Choose an ordinary number for quantities measured in the units shown, or add a `scale` when the application stores an exact integer in smaller units. A value such as `12,50` can represent 12.5 measurement units or 1250 minor units, depending on that choice.

```ts
import {
  createUiFieldControl,
  createUiNumberCodec,
  formatUiMoney,
} from '@uninterface/uninterface'

const locale = 'de-DE'
const measurement = createUiNumberCodec({ locale, maximumFractionDigits: 2 })
measurement.parse('12,506') // { ok: true, value: 12.51 }

const scale = 2
const currency = 'USD'
const amountCodec = createUiNumberCodec({ locale, scale, min: 0 })
const amount = createUiFieldControl(1250, amountCodec)

await amount.set('12,506')
await amount.validate() // true; the draft becomes '12,51'
const result = await amount.read()
if (result.ok) {
  formatUiMoney(result.value, { locale, currency, scale })
}
```

In a Vue form, bind `amount` to `UiField` and use `UiTextInput` with `inputmode="decimal"` inside it. The text input forwards the draft. The codec owns its interpretation and the field owns validation and normalization. A form submits the parsed typed value. Reset restores the accepted baseline. See [asynchronous validation](validation.md) for the lifetime and submission behavior.

## Choose the editing policy

The formatting locale selects the decimal separator. English (United States) uses `12.50`, German uses `12,50`, and Arabic (Egypt) can use `١٢٫٥٠`. Grouped numbers and pasted currency text are outside the editing syntax. Currency and message language are application choices independent of the formatting locale. If the application changes formatting locale, resolve any unfinished draft before creating a codec for the new locale. Existing issue descriptors can change language without revalidation. See the [internationalization contract](../contracts/i18n.md).

Both representations round excess fractional digits by default, with ties away from zero. Set `excessPrecision: 'reject'` for a field that must reject extra decimal places. `min` and `max` constrain the parsed result in stored units after rounding. A scaled codec with `scale: 2, max: 1000` therefore accepts `10,004` in `de-DE` and rejects `10,005`. Use field or form rules for conditional limits and rules involving other values. For optional fields, explicitly map a blank draft to the appropriate absence value before calling the codec.

## Verify the stored value

Scaled mode preserves safe integers exactly during editing and currency display. Ordinary mode uses the shortest decimal spelling that round-trips to a finite JavaScript number. If conversion to `number` would change the already-rounded decimal spelling, the codec returns an issue. A supported value round-trips through editing within the configured precision and bounds. Use scaled mode for exact minor units and retain the currency separately in the business data or policy.

Check that invalid or incomplete text stays visible and blocks saving, correcting it submits the expected number or minor units, and reset returns to the accepted value. Include cases at rounding and bound thresholds and exercise the formatting locale your application supplies.
