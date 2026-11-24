# UiLoadingRegion

Displays a blocking loading mask on a surface supplied by a specialized visual component. Import from `@uninterface/uninterface`. Ordinary business compositions use a container's loading prop instead; see [loading guidance](../../guides/loading.md).

## API

| Input | Meaning |
|---|---|
| `surface: UiLoadingSurface` | Required reactive references to the owner's overlay host, interaction target and status target |
| `loading: boolean` | Required loading state; false releases the mask and interaction locks |
| Default slot | Optional replacement loading content, normally UiLoadingIndicator with custom text; omitted uses the backend's default loading presentation |

No events, request initiation, error ownership or exposed methods. References may be unavailable before mount and may change reactively; changing targets releases the old surface. Geometry attaches on client mount. Rendering is backend-owned. No wrapper content slot, dimensions, corner-radius or spinner-type props are supplied.

## Responsibility and verification

The owner establishes allocated size and clipping; the backend attaches a mask, follows local viewport/scroll offsets and retains mounted content. Interaction and busy state are restored on completion, deactivation or disposal. Focus is recovered only if the original target survives and the user has not moved elsewhere. Pointer masking alone is insufficient: keyboard interaction is blocked too. The implementation retains pre-existing inert attributes and supports overlapping loading owners. See [UiLoadingSurface](../types/UiLoadingSurface.md) for owner obligations.

Verify mask boundaries, pointer/keyboard blocking, scroll and resize, preserved drafts, failure release, dynamic targets, overlapping regions, localization, focus and cleanup. DOM tests do not establish clipping or native hit testing.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

Its view registers the actual loading overlay against the explicit loading-surface host, including when teleported. The core supplies local ordering; the backend supplies geometry and appearance.
