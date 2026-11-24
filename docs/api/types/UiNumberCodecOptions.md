# UiNumberCodecOptions

Import from `@uninterface/uninterface`. Options for [createUiNumberCodec](../functions/createUiNumberCodec.md). Supply a formatting locale and choose at most one precision option.

| Option | Type and default | Behavior |
|---|---|---|
| `locale` | Required `string` | Formatting locale supported by `Intl.NumberFormat`. Accepts BCP 47 tags and underscores as separators. Locale data and numbering systems come from the runtime's `Intl` implementation. |
| `scale` | Optional integer from 0 to 20 | Multiply the edited value by `10 ** scale` to store it as a safe integer. A scale of 2 stores `12.50` as `1250`. Scale 0 selects whole-number storage. |
| `maximumFractionDigits` | Optional integer from 0 to 20, defaults to 20 without `scale` | Round or reject input at this precision and return an ordinary finite JavaScript number. Mutually exclusive with `scale`. |
| `excessPrecision` | `'round'` (default) or `'reject'` | Round to nearest with ties away from zero, or reject inputs with more fractional digits than configured. |
| `min`, `max` | Optional `number` | Inclusive parse bounds evaluated after quantization. Use safe integer stored units when `scale` is set and finite ordinary numbers otherwise. When both are supplied, `min` must be at most `max`. |
| `allowNegative` | Optional `boolean`, defaults to `true` | Set to `false` to reject a minus sign in an otherwise valid draft before rounding, including one that would round to zero. Formatting then requires a nonnegative value. |

The application selects sign policy, precision, and bounds for the field. Requiredness, optional absence, and rules involving other values belong to the consuming composition.
