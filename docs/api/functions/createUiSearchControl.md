# createUiSearchControl

Search and candidate acceptance: `createUiSearchControl` is exported from `@uninterface/uninterface`.

## API

```ts
export function createUiSearchControl<T>(provider: (request: {
    query: string;
    signal: AbortSignal;
}) => readonly T[] | Promise<readonly T[]>, options: UiSearchOptions<T>): UiSearchControl<T>;
```

## Ownership and implementation

The owner creates and disposes the control. Query text, selected keys, and accepted business values are distinct. Providers receive an AbortSignal. A new query invalidates previous results immediately, including during debounce; only a current, enabled candidate may be accepted. Programmatic syncQuery never issues a request.

See the [search and candidate acceptance guide](../../guides/search.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify out-of-order responses cannot replace newer results, disabled candidates cannot be accepted, and accepted text does not start another search.
