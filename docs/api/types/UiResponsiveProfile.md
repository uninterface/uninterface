# UiResponsiveProfile

Interface exported from `@uninterface/uninterface` and `@uninterface/uninterface/responsive`:

```ts
interface UiResponsiveProfile<Token extends string = string> {
  readonly tokens: readonly Token[]
}
```

A shared responsive vocabulary, independent of its current value and detection algorithm. Create it with [defineUiResponsiveProfile](../functions/defineUiResponsiveProfile.md), which validates its members and freezes a copy. The default generic parameter is `string`; inferred literal types give consumers an exact union.

Use the same profile object in [createUiResponsive](../functions/createUiResponsive.md) and [useUiResponsive](../functions/useUiResponsive.md). Profile identity establishes the expected vocabulary; environment values remain scoped to the Vue application. Definitions can be shared across applications without sharing their reactive sources.

The profile carries no backend properties, thresholds, event listeners, or business data. Declare token meanings in the application/library documentation. Core checks vocabulary and source values, but cannot verify that an external detector correctly implements those meanings. Tests cover immutable definitions, typed inference, valid and invalid source values, and profile matching.
