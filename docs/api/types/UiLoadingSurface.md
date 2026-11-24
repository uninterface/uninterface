# UiLoadingSurface

Backend-neutral rendering boundary for UiLoadingRegion, supplied by the owner of a specialized visual surface. Import the type from `@uninterface/uninterface`.

```ts
interface UiLoadingSurface {
  readonly overlayHost: Readonly<Ref<HTMLElement | null | undefined>>
  readonly interactionTarget: Readonly<Ref<HTMLElement | null | undefined>>
  readonly statusTarget: Readonly<Ref<HTMLElement | null | undefined>>
}
```

`overlayHost` accepts the mask child and establishes its viewport and shape. `interactionTarget` identifies content to block; it may be the same element as the host. `statusTarget` receives aria-busy and provides temporary focus parking when needed. All targets share a document; undefined/null supports mounting and replacement. Use ordinary block elements with measurable allocation, not a table/tbody or display:contents host. The status target must remain focusable outside inert ancestors. For custom nonrectangular clipping, supply a dedicated clipped overlay host. The owner manages any independently teleported content belonging to its operation.

This is a typed handle, not a factory-created control, geometry snapshot, CSS-class map or toolkit instance. UiCard/UiTable/UiList/UiCollectionView construct their handles internally; business consumers do not reconstruct them. See [loading guidance](../../guides/loading.md).

Verify reactive target replacement releases old busy/inert state, same-document validation, viewport coverage and cleanup. Concrete markup, clip boundaries and native indicator integration belong to the rendering owner/backend.
