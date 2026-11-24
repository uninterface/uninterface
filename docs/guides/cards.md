# Group content with cards and hierarchy

Use [UiCard](../api/components/UiCard.md) when related content should be perceived as one bounded unit. A reusable business component can encapsulate its card, fields, layouts and editing control; its consumer supplies business data and operations.

## Author a coherent unit

```vue
<script setup lang="ts">
import { UiCard, UiLayout, UiStrategy, uiHierarchyLevel } from '@uninterface/uninterface'
</script>

<template>
  <UiCard :level="-1">
    <template #title><h2>Invoice</h2></template>
    <UiLayout>
      <InvoiceSummary />
      <UiStrategy :use="uiHierarchyLevel(1)">
        <UiCard>
          <template #title><h3>Delivery</h3></template>
          <DeliveryDetails />
          <UiCard :level="2">Package instructions</UiCard>
        </UiCard>
      </UiStrategy>
    </UiLayout>
    <template #footer><InvoiceActions /></template>
  </UiCard>
</template>
```

InvoiceSummary, DeliveryDetails and InvoiceActions are application components. They keep their own business contracts. Heading ranks are supplied separately from visual hierarchy. Optional slots can be omitted; do not insert empty headings just to obtain spacing.

## Ownership and obligations

Business authors decide which content belongs together and any meaningful hierarchy. The five levels are -2/-1 above ordinary, zero ordinary, and 1/2 subordinate. Zero is the default. The default profile presents -2 as -1; other default levels remain differentiated. A custom profile can distinguish all five. No nesting calculation occurs automatically. The [hierarchy strategy](../strategies/uiHierarchyLevel.md) applies a level to participating logical descendants with existing scope/barrier rules; an explicit card level affects only that card and overrides its regional preference.

The card's backend owns its boundary, surface and interior insets. Existing layouts own allocation and separation of peers. Keep concrete CSS, colors, shadows and padding out of the business composition. Do not add UiContent merely to make a card's body usable; an explicit nested UiContent deliberately adds further insets.

Cards own no editing state, actions or disclosure lifecycle. Preserve those in the business component/control. A card introduces no landmark, interactive role or tab stop. Authors supply meaningful headings and names appropriate to their content; a header slot alone establishes neither.

## Host an arranged body

Use the `layout` slot when the body is a composition that already owns its arrangement and content insets. For example, adjoining regions should reach the card boundary while each region's UiContent supplies its local inset:

```vue
<UiCard>
  <template #layout>
    <UiRegionLayout>
      <template #start><UiContent>Introduction</UiContent></template>
      <template #main><UiContent><ReportBody /></UiContent></template>
      <template #end><UiContent>Conclusion</UiContent></template>
    </UiRegionLayout>
  </template>
</UiCard>
```

Import UiCard, UiRegionLayout and UiContent from `@uninterface/uninterface`; ReportBody is an application component. Choose either default content or a layout body, never both. The backend removes only the card body's inset. It preserves header/footer spacing, explicit child insets, nested cards, focus and the native frame. This prevents a second outer inset from making the first and last regions look more spacious than the middle. The layout slot introduces no height or scrolling policy; the composition supplies those when needed.

Check that region boundaries reach the inside of the card frame, each region retains its content inset, and ordinary default-slot cards retain their own padding. Changing the selected body slot with the same children must preserve editing state and focus.

## Current limits and acceptance

Cards grow with content and introduce no scrolling or sticky sections. Bounded-height card hosting remains open. Supported patterns include arbitrary native/Vue content, nested cards, headers/footers, all five explicit levels and scoped regional preferences. Color is optional. Presentation customization uses a shared strategy rather than individual border/shadow/inset props. Numeric insets and raw CSS remain outside this API.

Verify that the same composition remains visibly grouped in light/dark presentation and at mobile width. Header/footer omissions must leave no empty chrome; nested insets must remain intact. Edit a field and change the level or strategy: the draft, component identity and focus must survive. Check that slot actions still work and headings remain meaningful. Inspect each backend's documented fulfillment; identical artwork is not required.

