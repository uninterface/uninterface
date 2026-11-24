# UiMoneyFormatOptions

Import from `@uninterface/uninterface`. Required options for [formatUiMoney](../functions/formatUiMoney.md).

| Option | Type | Meaning |
|---|---|---|
| `locale` | `string` | Formatting locale supported by `Intl.NumberFormat`. Accepts BCP 47 tags and underscores as separators. |
| `currency` | `string` | The application's three-letter currency code as accepted by `Intl.NumberFormat`. The locale does not select this value. |
| `scale` | `number` | Fractional places represented by the input integer, from 0 to 20. Match the application's storage and editing policy. |

For example, use `currency: 'JPY', scale: 0` for whole yen or `currency: 'KWD', scale: 3` for thousandths of a Kuwaiti dinar. The formatter uses the supplied scale even when it differs from the currency's customary display precision.
