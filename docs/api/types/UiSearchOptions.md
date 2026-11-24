# UiSearchOptions

Search and candidate acceptance: `UiSearchOptions` is exported from `@uninterface/uninterface`.

## API

```ts
export interface UiSearchOptions<T> {
 key(item:T): string
 label(item:T): string
 disabled?(item:T): boolean
 matchRanges?(item:T): UiSearchResult<T>['matchRanges']
 debounceMs?: number
 minLength?: number
}
```

## Ownership and implementation

The owner creates and disposes the control. Query text, selected keys, and accepted business values are distinct. Providers receive an AbortSignal. A new query invalidates previous results immediately, including during debounce; only a current, enabled candidate may be accepted. Programmatic syncQuery never issues a request.

`matchRanges` projects optional `[start, end)` UTF-16 offsets into the resolved label. Use offsets from the matching logic or remote result. The provider owns filtering, case sensitivity, ranking, and ordering.

See the [search and candidate acceptance guide](../../guides/search.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify out-of-order responses cannot replace newer results, disabled candidates cannot be accepted, and accepted text does not start another search.
