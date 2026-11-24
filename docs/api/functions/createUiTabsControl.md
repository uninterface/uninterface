# createUiTabsControl

Creates the owner of a tab selection and bindings for one bar and its separately placed panels. Import from `@uninterface/uninterface`.

```ts
const tabs = createUiTabsControl({ selectedKey: 'details' })
onScopeDispose(() => tabs.dispose())
tabs.select('notes')
```

Accepts [UiTabsOptions](../types/UiTabsOptions.md) and returns [UiTabsControl](../types/UiTabsControl.md), a factory-created object. The owner supplies the initial key; labels and disabled triggers are declared through UiTab, rather than duplicated in the control.

`select(key)` is an owner operation. It accepts a nonempty key, returns whether selection changed, and may select a disabled trigger. Selection can be prepared before mounting or before adding a declaration; the rendered UiTabs must contain that key by the next render. User requests from bindings are limited to registered enabled tabs and are ignored after disposal. Unmounting a view does not change owner state. Disposal is idempotent, disables existing triggers, freezes the selected display and rejects subsequent owner operations; it does not dispose panel contents or field/form controls.

In Vue setup, identity uses Vue useId and the application's idPrefix. Outside setup, an explicit document-unique id is required for SSR/hydration; the automatic counter is suitable only for client-only use. For custom acceptance/denial, provide a producer-independent UiTabsBinding and matching UiTabPanelBindings. No two-way synchronization loop or second displayed-selection state is needed.

Verify selection propagation, stable cached panel bindings, disabled user requests versus owner operations, view-remount retention and repeated disposal. See [panels](../../guides/panels.md).
