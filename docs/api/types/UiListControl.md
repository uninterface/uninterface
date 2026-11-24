# UiListControl

`UiListControl<T, F, S>` is the object returned by [createUiListControl](../functions/createUiListControl.md), not a class. Import its type from `@uninterface/uninterface`.

| Member | Contract |
|---|---|
| `hasColumnSort`, `hasColumnFilter` | Read-only reactive booleans: a mounted, active table borrowing this control offers at least one declared, backend-supported column sort/filter control |
| `state` | Read-only reactive [UiListState](UiListState.md) |
| `bindings.list` | Stable [UiListBinding](UiListBinding.md) |
| `bindings.paginator`, `pagination` | Same optional [UiPaginatorBinding](UiPaginatorBinding.md); absent without pagination |
| `refresh(): Promise<boolean>` | Load the requested window; accumulation restarts at the initial cursor |
| `retry(): Promise<boolean>` | Retry the last failed read, including its append/replace intent; false without one or while unavailable |
| `setQuery({ filters?, sort? }): Promise<boolean>` | Replace supplied query parts, restart position and issue one read |
| `select(key, selected): boolean` | Require enabled selection; new selection requires an eligible accepted item; existing unloaded keys may be deselected |
| `clearSelection(): void` | Clear retained selection unless session-disabled |
| `applyConfirmed(change): void` | Incorporate [UiListChange](UiListChange.md), invalidate earlier reads; never save or auto-refetch |
| `create(item)`, `update(key, item)`, `remove(key)` | `Promise<boolean>`; invoke configured business operation under per-key guards and reconcile its result |
| `dispose(): void` | Idempotently reject late publication, disable bindings and release transient bookkeeping; retain the accepted display |

Reads resolve true only when accepted; mutations resolve true after their confirmed result is incorporated. Source/mutation failure, supersession, disposal during a request, restrictions and duplicate pending actions resolve false. Invalid configuration/query/unsupported owner operations throw or reject. An update must return an upsert with the requested key; removal must confirm the requested key. Create may return a canonical new identity. Temporary child-editor identity reconciliation remains outside this control.

Owner operations after disposal throw/reject. Binding read retries/query requests/continuations and button activation become inert; paginator owner-like absolute operations reject after disposal. Disposal does not undo persistence already dispatched. `applyConfirmed` is an owner notification, so it may incorporate an already saved result while user interaction is disabled.

The owner supplies cleanup and business operations. Views do not call `dispose`, mutate state or reproduce request logic. Verify that confirmed replacements survive old reads, failed operations preserve records, removed selection clears, and changing a borrowed view has no lifecycle effect. See [list sessions](../../guides/lists.md).

These are presentation observations, not query-active flags or permissions. They become false for cards/list-only presentations, before client mount, after deactivation/unmount, or after control disposal. A disabled table still has the capabilities. They react to conditional declarations and never fetch data. With multiple views of the same binding, each flag is true when **any** mounted, active table provides that control; they do not select a particular view. CSS-only hiding and insufficient-width fallback are not visibility detection. Unmount/deactivate a view that should cease contributing. Independently owned controls remain isolated.

Use these flags to omit only controls that your business composition knows have header equivalents. Keep cross-column, special and unrepresented filters available. See [column filtering](../../guides/column-filtering.md) for the shared-query pattern and lifecycle limits.
