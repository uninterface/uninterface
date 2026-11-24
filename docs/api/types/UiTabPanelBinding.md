# UiTabPanelBinding

Import from `@uninterface/uninterface`.

Producer-independent association consumed by UiTabPanel:

```ts
interface UiTabPanelBinding {
  readonly target: 'tab-panel'
  readonly value: string
  readonly tabs: UiTabsBinding
}
```

value is a stable nonempty key matching a UiTab declaration. tabs must be the exact binding object supplied to the corresponding bar, not a copied object. Selection/availability have one producer; panel visibility is derived rather than independently mutable. Keep one mounted panel boundary per key. The control's bindings.panel(key) creates and caches these objects; custom producers may construct them directly. Verify tab-panel associations, retained local content and errors for duplicate/unpaired declarations.

See [createUiTabsControl](../functions/createUiTabsControl.md) and the [panels guide](../../guides/panels.md).
