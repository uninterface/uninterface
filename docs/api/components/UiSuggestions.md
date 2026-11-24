# UiSuggestions

Search candidate surface. Import from `@uninterface/uninterface` in an application initialized by createUiApplication.

## API

Required `binding: UiSearchBinding<T>` and optional `disabled?: boolean`. Emits `accept(item: T)` only for an enabled current candidate. Host slot receives `{ host }`, containing editor attributes/listeners; forward them to one text editor. Candidate labels come from the binding.

The optional `#suggestion` slot receives `item`, `label`, `active`, `disabled`, and `labelParts`. `item` is the original provider result and each label part has `text` and `matched`. Use the slot for content inside an option, such as a name and a record code. Keep interactive elements outside the slot. The backend supplies the option container, accessible name from `label`, and selection interaction. With the default content, match ranges in the result are emphasized automatically.

Optional `engagement?: (value: boolean) => void` reports owned-popup engagement to a composing editor. Connect it to that editor's participation handle when suggestions belong to a shared control frame; it does not own query state or validation. Backend integration must release engagement on closure, deactivation and disposal. See [control-frame participation](../../guides/control-frames.md).

```vue
<UiSuggestions :binding="search.bindings.suggestions" @accept="accept"><template #host="{ host }"><input v-bind="host" aria-label="Search" /></template></UiSuggestions>
```

## Ownership and implementation

The binding owns query and result freshness; the host owner owns its text and accepted value. Backends own popup, active descendant, Arrow/Enter/Escape interaction and IME handling. UiTextInput suggestions and UiSelect search provide integrated ownership.

The included backends size the popup to the editing control and update it while open as the control resizes. Native popup padding, borders and available viewport space can affect the list's usable width.

See the [search candidate surface guide](../../guides/search.md) for setup and composition.

## Observable verification

Verify disabled and stale candidates cannot be accepted, Arrow keys preserve editor focus, Enter accepts, Escape closes, and IME composition does not search partial text.

An open list keeps the previous suggestions visible and disables selection while the next query is debouncing or loading. The latest results replace the previous list together. A request still loading after 300 ms shows loading feedback for an initial search or a compact update message beside retained results. Unmodified Enter retries a failed open request. Verify the popup stays dismissed when a pending response completes after Escape.

The empty message describes a query that returned no matches. If text completion found only the text already entered, the popup closes.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

The outward declaration concerns the host/trigger composition. Its owned popup is separately registered in the owning Surface’s Floating layer; moving the host does not change that automatic attachment.
