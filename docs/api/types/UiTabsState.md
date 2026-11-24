# UiTabsState

Import from `@uninterface/uninterface`.

Read-only reactive observations: `selectedKey: string` and `disposed: boolean`. The selected key determines both selected tab and displayed panel. Keyboard focus is separate and backend-owned. Read properties reactively rather than destructuring their current primitive values. Disposal preserves selectedKey while freezing interactions. Verify programmatic selection updates panels and the tab bar together.

See [createUiTabsControl](../functions/createUiTabsControl.md) and the [panels guide](../../guides/panels.md).
