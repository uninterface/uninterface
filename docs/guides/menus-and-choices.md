# Menus and asynchronous choices

Use [UiEntry](../api/types/UiEntry.md) definitions to describe available things, then choose the host matching their meaning: UiSelect for a field value, UiMenu for actions/selectable settings, or UiNavMenu for navigation. All share [createUiEntryControl](../api/functions/createUiEntryControl.md).

Define stable keys and text labels. Use groups for labelled peers, submenus for separately opened collections, and separators for boundaries. Keep item content non-interactive; richer local rendering retains a text fallback. Sources can return arrays immediately or load asynchronously. Do not expose backend loading plumbing to consumers of a business component.

```ts
const commands = createUiEntryControl([
  { key: 'refresh', label: 'Refresh' },
  { kind: 'group', key: 'columns', label: 'Visible columns', entries: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ] },
], {
  selection: [{ key: 'columns', mode: 'multiple', keys: ['name', 'email'], selectedKeys: ['name'] }],
})
onUnmounted(() => commands.dispose())
```

```vue
<UiMenu :control="commands" mode="popup" aria-label="Record commands" @activate="runCommand">
  <template #host="{ buttonTrigger }">
    <UiButton v-bind="buttonTrigger">Record commands</UiButton>
  </template>
</UiMenu>
```

`runCommand` receives a key. It can dispatch ordinary actions; selection scopes already update before the event. Read `commands.selectedKeys('columns')` to observe choices. The entry definition has no checkbox/radio kind. Multiple views can share the same control, preserving selected keys; each view owns a separate open/expanded session.

For form choices, create an entry control without selection scopes and pass it to UiSelect inside UiField. The field remains the one value owner. An unknown selected key displays as its raw text until a candidate label becomes known; no separate label mapping or additional fetch is required merely to render the selection. Dispose the source with the business editing session. Async providers should accept AbortSignal; core still rejects stale results if they do not.

For navigation, define keys and labels and handle `activate(key)` to request a destination. The application can map keys to routes or maintain a local current panel. Bind `:model-value="pageKey"` from the confirmed destination; UiNavMenu does not update it before navigation succeeds. Optional hrefs supply native links; coordinate your handler with browser navigation when using them. Selection scopes are not an implicit router. UiNavbar can supply the navigation landmark around either a native toolkit menubar or a link/disclosure presentation.

```ts
const destinations = createUiEntryControl([
  { key: 'orders', label: 'Orders' },
  { key: 'customers', label: 'Customers' },
])
// requestDestination(key) performs application navigation; only an accepted
// destination updates pageKey. No href or toolkit routing API is required.
```

Verify the business composition against each backend intended for deployment: load and retry a failed source, open a lazy submenu, choose multiple settings, operate with keyboard, and confirm selection survives a refresh. See the [entry contract](../contracts/entries.md) for scope and [component references](../api/components/README.md) for all props and slots.

UiMenu mode describes only inline or popup presentation. Popup hosts supply their button or context target through [host bindings](../api/types/UiMenuHostBindings.md); concrete positioning remains backend-owned. Submenus float independently of root mode. Navigation modelValue marks the destination without opening its submenu.

## Explicit loading and recovery

UiSelect loads its source automatically by default. Use `:auto-load="false"` to defer loading until pointer/keyboard selection intent or an explicit call to the entry control's `load()`. Calling `clear()` unloads candidates and invalidates pending requests without clearing the field or its known label. Do not reproduce loading, error, or selected-value state in the business composition.

The collapsed select displays the chosen label or a hidden placeholder. Unloaded, loading, failed and empty-source status appears inside the opened picker. Native selects use disabled options; composite pickers use native loading/status areas and wording where available. The select remains openable unless the field itself is disabled. A business source control can request recovery with `control.load()` or `control.refresh()`; UiSelect has no recovery button, and reopening a failed list does not automatically retry. Source messages never become field values or validation errors.

Use a controllable source in your test. Select a candidate, start another request, clear the source and then complete the old request. Verify that the old results are discarded and that both clearing and a later failed load preserve the selected value.

For dynamic text in reusable definitions, use [UiTextSource and the text-source practice](text-sources.md). Keep stable identities independent of labels; ordinary component text props continue to use Vue bindings.
