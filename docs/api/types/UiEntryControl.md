# UiEntryControl

The interface returned by [createUiEntryControl](../functions/createUiEntryControl.md). Import from `@uninterface/uninterface`. It owns sources and optional selection, independently of menu/select presentation.

| Member | Contract |
|---|---|
| `collection(parentKey?): UiEntryCollection` | Read root or submenu collection state; unknown submenu throws |
| `load(parentKey?): Promise<void>` | Load if needed; reuse ready data or in-flight work |
| `clear(parentKey?): void` | Unload root or submenu candidates, abort/invalidate pending work and discard descendant caches; preserve query, selection and known descriptions; no request is started |
| `refresh(parentKey?): Promise<void>` | Explicitly reload; supersede pending work |
| `search(query): Promise<void>` | New root provider request with query; supersede pending work; static arrays reject search |
| `find(key): UiEntry | undefined` | Look up an entry in current known structure |
| `describe(key)` | Last known non-separator description, including previously loaded entries |
| `selectionFor(key): UiEntrySelection | undefined` | Applicable scope configuration, if any; use selectedKeys(scope) for current state |
| `selectedKeys(scope): readonly string[]` | Current selection as a duplicate-free readonly array |
| `setSelectedKeys(scope, keys): void` | Explicit business assignment; can clear selection or refer to unloaded entries |
| `choose(key): boolean` | Reject absent/structural/disabled entries; update a scope when applicable; true for eligible actions |
| `dispose(): void` | Abort/invalidate requests; reject further mutations |

Load failures are represented by collection status/error; structural contract errors reject promises. Clear sets status to idle and error to null, even for previously failed or already unloaded collections. Static sources can also be cleared and reloaded from their original array. A subsequent load starts a fresh request rather than reusing discarded pending work. Descriptions and selection survive clear and query changes for this control's lifetime. Loading or expanding does not activate entries. UiSelect uses candidates with field-owned selection; menu scopes are optional. Business code owns disposal. Test providers that ignore AbortSignal to verify stale-result protection. See the [entry contract](../../contracts/entries.md).

`collection`, `find` and `describe` expose the original definitions, whose text properties may be [UiTextSource](UiTextSource.md). Built-in views resolve them reactively. For custom business reads, use Vue `toValue(entry.label)` within rendering/computed evaluation; avoid capturing a one-time setup snapshot. See [text sources](../../guides/text-sources.md).
