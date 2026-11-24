# UiMessageContext

Import from `@uninterface/uninterface/i18n`. Supplied to a message function.

- `locale: string`: effective message resource locale.
- `params: Readonly<Record<string, string | number>>`: named arguments, default empty.
- `plural(count, forms): string`: forms keyed by Intl plural category; `other` is required. Uses `Intl.PluralRules(locale)`.
- `number(value, options?): string`: number formatting using the independent application formatting locale.

Authors interpolate values with ordinary TypeScript; Uninterface does not invent a message syntax. Verification must include one/other behavior and a language with additional categories when that language is added.
