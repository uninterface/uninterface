# Document pages and bounded workspaces

Separate the area offered by the host from the layout's choice of what scrolls. UiApp supplies the surface and hosting; UiRegionLayout assigns regions and scroll ownership; UiContent supplies insets within the content regions. Business code does not calculate header heights or write overflow CSS.

## Document page

UiApp defaults to `hosting="document"`. Put a sequential header, main and footer directly inside it so they grow and scroll together in document flow. Use an ordinary UiRegionLayout without a scroll policy when you need named region allocation. Native HTML supplies the landmarks.

## Retained navigation with scrolling content and footer

```vue
<script setup lang="ts">
import { UiApp, UiContent, UiRegionLayout, type UiRegionScrollPolicy } from '@uninterface/uninterface'

const policy: UiRegionScrollPolicy = {
  groups: [{
    id: 'workspace',
    regions: ['main', 'end'],
    axis: 'vertical',
    'aria-label': 'Workspace content',
  }],
}
</script>

<template>
  <UiApp hosting="viewport">
    <UiRegionLayout :scroll-policy="policy" aria-label="Workspace layout">
      <template #start><header><ApplicationNavigation /></header></template>
      <template #main><main><UiContent><Editor /></UiContent></main></template>
      <template #end><footer><UiContent>Application footer</UiContent></footer></template>
    </UiRegionLayout>
  </UiApp>
</template>
```

The backend measures the application's viewport allocation. The header reserves its natural height; main and footer scroll together in the remainder. They stay in the same public slots as a document page. To retain both supporting regions in a separately instantiated layout, use regions: ['main'].

Region boundaries adjoin. The scrolling area begins immediately after the retained header, and main meets footer without an extra layout gap. UiContent supplies breathing room inside each content region; its leading inset scrolls away with content instead of leaving a permanent band below the header. The navbar retains its own interior spacing. No CSS adjustment is required in this composition.

The initial viewport host serves one primary region layout. Put content insets inside its regions, as above. UiContent, ordinary UiLayout allocations and region contents do not forward the whole application height into nested consumers; doing so would mistake outer space for inner space. UiModal owns scrolling for its content-sized body; it does not offer an independent bounded height to nested layouts. General integration with arbitrary nested allocations, other frames and third-party wrappers is not implemented. A missing bounded offer fails rather than guessing the viewport.

The outer layout is keyboard-focusable as an overflow escape. When retained content leaves insufficient usable room, an implementation-defined minimum scroll-group area keeps the main content reachable and the outer layout can also scroll. Retention is relaxed only in that insufficient-space case. Missing capabilities and invalid policies are errors, not reasons for fallback.

The public whole-layout scroll option retains its separate meaning. Do not combine it with a group policy. Group membership remains fixed for one mounted instance; resize and conditional supporting content preserve descendants. A deliberate new layout instance has normal Vue lifecycle consequences.

## Routing and editing-session lifetime

The application owns routing and maps confirmed destinations to UiNavMenu's `modelValue`. Layout components do not own URL syntax or page selection. Vue Router, hash navigation and local panel selection can use the same layout language.

Decide whether a page switch ends an editing session or only hides its view. Vue KeepAlive can retain visited page components; externally owned controls can retain sessions across view removal. Neither mechanism chooses unsaved-change or persistence policy for the application. A dispatched business operation is not cancelled merely because its page disappears.

Page transitions should update the title, place focus at a meaningful destination and apply the application's scroll policy. UiMenu closes floating surfaces and releases listeners on deactivation while leaving business-owned entry controls alive. See [business components](business-components.md) for lifetime choices.

## Verify the integration

Use the same browser acceptance for each backend: document scrolling moves the page header; grouped scrolling moves main and footer by the same amount while retaining the header. Verify that the scrollport meets the header boundary, the initial content inset scrolls out of view, and main/footer allocations meet without an added gap. Resize the viewport and change header height; the group must receive the remaining area without offsets in business code. Exercise keyboard scrolling, direct URLs, back/forward, draft retention between pages and return to document scrolling after leaving the workspace.

Also verify invalid policies are rejected, optional regions release allocation, and updates preserve input/focus identity. DOM checks do not substitute for browser geometry, touch/zoom or accessibility testing.

## Ordinary content in a bounded allocation

Use `UiContent height="full" scroll="vertical" aria-label="Details"` when the area needs its own content inset. Use scrolling UiLayout/UiGridLayout for content that should remain flush with adjacent surfaces; supported focus paint adapts within that boundary without adding a gutter. Place an ordinary UiLayout or UiGridLayout inside to arrange fields or other content. This consumes an established CSS height; it does not propagate a new numeric grouped-region offer. Keep existing non-scrolling UiContent inside grouped regions. See [scrolling content and visible focus](scrolling-content.md) for ownership and acceptance.
