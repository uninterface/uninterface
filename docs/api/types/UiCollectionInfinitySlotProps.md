# UiCollectionInfinitySlotProps

Import from `@uninterface/uninterface`.

## Meaning and API

```ts
export interface UiCollectionInfinitySlotProps {
  message: string
  loadedCount: number
}
```

Shared context for `#infinity-loading` and `#infinity-complete` on `UiCollectionView`, `UiTable` and `UiList`. `message` is resolved view wording, falling back to application localization. `loadedCount` is the accepted accumulated record count, not visible row count or overall source total. Accessing it performs no lazy-source iteration or data read.

## Ownership and verification

Core selects the state. Backends place inline content inside their native indicator/status, preserving geometry, sentinel and one independent announcement. Business templates supply side-effect-free phrasing content and use `messages` for meaningful changes to accessible wording. Absent/empty slots retain the default text. Neither slot renders for manual mode, initial/refresh masks or errors; successful empty results use `#empty`.

Verify append retains the old count, completion supplies the accumulated count, and table/card/direct-list paths agree without additional reads. See [infinite feedback](../../guides/collection-views.md#infinite-continuation-content).