## Customize hierarchy once, reuse it across backends

```vue
<script setup lang="ts">
import { UiCard, UiStrategy, uiCardPresentation } from '@uninterface/uninterface'
const cards = uiCardPresentation({
  [-2]: { color: 'primary', border: 'double' },
  [-1]: { color: 'primary' },
  0: { color: 'info' },
  1: { header: 'band', density: 'compact' },
  2: { color: 'secondary', surface: 'tinted' },
})
</script>
<template>
  <UiStrategy :use="cards">
    <UiCard :level="-1">
      <template #title><h2>Account</h2></template>
      <template #description>Orders and delivery details</template>
      <UiCard :level="1" color="warning">Delivery requires review</UiCard>
      <UiCard :level="2" :color="null">Neutral package details</UiCard>
    </UiCard>
  </UiStrategy>
</template>
```

The application owns a named presentation map; it need not change with the backend. Defaults fill omitted properties/levels. The backend owns exact insets, colors, fonts and shadows. Explicit card color overrides the map for that card; null selects neutral, omission restores the map. A parent card's explicit color is not inherited. Each child resolves its own level independently against the regional map.

Use title/description slots for standard introductory structure. A heading in the title slot receives backend typography while retaining its author-selected semantic rank. Use header for a completely authored introduction; a nonempty header replaces title/description and retains its content's typography. No header is required to preserve a card boundary.

See [uiCardPresentation](../strategies/uiCardPresentation.md) for defaults, all treatment values and whole-profile agreement. Conflicting maps restore the default map; they do not merge or use the nearest declaration. To replace an enclosing profile, block that family/query and install the replacement. The presentation strategy does not change the independently selected hierarchy level. Named maps can intentionally reuse treatments; their author must assess whether the resulting hierarchy remains clear.

## Coordinate boundary patterns

Choose `border: 'solid'`, `'dashed'`, `'dotted'` or `'double'` in a level treatment. Solid, dashed and dotted also apply to visible header/footer separators. Double applies to the enclosing boundary with solid internal separators to avoid heavy repeated double lines. This setting does not create missing separators or regions: `header: 'plain'` remains unseparated. Native separator color/thickness, footer backgrounds and typography remain backend-owned. For example, `uiCardPresentation({ 2: { border: 'dotted' } })` changes the level-2 boundary and existing separators together, independently of color.

## Quieter subordinate footers

Levels 1 and 2 use smaller, theme-muted footer text by default, while body text and header typography retain their own scales. To keep full footer emphasis, set `footer: 'normal'` for the desired levels in uiCardPresentation. The footer background, separator and actions are not faded; native control size remains separate. Ordinary HTML and third-party content may inherit surrounding text styles, so assess custom footer compositions alongside the title.

## Headerless cards and corner actions

A card needs no header. Omit introductory slots when the body already expresses the complete subject; the backend retains the boundary and ordinary body insets without a blank header area or separator.

Use `#top-end` for a concise corner action, such as an icon-only Remove button with an accessible label. The card backend owns logical corner positioning and its inset; the action stays attached to the frame independently of image or preview content. Business code owns its operation, availability and label. The slot adds no removal workflow, selection or card-wide activation.

```vue
<UiCard>
  <UiFilePreview :file="attachment" presentation="tile" thumbnail />
  <template #top-end>
    <UiButton :binding="removeBinding" color="danger" variant="icon">
      <template #icon><UiIcon name="delete" /></template>
      Remove {{ attachment.name }}
    </UiButton>
  </template>
</UiCard>
```

For a collection, use [UiCollectionView](../api/components/UiCollectionView.md) with `presentation="cards-grid"` and `card-action-placement="top-end"`; keep actions in its actions slot and supply the preview as a media field. The collection omits headers without meaningful header content or selection. It continues to borrow the same list binding; no new list or mutation owner is needed.

Verify no blank header/footer, a visible frame, readable preview metadata, an accessible action name, visible keyboard focus, logical placement in RTL and no action/content overlap at narrow widths. Empty actions must release the corner host. Check that removing one item preserves unrelated drafts and releases only the preview resources it owns.
