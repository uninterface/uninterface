# UiI18nTranslator

Import this type from `@uninterface/uninterface/i18n`. The namespace-bound result of `useUiI18n<Key>(namespace)` supplies business translation without repetitive forwarding functions.

## API

```ts
interface UiI18nTranslator<Key extends string = string> {
  readonly i18n: UiI18nControl
  t(key: Key, params?: UiMessageDescriptor['params']): string
  lt(key: Key, params?: UiMessageDescriptor['params']): UiTextSource
  msg(key: Key, params?: UiMessageDescriptor['params']): UiMessageDescriptor
}
```

`msg` creates an unresolved descriptor without resource lookup or locale capture. Its consuming application resolves it. `t` translates immediately. `lt` creates a deferred text source resolving against the current locale when read. Unlike unscoped control `text`/`lt`, these functions interpret their string argument as a message key in the selected namespace. All three functions are safe to destructure and preserve the same key/parameter types.

## Ownership and implementation

The application registers resources and supplies its key union. Core supplies namespace/descriptor mapping and delegates to the existing i18n control. `i18n` is that original control, not a new language session. No resource loading, disposal owner or global mutable service is introduced. The generic checks keys at compile time only; missing resources/keys follow the control's runtime errors. Parameters are retained by reference; use reactive parameters or explicit text functions for changing interpolation values.

For a module-level definition supplying a standalone `msg` as well as this translator, use [defineUiI18n](../functions/defineUiI18n.md). Parameters remain a string/number dictionary; required parameter names are not inferred per key.

See [useUiI18n](../functions/useUiI18n.md) and [text-source patterns](../../guides/text-sources.md) for setup, reusable application wrappers and examples.

## Observable verification

Confirm a namespace-bound translator shares the injected control, immediate and lazy text follow locale changes, identically named keys in different namespaces stay distinct, and invalid keys fail TypeScript checks for all three functions, including standalone descriptor creation. The no-argument hook must retain its original control-returning behavior.
