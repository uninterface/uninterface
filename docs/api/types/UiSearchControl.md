# UiSearchControl

Search and candidate acceptance: `UiSearchControl` is exported from `@uninterface/uninterface`.

## API

```ts
export interface UiSearchControl<T> extends UiSearchBinding<T> {
 readonly bindings: {
  readonly select: UiSearchBinding<T>
  readonly suggestions: UiSearchBinding<T>
  textInput(options:{text(item:T):string}): UiTextSuggestionsBinding<T>
 }
 clear(): void
 dispose(): void
}
```

All query/result observations and operations are inherited from [UiSearchBinding](UiSearchBinding.md), including `query`, `results`, `status`, `error`, `setQuery`, `syncQuery`, `refresh`, `isCurrent` and `describe`. `clear` and `dispose` belong to this owner control; borrowing bindings do not expose disposal.

## Ownership and implementation

The owner creates and disposes the control. Query text, selected keys, and accepted business values are distinct. Providers receive an AbortSignal. A new query invalidates previous results immediately, including during debounce; only a current, enabled candidate may be accepted. Programmatic syncQuery never issues a request.

See the [search and candidate acceptance guide](../../guides/search.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify out-of-order responses cannot replace newer results, disabled candidates cannot be accepted, and accepted text does not start another search.
