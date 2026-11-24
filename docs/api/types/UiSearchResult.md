# UiSearchResult

Search and candidate acceptance: `UiSearchResult` is exported from `@uninterface/uninterface`.

## API

```ts
export interface UiSearchResult<T = unknown> {
 readonly key: string
 readonly label: string
 readonly disabled: boolean
 readonly item: T
 readonly matchRanges?: readonly (readonly [start: number, end: number])[]
}
```

## Ownership and implementation

The owner creates and disposes the control. Query text, selected keys, and accepted business values are distinct. Providers receive an AbortSignal. A new query invalidates previous results immediately, including during debounce; only a current, enabled candidate may be accepted. Programmatic syncQuery never issues a request.

`matchRanges` carries optional `[start, end)` UTF-16 offsets into `label`. Default suggestion rendering emphasizes these ranges and keeps the full accessible label. Invalid ranges are ignored and overlapping ranges are combined.

See the [search and candidate acceptance guide](../../guides/search.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify out-of-order responses cannot replace newer results, disabled candidates cannot be accepted, and accepted text does not start another search.
