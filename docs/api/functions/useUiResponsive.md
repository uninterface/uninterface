# useUiResponsive

Observe the current responsive context as a read-only Vue ref. Business components and layout controls consume named context without knowing how it is detected. Call synchronously from component setup, or from a composable called during setup.

```vue
<script setup lang="ts">
import { UiLayout, useUiResponsive } from '@uninterface/uninterface'

const { context } = useUiResponsive()
</script>

<template>
  <UiLayout :direction="context === 'mobile' ? 'vertical' : 'horizontal'">
    <CustomerSummary />
    <CustomerDetails />
  </UiLayout>
</template>
```

## Signature and reactive behavior

```ts
function useUiResponsive(): {
  readonly context: ComputedRef<UiResponsiveContext>
}

function useUiResponsive<Token extends string>(
  profile: UiResponsiveProfile<Token>,
): {
  readonly context: ComputedRef<Token>
}
```

Import the function and [UiResponsiveContext](../types/UiResponsiveContext.md) from `@uninterface/uninterface`. `ComputedRef` is a Vue type. Destructure the returned object to obtain `context`; JavaScript reads `context.value`, and templates unwrap a top-level ref. Reading `.value` once into an ordinary variable does not establish a reactive derived value: use `computed` for that.

Consumers cannot assign the detected context through this ref. Detection belongs to environment infrastructure, configured through [createUiResponsive](createUiResponsive.md) when needed. The composable has no UI, layout props, backend dependency, or form state. Multiple consumers observe the same default detector without creating independent browser listeners.

## Custom vocabularies

Without an argument, the composable observes whichever vocabulary is installed. Its context type is `string`; it cannot infer the application setup from a separate module. The first example deliberately stacks mobile and uses a horizontal layout for every other token. This is a consumer policy, not a built-in interpretation of custom tokens.

Pass a shared [UiResponsiveProfile](../types/UiResponsiveProfile.md) for an exact typed vocabulary:

```ts
const { context } = useUiResponsive(workspaceResponsive)
// For a desktop/mobile/tablet profile: ComputedRef<'desktop' | 'mobile' | 'tablet'>.
```

The same profile object must have been installed with [createUiResponsive](createUiResponsive.md). Missing or different profiles throw during consumption, even if their token spellings are identical. A profile declaration carries no detection state, so it is safe to share across separate applications. Profile-specific sources are validated against their declared tokens at installation and whenever their updated computed value is read.

## Default detection and lifecycle

The initial default is `desktop`. After a consumer mounts, core evaluates `matchMedia('(max-width: 760px)')`: a match produces `mobile`, otherwise `desktop`. Media-query changes update the ref. This uses viewport width in CSS pixels, not user agent, physical device identity, touch support, or container size. The threshold is a detector implementation choice, not a requirement for business code to reproduce.

One default listener is shared while consumers are mounted. Disposing the last consumer removes it and resets the default to `desktop`; a subsequent mount evaluates the current browser condition again. A layout that does not call this composable does not start detection. Without `matchMedia`, the default stays `desktop`.

An application-supplied context is available immediately and bypasses default detection for its consumers. The application owns that source and any external detector cleanup. Separate Vue apps can supply different contexts.

Server rendering starts from the supplied context or the `desktop` default. Default client detection happens after mount and may change the presentation. Server rendering/hydration is not acceptance-tested; supply consistent initial application context and verify hydration when integrating SSR.

## Responsibilities and verification

Core owns observation, validation of supplied tokens, and default listener lifecycle. Consumers choose responsive behavior through ordinary reactive props or control bindings. Backends render the resulting component properties and must not perform competing context detection. See [responsive layouts](../../guides/responsive-layouts.md) for coordinated decisions and state ownership.

`responsive.context.v1` is provided by core. Acceptance verifies read-only refs, immediate application overrides, reactive updates, shared listener cleanup, and initial/default browser behavior. Use the composable to vary a layout around an editable field and verify that the same draft survives context changes. Custom vocabularies are supported by `responsive.profile.v1`. Multiple simultaneous context dimensions and built-in container-scoped detection are not implemented. Application-owned detectors may use those inputs to produce one token.
