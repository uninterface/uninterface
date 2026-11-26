# Layout density

Use `uiLayoutDensity` when related items should sit closer together or have more breathing room. Ordinary layouts require no strategy. The initial numeric scale is `-1` (compact), `0` (backend default), and `1` (spacious). The backend chooses actual spacing; business authors do not choose CSS values.

## Group independent checkboxes

Each checkbox can retain its own boolean field and validation ownership. A layout groups their presentation without converting the fields into a shared selection model:

```vue
<script setup lang="ts">
import {
  UiStrategy, UiLayout, UiField, UiCheckbox,
  createUiFieldControl, uiLayoutDensity,
} from '@uninterface/uninterface'

const disabled = createUiFieldControl(false)
const readonly = createUiFieldControl(false)
const slow = createUiFieldControl(false)
</script>

<template>
  <UiStrategy :use="uiLayoutDensity(-1, { scope: { depth: 1 } })">
    <UiLayout direction="vertical">
      <UiField :field="disabled" label="Disabled"><UiCheckbox /></UiField>
      <UiField :field="readonly" label="Readonly"><UiCheckbox /></UiField>
      <UiField :field="slow" label="Slow save"><UiCheckbox /></UiField>
    </UiLayout>
  </UiStrategy>
</template>
```

Depth one limits the request to the directly participating layout; deeper logical descendants do not receive it. It adds no visible heading or selection owner. Use UiCheckboxGroup when the business value really is one selection set. Compact layout is not a promise to reproduce every backend's checkbox-group geometry: separate fields may have their own descriptions and validation feedback.

## Ownership and scope

UiLayout and UiFlowLayout apply density between their children. UiGridLayout applies it between rows and columns. These three components are the implemented scope. Forms, choice groups, lists and tables do not directly participate; future support needs its own contract. UiRegionLayout allocations remain adjoining, but ordinary layouts inside their content may participate.

Consumers choose the semantic level and scope and retain control lifetimes. Core resolves scoped strategy answers; backends own concrete gaps or toolkit classes. Control surfaces/hit targets, typography and content insets are not scaled by this strategy. A backend may remove surplus row whitespace around a direct item while preserving the control’s interaction area and feedback. This is a local layout accommodation, so it still works when depth one targets only the layout. It does not cross a nested layout or opaque content wrapper. UiControlSize is a separate concern.

Without a depth limit, nested participating layouts inherit the request. Targets can restrict it to `layout` or `grid-layout`. UiFlowLayout delegates to one logical `layout` node. All supported answers must agree; neither nesting nor declaration order establishes precedence. To reset an inherited density for a subtree:

```vue
<UiStrategy :block="uiLayoutDensityQuery" :use="uiLayoutDensity(0)">
  <UiLayout><!-- ordinary spacing here and below --></UiLayout>
</UiStrategy>
```

Import `uiLayoutDensityQuery` from `@uninterface/uninterface`. Blocking the query stops all incoming contributors; blocking `uiLayoutDensity` stops only that family. No answer or conflict restores backend defaults. See [strategies](strategies.md) and the [strategy reference](../strategies/uiLayoutDensity.md).

## Observable checks

Switch from -1 to 0 to 1 and remove the strategy: peer spacing should progress from compact through the original default to spacious. Existing input values, checkbox states, DOM identity and focus should survive. Verify a nested query barrier restores default spacing and UiRegionLayout boundaries stay adjoining. In a browser, also check narrow-width wrapping, grid rows/columns, scrolling and visible focus. Automated DOM tests establish wiring and state preservation, not browser geometry.
