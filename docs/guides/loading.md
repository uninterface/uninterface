# Loading indicators and surfaces

The operation owner owns loading state, cancellation, errors and retries. Presentation consumes that state. Use a loading-capable container for ordinary business compositions; use a surface handle only when implementing a specialized visual container.

## Standalone activity

```vue
<UiLoadingIndicator v-if="pending" />
<UiLoadingIndicator v-if="pending">Loading customer…</UiLoadingIndicator>
```

[UiLoadingIndicator](../api/components/UiLoadingIndicator.md) renders activity with optional visible default-slot text. Without text, it supplies a localized accessible label. It has no active/show-label/announce props, actions, masking or request lifecycle. Its surrounding region owns announcements. Backend indicator artwork and existing control-size strategies own presentation. Buttons keep their integrated native loading facilities.

## Ordinary containers

```vue
<UiCard :loading="pending">
  <template #header>Customer summary</template>
  <CustomerDetails :customer="customer" />
</UiCard>

<UiTable :binding="orders.bindings.list">
  <!-- ordinary column declarations -->
</UiTable>
```

UiCard masks its whole surface, including header and footer. The mask follows its corners without clipping ordinary card descendants or changing the frame's shadow. UiTable, UiList and UiCollectionView derive blocking loading from their binding's initial/replacement read state. Refresh, query changes and page replacement retain their accepted content under the mask. Their optional `loading` prop adds an external condition; false does not suppress binding activity. Infinite accumulation uses an append indicator and keeps accepted content available. Row actions retain their own activity presentation.

An initially empty, content-height collection reserves backend-owned space for its loading indicator. Bounded collections use their existing allocation. Masks cover the container's visible local viewport and follow its scroll offsets. They do not change the independent horizontal/vertical overflow policies or unmount content. Loading is separate from failure: a failed read removes its mask, preserves accepted rows and presents the existing retry feedback. The owner remains responsible for resolving its external loading condition on failure/cancellation.

## Specialized visual components

[UiLoadingRegion](../api/components/UiLoadingRegion.md) is a lower-level composition primitive. It does not discover the intended frame among descendants. The owner supplies [UiLoadingSurface](../api/types/UiLoadingSurface.md), with reactive DOM references for the overlay host, interaction target and busy-status target. References may be empty before mounting. Elements must share a document.

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { UiLoadingRegion, UiLoadingIndicator, type UiLoadingSurface } from '@uninterface/uninterface'

defineProps<{ pending: boolean }>()
const host = shallowRef<HTMLElement>()
const surface: UiLoadingSurface = {
  overlayHost: host,
  interactionTarget: host,
  statusTarget: host,
}
</script>

<template>
  <!-- This specialized visual owner supplies its own geometry and clipping. -->
  <div ref="host" class="customer-diagram-surface">
    <CustomerDiagram />
  </div>
  <UiLoadingRegion :surface="surface" :loading="pending">
    <UiLoadingIndicator>Loading diagram…</UiLoadingIndicator>
  </UiLoadingRegion>
</template>
```

The host must be an ordinary element that accepts an overlay child, with usable allocated dimensions. Do not use a table/tbody, replaced element, or display:contents node as the overlay host. Its border radius establishes rounded overlay corners. An owner needing a different clipping shape supplies a dedicated correctly clipped host. The status target must be outside any already inert ancestor. Content and overlay hosts may coincide; the integration blocks content branches while keeping the loading overlay and announcements available. Distinct content/overlay hosts are also supported. Position/isolation, busy state, temporary focusability and inert state are restored on release. Multiple masks share locks so releasing one does not unlock another.

Opaque components may render popups outside their DOM subtree. The specialized owner must close those popups before blocking, or include their content in its interaction boundary. A loading surface cannot infer third-party portal ownership. Consumers of the business component should not construct this rendering contract.

## Backend responsibility and acceptance

Backends combine compatible loading services, overlays or indicators with a mask fulfilling the shared blocking policy. A table’s loading indicator alone may not block existing rows. Visuals remain theme-owned; no shared spinner dimensions or numeric stacking API are exposed. Concrete facilities are documented by each backend.

A loading region parks focus on its status target only when focus was inside its content. It restores a still-connected, available prior target only if the user has not moved focus elsewhere. Inert branches block keyboard traversal; capture guards prevent content actions during loading. Collections retain their elected live announcement host, avoiding a second announcement from each mask.

Check actual pointer and keyboard blocking, retained editor identity/draft/selection, no layout jump, rounded corners, mask coverage after both-axis scrolling, resize and sticky headers, failure/retry, overlapping masks, nested containers, focus recovery without stealing focus, localization and unmount cleanup. DOM tests establish wiring and state; native hit testing, clipping and assistive-technology behavior require browser checks. UiLoadingIndicator supports SSR; geometry-based masks attach after client mounting when surface elements exist.
