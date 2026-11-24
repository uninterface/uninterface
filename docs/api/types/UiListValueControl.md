# UiListValueControl

`UiListValueControl<T, E extends UiListValueEditor<T> = UiListValueEditor<T>>` is a factory-created object, imported from `@uninterface/uninterface`. It owns an editable collection independently of its presentation.

| Member | Meaning |
|---|---|
| `field` | `UiFieldControl<readonly T[]>`; contributes all children to one parent form |
| `state.items` | Full keyed order with copied last successfully parsed typed values; read-only projection, not an editing API |
| `state.revision` | Reactive projection/membership revision; owners can refresh a local list source |
| `state.pending` | Some child projection is still parsing |
| `state.stale` | At least one raw draft is not represented by its last successful projection; waiting for a validation boundary is stale without being pending |
| `state.invalidKeys` / `firstInvalidKey` | Invalid children in full business order, including hidden ones |
| `state.disposed` | Owner has ended |
| `editor(key)` | The owned typed editor; unknown/disposed keys reject |
| `insert(item, { before? })` | Insert before a known key, otherwise append; duplicate keys reject |
| `remove(key)` | Remove and dispose its editor exactly once |
| `replace(key, item, { discardDraft? })` | Same identity only; dirty replacement requires explicit `discardDraft: true`; retains the accepted baseline |
| `move(key, { before? })` | Reorder membership without replacing editors; omission moves to end |
| `revealInvalid(reveal, focus)` | Await business reveal of the first invalid key, then call `focus(editor, key)`; returns `Promise<boolean>` |
| `dispose()` | Stop coordination, release claims/locks, invalidate asynchronous results, and dispose owned editors |

Membership methods return `Promise<boolean>`. Disabled sessions return false without mutation; invalid identities/operations reject. Use these methods instead of mutating state arrays. A whole `field.set()` replacement conflicts with a dirty collection; deliberate `field.accept()` is authoritative baseline adoption. Canonical parent acceptance is normally selected through `form.submit(save, { accept })` or UiForm.accept.

`revealInvalid` takes `(key) => Promise<void>` and `(editor, key) => boolean | Promise<boolean>`. Clear filters/select the page and await rendering in reveal; use a view's public focus handle in focus. Changes to membership/draft, owner disposal or a newer recovery cancel stale focus. Business reveal callbacks must not mutate the validated draft.

Last valid projection values are retained while raw input is invalid. Check `stale`, `pending` and `invalidKeys` before treating totals as current; do not submit this projection. Under `projection: 'validate'`, edits mark the projection stale immediately and retain values until explicit child validation (text blur) or coordinated parent validation. No automatic initial inspection runs in this mode. The parent submits freshly validated full values. Same-key canonical acceptance reuses editors. Changed keys dispose old editors and create clean new ones; use stable local identities when persistence should preserve editor identity.

Implementation responsibilities include staged preparation before publication, exclusive claims/cycle protection, private child validation, independent locks and asynchronous currentness checks. Verify complete hidden-child validation, failures without partial membership/baseline changes, retention across views and cleanup exactly once. See [the guide](../../guides/editable-collections.md).

`itemKey(item): UiListKey` exposes the value owner's stable identity rule to borrowing projections. `findEditor(key): E | undefined` is a safe lookup for stale rendered rows; unknown, removed or disposed targets return undefined. The existing editor(key) remains strict. [Collection editors](../../guides/collection-editors.md) use both without creating a second membership authority.
