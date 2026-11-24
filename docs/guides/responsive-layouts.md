# Responsive layouts and reactive bindings

Responsive describes adaptation to the environment. Reactive describes how Vue updates consumers when values change. Uninterface connects them through [useUiResponsive](../api/functions/useUiResponsive.md): observe a named context, then express the desired behavior using ordinary Vue properties.

Environment infrastructure decides how context is detected. Business compositions choose meaningful arrangements. UiLayout validates the supplied arrangement, and its backend supplies geometry and spacing. UiLayout neither detects context nor knows which control or computed value produced its props.

## A simple decision

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

The detector supplies tokens, not pixel measurements to reproduce inside the composition. The default context vocabulary is desktop/mobile; application setup may declare a custom vocabulary and replace the detector through [createUiResponsive](../api/functions/createUiResponsive.md). No control factory is needed for a single expression. This example deliberately uses horizontal arrangement for all tokens other than mobile; additional tokens are handled by that consumer-defined fallback.

## Coordinate related decisions

Changing direction can also change the appropriate allocation. A horizontal ratio divides width; a vertical ratio needs a bounded height. Use one computed object when properties must change together:

```ts
import { computed } from 'vue'
import { useUiResponsive, type UiLayoutProps } from '@uninterface/uninterface'

const { context } = useUiResponsive()
const layout = computed<UiLayoutProps>(() =>
  context.value === 'mobile'
    ? { direction: 'vertical', division: 'content' }
    : { direction: 'horizontal', division: [2, 1] },
)
```

Bind it with `<UiLayout v-bind="layout">` and supply two participating children. The binding gives the main content twice the width of its companion on desktop, and stacks them using their content heights on mobile. No CSS or breakpoint knowledge belongs in this policy.

## Extend the vocabulary

Default usage needs no profile or configuration. For custom tokens, declare a shared vocabulary in an application module:

```ts
// responsive.ts
import { defineUiResponsiveProfile } from '@uninterface/uninterface/responsive'

export const workspaceResponsive = defineUiResponsiveProfile([
  'desktop',
  'mobile',
  'tablet',
])
```

Document the meaning of every token. The array declares the complete vocabulary, not just the additions. It has no implied size order, breakpoint, or backend dependency. Custom token names need not refer to device sizes; a detector can interpret user-agent information, application hints or preferences instead.

Application assembly supplies automatic detection. Here is a client-only example using two media queries. Its thresholds are illustrative application choices, not Uninterface rules or physical-device identification:

```ts
// Application entry, after creating the Vue app.
import { shallowRef } from 'vue'
import { createUiResponsive } from '@uninterface/uninterface/responsive'
import { workspaceResponsive } from './responsive'

const narrow = window.matchMedia('(max-width: 760px)')
const intermediate = window.matchMedia('(max-width: 1100px)')
const context = shallowRef<(typeof workspaceResponsive.tokens)[number]>('desktop')

function detect() {
  context.value = narrow.matches
    ? 'mobile'
    : intermediate.matches
      ? 'tablet'
      : 'desktop'
}

detect()
narrow.addEventListener('change', detect)
intermediate.addEventListener('change', detect)
app.use(createUiResponsive(context, workspaceResponsive))
app.onUnmount(() => {
  narrow.removeEventListener('change', detect)
  intermediate.removeEventListener('change', detect)
})
```

For server rendering, supply an appropriate initial source and establish browser subscriptions on the client; do not evaluate browser globals on the server. The application owns its detector lifecycle. Installing a profile bypasses the default detector for that application's consumers.

Business components observe the shared definition without importing the detector:

```ts
import { computed } from 'vue'
import { useUiResponsive, type UiLayoutProps } from '@uninterface/uninterface'
import { workspaceResponsive } from './responsive'

const { context } = useUiResponsive(workspaceResponsive)
const arrangements = {
  desktop: { direction: 'horizontal', division: [2, 1] },
  tablet: { direction: 'horizontal', division: 'equal' },
  mobile: { direction: 'vertical', division: 'content' },
} satisfies Record<(typeof workspaceResponsive.tokens)[number], UiLayoutProps>

const layout = computed(() => arrangements[context.value])
```

