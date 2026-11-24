# UiTextSuggestionsBinding

Search and candidate acceptance: `UiTextSuggestionsBinding` is exported from `@uninterface/uninterface`.

## API

```ts
export interface UiTextSuggestionsBinding<T = unknown> extends UiSearchBinding<T> {
 text(item: T): string
}
```

Inherits all observations and operations from [UiSearchBinding](UiSearchBinding.md). `text(item)` adds the insertion-text projection; it neither changes result identity/labels nor owns the search control's lifetime.

The factory's text-input binding omits candidates whose projected text already equals the current query. The comparison uses exact text equality. If this leaves no suggestions, the popup closes. A genuinely empty response displays the localized no-matches message.

## Ownership and implementation

The owner creates and disposes the control. Query text, selected keys, and accepted business values are distinct. Providers receive an AbortSignal. A new query invalidates previous results immediately, including during debounce; only a current, enabled candidate may be accepted. Programmatic syncQuery never issues a request.

See the [search and candidate acceptance guide](../../guides/search.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify out-of-order responses cannot replace newer results, disabled candidates cannot be accepted, and accepted text does not start another search.
