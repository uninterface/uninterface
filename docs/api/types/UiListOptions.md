# UiListOptions

Options for `createUiListControl<T, F, S>`, imported from `@uninterface/uninterface`. The business defines data and operations; the factory owns their UI orchestration.

| Option | Type / meaning |
|---|---|
| `itemKey` | `(item: T) => UiListKey`; stable, unique identity in each accepted result |
| `query` | `{ filters: Readonly<F>; sort: UiListQuery<F, S>['sort'] }`; required initial intent |
| `source` | `(query, { signal: AbortSignal }) => UiListResult<T> \| Promise<UiListResult<T>>`; already processed result, thrown failure |
| `sorting?` | [UiListSorting](UiListSorting.md); source mode and keys; omitted means no user sorting |
| `pagination?` | [UiListPaginationOptions](UiListPaginationOptions.md); omitted means no pagination facet |
| `selection?` | `'single' \| 'multiple'`; omitted disables selection |
| `disabled?` | `() => boolean`; live session restriction on new interactions |
| `itemDisabled?` | `(item: T) => boolean`; live restriction on that item's controller actions and new selection |
| `selectable?`, `removable?`, `activatable?` | `(item: T) => boolean`; omitted means allowed if the corresponding feature exists |
| `activate?` | `(item: T) => void \| Promise<void>`; independent action, no implicit row selection |
| `create?` | `(item: T) => UiListChange<T> \| Promise<UiListChange<T>>` |
| `update?` | `(key: UiListKey, item: T) => UiListChange<T> \| Promise<UiListChange<T>>` |
| `remove?` | `(key: UiListKey) => UiListChange<T> \| Promise<UiListChange<T>>` |

Configuration and operation functions are session definitions: do not replace them after construction. Restrictions may read reactive business state. Query changes use control methods. No operation is inferred from the existence of a source; a read-only source requires no fake save or delete operation.

Abort is advisory. Sources that ignore it remain protected by request revisions. Business items keep their original references and must maintain stable identity. Query data is copied/frozen as described by [UiListQuery](UiListQuery.md).

Verify no source invocation during construction, correct source-query typing, independent permission changes, and removal/activation using the same producer-independent button contract as other actions. See [usage](../../guides/lists.md).

Declare actual source support through `UiListOptions.sorting` (`mode` and allowed `keys`). Omission means no user sorting. Column `sortBy` only offers an association whose key is allowed by that declaration. Single mode replaces the previous column; multiple mode preserves ordered clauses. Initial and programmatic queries enforce the same restrictions before requests. See [sorting capabilities](../../guides/collection-sorting.md).
