# Search and suggestions

Search owns a query and a changing set of candidates. A selected business value remains separate: searching must not clear an accepted selection merely because the new results omit it. `createUiSearchControl` shares entry request cancellation and freshness rules, and supplies target-specific bindings for select and text inputs.

```ts
import { createUiFieldControl, createUiSearchControl } from '@uninterface/uninterface'
const selected = createUiFieldControl('')
const search = createUiSearchControl(
  async ({ query, signal }) => {
    const response = await fetch(`/api/records?q=${encodeURIComponent(query)}`, { signal })
    if (!response.ok) throw new Error('Search unavailable')
    return response.json() as Promise<{ id: string; name: string }[]>
  },
  { key: item => item.id, label: item => item.name, debounceMs: 150, minLength: 1 },
)
```

```vue
<UiField :field="selected" label="Record">
  <UiSelect :search="search.bindings.select" />
</UiField>
```

The field stores the selected key. A codec can translate that key to a domain value. Supply search instead of the ordinary select control/options source; do not mix ownership. Programmatic field changes synchronize the collapsed label without searching.

The provider can return a filtered array synchronously or fetch a remote result asynchronously. It decides case sensitivity, matching, and order. To highlight the text that matched, supply `matchRanges: item => item.matches` in the control options. Each range is a `[start, end)` pair of UTF-16 offsets into the label, using the same offsets as JavaScript `slice`. A remote service can supply these ranges alongside its result records.

For text completion, use a string field and a text projection:

```ts
const name = createUiFieldControl('')
const suggestions = search.bindings.textInput({ text: item => item.name })
```

```vue
<UiField :field="name" label="Name">
  <UiTextInput :suggestions="suggestions" />
</UiField>
```

Acceptance inserts the projected text and validates the field. It does not store the candidate object. Suggestions require single-line text mode. For custom host behavior, UiSuggestions exposes a host slot and emits accept(item); the owner performs the business action. Forward the supplied host attributes/listeners to one editor, preserving its accessible name.

An exact insertion-text match is omitted in the factory's text-input binding. A searchable select keeps an exact label match available because accepting it can set the record's key. Both built-in controls and `UiSuggestions` accept the [scoped `#suggestion` slot](../api/components/UiSuggestions.md#api) for richer candidate content.

The provider receives AbortSignal and should stop unnecessary work when aborted. Even an uncooperative provider cannot commit stale results. Each query intent immediately invalidates the previous candidate objects before debounce begins. `syncQuery` synchronizes accepted/programmatic text without searching; `refresh` explicitly issues a request. `clear` clears query/results. The business owner calls `dispose` at the end of the session; removing a borrowing view does not dispose it. Use separate controls for independent queries.

Observable checks: type two queries and resolve them out of order; only the latest candidates remain actionable. Test disabled candidates, no results, failure/retry, IME composition, Arrow/Enter/Escape navigation and retained selected values. Physical popup geometry, IME and keyboard acceptance require browser execution.
