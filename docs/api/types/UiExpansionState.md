# UiExpansionState

Read-only reactive observations of an expansion control. Import from `@uninterface/uninterface`.

| Member | Meaning |
|---|---|
| `mode: UiExpansionMode` | Current single/multiple coordination policy |
| `expandedKeys: readonly string[]` | Immutable snapshot of expanded keys, preserving insertion order |
| `disposed: boolean` | Whether the owner ended the control's lifetime |

The state object is stable and its getters track reactive updates. Read through control.state or a computed value; destructuring a property captures its current value. State changes replace the internal snapshot atomically, so synchronous observers cannot see a single-mode state with multiple expanded keys. Disposal clears expandedKeys and sets disposed. Views never mutate these observations.

Verify synchronous observation of coordinated changes and rejection of writes to snapshots. See [UiExpansionControl](UiExpansionControl.md).
