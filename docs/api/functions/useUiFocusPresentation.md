# useUiFocusPresentation

Import from `@uninterface/uninterface`. Obtain keyboard-focus presentation for an author-supplied element from the selected backend.

```ts
function useUiFocusPresentation(): UiFocusPresentationBinding
```

No arguments. Requires backend capability `focus.presentation.v1` and the backend's normal stylesheet setup. Returns a stable, readonly presentation binding. No Vue injection, lifecycle ownership or browser globals are required; it can be called in setup, outside setup, or during SSR. It does not create or move focus.

```vue
<script setup lang="ts">
import { useUiFocusPresentation } from '@uninterface/uninterface'
const focusPresentation = useUiFocusPresentation()
</script>
<template>
  <a href="/records" v-bind="focusPresentation">Records</a>
</template>
```

The business composition owns focusability, naming and behavior. The binding supplies only an opaque backend class; it does not add tabindex, events, roles, ARIA state or disabled handling. Apply it to the element that actually receives focus. Do not apply it routinely to Uninterface controls, which already own their focus presentation.

Core selects the backend's static `./focus` module and checks capability support. Backends own the visual treatment and its theme/forced-colors adaptation. Their implementation must not load component views or add runtime interaction merely to supply presentation.

Verify independent native elements outside special containers, preserved activation/tab order, visible keyboard focus in supported modes, descendant isolation and SSR consistency. Assembly tests must show unused backend views remain excluded. See [UiFocusPresentationBinding](../types/UiFocusPresentationBinding.md) and the [usage guide](../../guides/focus-presentation.md).
