# UiTabsControl

Import from `@uninterface/uninterface`.

Factory-created owner returned by createUiTabsControl. It exposes read-only `state: UiTabsState`, `bindings.tabs: UiTabsBinding`, `bindings.panel(key): UiTabPanelBinding`, `select(key): boolean` and idempotent `dispose(): void`. Panel bindings are cached by key. The owner keeps the control alive for the intended composition lifetime and disposes it explicitly; a view does not own external controls. Owner selection can target a disabled trigger, but must agree with rendered declarations by the next Vue render. Disposal freezes the selected display and disables activation; owner select/new panel-binding operations then throw. Verify changes propagate without a second selection owner, and unmounting a view preserves selection.

See [createUiTabsControl](../functions/createUiTabsControl.md) and the [panels guide](../../guides/panels.md).
