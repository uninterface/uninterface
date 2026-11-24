# UiResponsiveContext

`type UiResponsiveContext = string`, exported from `@uninterface/uninterface` and `@uninterface/uninterface/responsive`, describes a token from the installed responsive vocabulary. [useUiResponsive()](../functions/useUiResponsive.md) cannot infer an application's configuration from an import, so its unqualified return type makes no assumption about which tokens may arrive.

The built-in detector supplies `desktop` or `mobile`. Additional or different tokens are declared with [defineUiResponsiveProfile](../functions/defineUiResponsiveProfile.md) and supplied through [createUiResponsive](../functions/createUiResponsive.md). Runtime validation remains finite and strict: arbitrary detector strings are not accepted merely because this consumer type is broad.

Use `useUiResponsive(profile)` for an exact inferred token union. The same profile must be installed in the application. A reusable consumer without a profile must deliberately handle other tokens, for example through an explicit fallback policy or by rejecting unsupported cases.

Tokens do not inherently prescribe a detection algorithm, physical device class, direction, allocation, or scrolling. Consumers translate them into component properties; backends receive those properties only. Tests cover default and custom detection sources, vocabulary errors, and typed profile consumption.
