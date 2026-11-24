# UiSelect

Chooses one string editing value from a shared static or asynchronous entry control. Import from `@uninterface/uninterface`. Place inside UiField with application localization installed. Requires `input.select.single.v1` and `input.select.source.v1`.

UiSelect is an [input-styled control](../../contracts/input-styled-controls.md), including when using a search binding. Its closed surface follows the shared field placement, input-frame and focus agreement; the candidate popup keeps its selection-specific behavior. The backend owns this look and feel without business-side CSS.

```ts
const categories = createUiEntryControl([
  { key: 'services', label: 'Services' },
  { key: 'supplies', label: 'Supplies' },
])
```

```vue
<UiField :field="form.fields.category" label="Category" required>
  <UiSelect :control="categories" placeholder="Choose a category" />
</UiField>
```

`control: UiEntryControl` is required. Optional `disabled?: boolean` defaults to false and adds a local restriction; see the [common control API](../../guides/controls.md). Optional `placeholder: string` supplies the collapsed empty-value label without adding a selectable candidate (a hidden, disabled option in native selects). It is never a selectable clear action. With no placeholder the empty display is blank. An explicit empty-string entry supplied by the source is a business choice and takes precedence while ready. A selected key uses its current candidate label, then its retained description, then the raw key itself. Unknown keys remain valid display values even when candidates are unloaded, missing or failed; callers do not need to maintain a separate label or resolve it before rendering. The field owns selection and validation; candidate entries must not participate in a control selection scope. The selected key is the field's string editing representation, which its codec can map to typed data.

`autoLoad?: boolean` defaults to true, requesting initial loading automatically. Set `:auto-load="false"` to defer loading until the user attempts selection or the business calls `control.load()`. Pointer activation and selection keyboard input request loading only while idle. Merely focusing the select does not load; reopening a failed source does not automatically retry. Turning autoLoad on or replacing the control while it is on requests loading through the same cached operation. Turning it off does not cancel an existing request.

Source state is visible inside the selection control:

| Source state | Candidate presentation |
|---|---|
| Idle | Nonselectable “Entries not loaded.” status |
| Loading or refreshing | Backend-native loading presentation; “Loading entries…” is the fallback for manual presentation |
| Error | Nonselectable “Entries could not be loaded.” status |
| Ready with no candidate items | Nonselectable “No entries available.” status |
| Ready with candidates | Supplied choices; placeholder remains hidden |

The quoted messages are English defaults supplied through application localization. Loading presentation, including its text or indicator, belongs to the backend: a toolkit's native loading UI and localization take precedence over the fallback `entriesLoading` message. Providing a core default does not make it business-authored wording or require visible loading text. The select stays enabled and openable unless its effective disabled state prevents interaction. The collapsed display always shows the selected label or placeholder. Source state appears as nonselectable content inside the opened picker, using disabled options for native selects or toolkit loading/status areas for composite pickers; they never become the field value or replace its selected label. When results are unavailable, the collapsed value remains independent of the source-status area. Native selects use a hidden disabled value-preserving option. Cached alternatives cannot be chosen during idle/loading/refreshing/failure.

Known selected descriptions survive refresh, clear and search even when absent from results. Absence does not clear or invalidate the field; business rules decide validity. A retained absent choice is hidden in the candidate list and still supplies the collapsed label. Source failure is separate from field invalidity. The business composition supplies source recovery controls through `control.load()` or `control.refresh()`; UiSelect renders no recovery button. A persistent, visually hidden polite status region announces updates without another visible status line. Native popup rendering and live updates depend on the browser's native picker and require browser acceptance checks.

`control.clear()` unloads candidates, invalidates pending requests and retains selection descriptions; it does not clear the field. Opening after clear loads again, including when autoLoad is enabled, without an immediate reload caused by clearing itself. The business owns control disposal.

Backends may render a native single select or a composite picker while fulfilling the same selection and source-state contract. One level of group labels, disabled items and asynchronous sources are supported. Rich content uses text fallback; separators are omitted. Submenus/nested groups fail loudly. Editable comboboxes, remote-search input and multiple selections are outside this component's current capability. A business search control may call the entry control's search method independently.

No slots or public emitted events. A template ref exposes `focus(): Promise<boolean | null>` with the [shared focus contract](../../guides/controls.md#focus); focusing does not open the picker. Native control attributes/listeners are forwarded to the selection target; reserved field bindings must not be overridden. Core awaits field.set and validate after eligible changes, and validates on blur. Backends implement field naming/feedback, native keyboard behavior, disabled/busy state and source status without another value owner.

Verify an unknown selected key displays raw text and gains its label when loaded without changing the field value; verify idle, loading, failure and empty states inside the control; choosing a key updates the field; asynchronous failure/retry preserves selection; disabled and stale choices cannot be committed; and invalid required values follow field rules. See the [entry contract](../../contracts/entries.md).

## Native and composite presentations

Backends may use a browser-native select or a composite picker. Presentation does not change public value or search capabilities; concrete interaction and customization support belong in backend documentation.

The choice may be presented by a native select or a toolkit combobox/listbox. Both must preserve the supplied value and collapsed label, omit hidden placeholder/retained-value records from candidates, make disabled/status entries unselectable, and remain openable during source loading or failure. Composite presentation does not imply editable search, multiple selection or any other extra public capability. Labels, descriptions and state belong on the actual interaction target, including when the toolkit renders wrappers or teleports the candidate surface. Shared acceptance checks observe these semantics; native option-element assertions apply only to native presentations.

Requires backend `control.focus.v1` for the shared focus handle.

An open composite picker handles Escape by closing its choices and returning
focus to its trigger. A later Escape follows the enclosing overlay's dismissal
policy. Browser-managed native select popups follow platform behavior.
See the [frame contract](../../contracts/frame.md#modal-run-contract).

## Search binding

Optional `search: UiSearchBinding` replaces the ordinary entry source with query-driven candidates. Do not combine it with control/options. The field continues to own a string key; query text is not the selected value. Candidate acceptance is current/disabled gated. See the [search guide](../../guides/search.md).

When the editor loses focus, it restores the committed label and clears candidates for any abandoned query. Exact label matches remain eligible in search mode. Use the optional `#suggestion` slot in that mode to customize option content with the [UiSuggestions slot contract](UiSuggestions.md#api).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
