# UiExpansionControl

A factory-created owner of keyed expansion, independent of view mounting, layout and backend. Import this interface from `@uninterface/uninterface`; create instances with createUiExpansionControl.

| Member | Meaning |
|---|---|
| `state: UiExpansionState` | Stable read-only reactive observations |
| `bindings.collapsible(key): UiCollapsibleBinding` | Stable target-specific binding per key |
| `bindings.drawer(key): UiDrawerBinding` | Stable drawer-panel binding per key; shares expansion with collapsibles |
| `expand(key): boolean` | Open a key, replacing other keys in single mode |
| `collapse(key): boolean` | Close a key |
| `toggle(key): boolean` | Request the opposite current state |
| `setExpanded(keys): boolean` | Replace expanded keys after validating the current policy |
| `setMode(mode, expandedKeys?): boolean` | Atomically change policy and optionally replace expanded keys |
| `dispose(): void` | Idempotently close all keys and invalidate future mutation |

Mutations return whether state changed. Invalid keys, duplicates and single-mode overflow throw before mutation. Mode changes retain existing keys unless the second argument is supplied. Switching a multi-open state to single mode therefore requires an explicit retained set, for example setMode('single', ['billing']); no arbitrary panel is selected silently.

Multiple views may share a binding. Removing a view does not erase expanded state. setExpanded can deliberately forget keys no longer relevant to the business task. No DOM registration or global group exists. A disposed control rejects imperative mutations and binding requests for new keys; cached binding lookups remain valid, and previously obtained bindings remain inert, disabled and collapsed. View teardown does not dispose an externally owned control. The business owner calls dispose at the end of its chosen lifetime.

Bindings coordinate state, not visual adjacency or cross-panel keyboard navigation. Local disabled prevents user toggling but does not veto automatic collapse or programmatic changes. There is no dirty-form inference, async guard protocol or exactly-one-open policy. Backends consume each view's resolved state and preserve the owner's decision.

Verify single/multiple behavior, explicit mode narrowing, stable binding identity, independent owners, unmount/remount retention and stale requests after disposal. See [panels](../../guides/panels.md).
