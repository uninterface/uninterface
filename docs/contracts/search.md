# Search and input suggestions


## Search owner

`createUiSearchControl(provider, options)` creates one query session. The provider receives `{ query, signal }` and returns typed result objects synchronously or asynchronously. Options supply `key` and `label` projections and optional `disabled`, `debounceMs` and `minLength`. Example numbers below are explicit application choices, not defaults.

```ts
const customerSearch = createUiSearchControl(
  ({ query, signal }) => api.findCustomers(query, { signal }),
  {
    key: customer => customer.id,
    label: customer => customer.name,
    disabled: customer => customer.archived,
    debounceMs: 250,
    minLength: 2,
  },
)
```

Readonly reactive `query`, `results`, `status` and `error` expose search state. `setQuery(text)` applies configured search policy; `refresh()` immediately reloads/retries the current query; `clear()` clears query/results and invalidates pending work; `dispose()` ends the session. Successful empty results, debounce waiting, loading and failure must remain distinguishable. New query intent invalidates old result eligibility immediately, including during debounce. Backends must not independently filter out provider-matched or ranked results.

The provider decides matching and case sensitivity. An optional `matchRanges` projection describes which parts of the resolved label matched using `[start, end)` UTF-16 offsets. Highlighting uses those offsets and preserves the full accessible label.

Business compositions own provider meaning and control lifetime. Independent editors can share a provider while using separate sessions. Sharing a control instance intentionally shares query/results. The controller owns no field value, selected result or popup visibility. Reuse the existing entry request machinery without adding competing result ownership; preserve UiSelect's retained-label guarantees.

## Built-in targets

```vue
<UiField :field="form.fields.customer" label="Customer">
  <UiSelect :search="customerSearch.bindings.select" />
</UiField>
```

The stable select binding supplies candidates and search behavior, replacing the ordinary `control` candidate source for that instance. Supplying both is rejected. Typing changes search intent; accepting a candidate writes its string key through the existing field/codec path. Searching, empty results and provider failure do not erase the field's selected value.

Create a text-input binding once during owner setup:

```ts
const emailSuggestions = customerSearch.bindings.textInput({
  text: customer => customer.email,
})
```

```vue
<UiField :field="form.fields.email" label="Email">
  <UiTextInput :suggestions="emailSuggestions" />
</UiField>
```

The text projection distinguishes insertion text from result identity and display label. Typing edits the existing field draft; acceptance supplies completion text through normal field updates. Validation remains field-owned. Ordinary text is allowed, subject to field rules. The native `autocomplete` attribute still controls browser autofill. Initial support is single-line text, not password/multiline or token/caret completion. Reset and programmatic edits synchronize search context without issuing a search. Acceptance writes the field and then validates.

Both targets provide their own candidate presentation without an author-supplied wrapper. Backends may use combined native autocomplete components; shared contracts do not prescribe a common DOM tree. Bindings must be producer-independent rather than inspecting the concrete search factory.

The searchable select restores the committed label and drops an abandoned query on blur. An exact label match remains selectable. The factory's text-input binding omits candidates that would insert exactly the current text. Custom option content goes inside a backend-owned option through `#suggestion`, preserving its accessible label and activation. Unmodified Enter retries a failed open suggestion request.

During an incremental query, an open suggestions popup retains its preceding list through debounce and loading with selection disabled. The latest completed query replaces the list or shows its empty or failure state. Loading and updating feedback appears after 300 ms of request time. Retained rows are view state. The binding invalidates previous candidates at query intent.

## Custom editors

An editor with its own candidate presentation can consume control state and `setQuery` directly. It then owns keyboard, focus, accessibility and eligibility integration.

An optional `UiSuggestions` supplies the reusable attached candidate surface:

```vue
<UiSuggestions
  :binding="customerSearch.bindings.suggestions"
  @accept="applyCustomer"
>
  <template #host="{ host }">
    <input v-bind="host" v-model="draft" aria-label="Customer lookup" />
  </template>
</UiSuggestions>
```

This example belongs inside a custom editor owning `draft` and `applyCustomer`. The host binding attaches to the actual editing element and coordinates query/IME events, keyboard interaction and accessible associations without owning the draft. The suggestion surface owns presentation-session visibility/highlighting, positioning and dismissal. Acceptance supplies the original typed result and rejects stale/disabled candidates. The custom editor decides how to apply it; explicit synchronization is required for programmatic model changes using syncQuery.

Opaque third-party components require a bridge to their actual target, query changes and focus. Blindly forwarding host attributes to a wrapper is insufficient. Existing handlers and description associations must survive integration. The candidate surface is an input/listbox interaction, not a tooltip or command menu. Host members are documented by UiSuggestions; forward them to the actual editor and preserve application listeners.

## Observable acceptance

Verify independent sessions, cancellation and out-of-order responses, stale-result rejection during debounce/before rerender, loading/empty/error/retry states, retained select values/labels, completion text different from key/label, field reset and programmatic edits, custom producers, custom-host forwarding and disposal. Browser checks must cover IME, caret/focus preservation, keyboard/pointer acceptance, Escape/Enter behavior, disabled/read-only guards, accessible names/state/descriptions, narrow/RTL presentation and modal popup hosting across supporting backends.

Native toolkit source inspection establishes implementation routes, not these guarantees. Paging, persistent caching and richer completion scopes remain outside this implementation.