Bind this to the same UiLayout. TypeScript checks that the table handles every declared token. Consumers may instead deliberately group tokens into one behavior. For example, `context.value === 'mobile' ? stacked : columns` treats tablet like desktop by explicit policy. Uninterface does not choose such mappings globally.

`useUiResponsive(profile)` requires that exact shared profile object to be installed and returns its literal token union. Unqualified `useUiResponsive()` returns a string-valued ref because any vocabulary may be installed. Avoid casting it to a narrower union: request the profile when a reusable policy requires a particular vocabulary. Initial and subsequently read source values outside the declared vocabulary throw.

Declare `responsive.profile.v1` alongside `responsive.context.v1` when relying on custom profiles. Backends need no token declarations or changes: they fulfill the resulting layout requirements, which must still be declared and supported.

## Encapsulate a reusable layout control

A named business control can encapsulate coordinated rules. This application-defined factory exposes a target-named binding consisting of ordinary [UiLayoutProps](../api/types/UiLayoutProps.md):

```ts
import { computed, type Ref } from 'vue'
import type { UiLayoutProps, UiResponsiveContext } from '@uninterface/uninterface'

export function createWorkspaceLayoutControl(
  context: Readonly<Ref<UiResponsiveContext>>,
) {
  const layout = computed<UiLayoutProps>(() =>
    context.value === 'mobile'
      ? { direction: 'vertical', division: 'content' }
      : { direction: 'horizontal', division: [2, 1] },
  )

  return {
    bindings: {
      get layout(): Readonly<UiLayoutProps> {
        return layout.value
      },
    },
  }
}
```

Create it during the business composition's setup:

```ts
const { context } = useUiResponsive()
const workspace = createWorkspaceLayoutControl(context)
```

Then use `<UiLayout v-bind="workspace.bindings.layout">`. The getter reads the computed value during rendering; it avoids requiring template unwrapping of a ref nested inside a plain object. Do not copy its current value into a nonreactive variable or spread it once during setup. Treat the binding as read-only and centralize related options in the producer rather than overriding them in several places.

UiLayout requires no registration, control type, or special binding prop. This is ordinary Vue `v-bind`. It differs from UiButton's dedicated binding protocol, which also coordinates action invocation and native form association. There is no generic core layout-control factory in this implementation; the example is a business composition pattern.

## Ownership and limitations

The business decides the lifetime of its layout control and any maintained interaction state. This example only derives options, so it needs no separate disposal method. The responsive composable owns its subscription lifetime through Vue setup. A longer-lived control needs an appropriately long-lived context source; do not assume a component-scoped consumer continues default detection after disposal.

Keep editing controls authoritative across layout changes. Updating props on a stable layout keeps its keyed content mounted. Replacing whole component trees to switch presentation needs a separate mounting/focus policy. A layout binding does not grant drawer modality, collapse behavior, user resizing, or any other unsupported capability.

UiLayout applies defaults to omitted props and validates the current configuration on each render. It cannot inspect inactive branches of arbitrary computed functions. Declare all capabilities any branch may require in the composition/application requirements, test each branch, and let runtime checks reject unsupported configurations when reached. For this example, declare `responsive.context.v1`, `layout.linear.v1`, `layout.reactive.v1`, and `layout.division.v1`.

## Observable acceptance

- Context changes update the requested direction and allocation together.
- Child instances, input values, validation state, and meaningful focus survive layout updates.
- Multiple responsive consumers share the default listener; the last consumer's disposal releases it.
- Application-supplied context bypasses browser detection for its consumers.
- Unsupported allocation combinations and missing backend capabilities fail visibly.
- Browser checks establish actual geometry and scrolling; DOM simulation alone does not.
