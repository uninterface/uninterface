# UiListItemContext

Controller-backed interaction for one stable key, imported from `@uninterface/uninterface` as `UiListItemContext<T>`.

| Property / method | Meaning |
|---|---|
| `key` | Stable identity; never a view index |
| `item: T \| undefined` | Current accepted record, absent while unloaded or removed |
| `selected`, `selectable` | Retained membership and present eligibility for selection |
| `disabled` | Session/item restriction, disposal or no currently accepted record |
| `pending`, `error` | Latest per-key controller action state; separate from read state |
| `bindings.removeButton?` | [UiButtonBinding](UiButtonBinding.md) when removal is configured |
| `bindings.activateButton?` | Independent action binding when activation is configured |
| `requestSelected(boolean)` | Guarded selection request; does not activate or remove |

Contexts are cached by identity during the live session and resolve the newest same-key item. Buttons use `type: 'button'`. Loading belongs to the action being performed; all same-key controller actions are disabled while it is pending. Errors retain the item and permit an explicit action retry when restrictions allow it. Buttons can be invoked as detached callbacks and must guard availability before any rerender.

An item-level restriction does not imply disabling arbitrary business content, links or independent editors inside its slot. Selection/removal/activation remain distinct operations. A removed/unloaded item's action cannot target another row by its former position. Keys must not be recycled for unrelated entities within the session.

Views present bindings and errors without independently inferring promise state or calling persistence. Verify live permissions, duplicate removal, pending action isolation, canonical replacements, removal of selected identity and inert disposed actions. See [actions](../../guides/lists.md#keep-selection-and-item-actions-separate).
