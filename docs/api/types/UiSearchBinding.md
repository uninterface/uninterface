# UiSearchBinding

Search and candidate acceptance: `UiSearchBinding` is exported from `@uninterface/uninterface`.

## API

```ts
export interface UiSearchBinding<T = unknown> {
 readonly query: string
 readonly results: readonly UiSearchResult<T>[]
 readonly hasMatches?: boolean
 readonly status: 'idle'|'waiting'|'loading'|'ready'|'error'|'disposed'
 readonly error: unknown
 setQuery(query: string): void
 /** Synchronize programmatic/accepted text without issuing a search. */
 syncQuery(query: string): void
 refresh(): Promise<void>
 isCurrent(result: UiSearchResult<T>): boolean
 describe(key: string): string | undefined
}
```

## Ownership and implementation

The owner creates and disposes the control. Query text, selected keys, and accepted business values are distinct. Providers receive an AbortSignal. A new query invalidates previous results immediately, including during debounce; only a current, enabled candidate may be accepted. Programmatic syncQuery never issues a request.

`hasMatches` reports source matches before any filtering for the editor. When the binding is ready, suggestions use it to distinguish a genuinely empty result from matches that require no suggestion. A binding that omits it uses its `results` as the source of truth for the empty state.

See the [search and candidate acceptance guide](../../guides/search.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify out-of-order responses cannot replace newer results, disabled candidates cannot be accepted, and accepted text does not start another search.
