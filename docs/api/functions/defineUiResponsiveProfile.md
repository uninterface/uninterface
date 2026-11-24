# defineUiResponsiveProfile

Declare the finite vocabulary used by a responsive detector and its business consumers. Profiles are optional: Uninterface supplies desktop/mobile detection without any setup. Define a profile when the application needs additional or different tokens.

```ts
import { defineUiResponsiveProfile } from '@uninterface/uninterface/responsive'

export const workspaceResponsive = defineUiResponsiveProfile([
  'desktop',
  'mobile',
  'tablet',
])
```

## Signature

```ts
function defineUiResponsiveProfile<const Tokens extends readonly string[]>(
  tokens: Tokens,
): UiResponsiveProfile<Tokens[number]>
```

The function preserves literal types from an inline array or readonly tuple. A widened `string[]` produces a string-valued type, while retaining runtime validation against its declared members. It returns a [UiResponsiveProfile](../types/UiResponsiveProfile.md) whose `tokens` are a copied, frozen array; the profile object is frozen too.

Tokens must be unique, nonempty strings without leading or trailing whitespace. An empty array, duplicate, or invalid member throws. Tokens are case-sensitive and have no implicit ordering, size, inheritance, or fallback meaning. The array is the complete vocabulary: include `desktop` and `mobile` when needed. It can also consist entirely of application-specific names.

## Installation and consumption

Pass the profile as the second argument of [createUiResponsive](createUiResponsive.md), alongside a reactive source whose value is one of its tokens. In component setup, [useUiResponsive(profile)](useUiResponsive.md) returns a read-only ref of the profile's exact token union.

Share one profile definition between setup and consumers. Consumption checks object identity against the installed profile; creating another profile with identical spellings does not establish the same contract. The profile carries no mutable environment state, so the same definition can be used in separate Vue applications with independent sources.

Defining a profile does not register a detector, install an environment, or add automatic tablet detection. Application assembly owns detection and cleanup. Document what each token means and which policies handle it. A consumer can explicitly group tokens, but Uninterface supplies no universal mapping to desktop/mobile.

## Responsibilities and verification

Core validates/copies the vocabulary and checks installed profile identity. Application infrastructure supplies valid reactive detection; business controls translate tokens into supported component properties. Backends never receive this vocabulary.

Core provides `responsive.profile.v1` alongside `responsive.context.v1`. Acceptance covers invalid declarations, frozen copies, custom-token updates, cross-application isolation, missing/mismatched profiles, rejected detector output, and compile-time source/consumer token inference. See [responsive layouts](../../guides/responsive-layouts.md).

Import `defineUiResponsiveProfile` from `@uninterface/uninterface/responsive`. Ordinary business consumers import useUiResponsive from `@uninterface/uninterface`.
