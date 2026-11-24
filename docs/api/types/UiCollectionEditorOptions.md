# UiCollectionEditorOptions

`UiCollectionEditorOptions<T, E extends UiListValueEditor<T>, F = Record<string, unknown>, S extends string = string>` is imported from `@uninterface/uninterface`.

| Member | Meaning |
|---|---|
| `value` | Required borrowed UiListValueControl; remains the only editable membership/draft/baseline owner |
| `createItem?: () => T \| Promise<T>` | Business factory for a fresh keyed draft; called only on accepted Add activation |
| `disabled?: () => boolean` | Additional business restriction; ending it never removes a value/form lock |
| `presentation?` | Local query configuration and synchronous `project(items, query): UiListResult<T>` |

Presentation declares `query`, optional `sorting` and `pagination` using UiListOptions semantics. Omission presents the complete full-order projection with no sorting/pagination. A project callback selects/orders/pages the supplied typed items; return those item objects unchanged. It must not fetch, edit drafts or validate. Unknown/copied/reconstructed items reject the source read and use normal list error state. Supported examples include `items.filter(...)`, sorted copies of the array and page slices. Declare accurate result completeness/pagination; views do not run another query pipeline.

Core shares `value.itemKey` rather than asking for another identity rule. Construction/formatting failures retain existing membership. A late factory is abandoned when the controller/value ends, a restriction appears or the raw draft changes while it is awaited. The factory must not mutate the active session. Cancellation prevents later insertion; it does not undo external business side effects.

Verify key identity, filtered hidden-child retention, complete parent validation, errors without partial insertion and asynchronous factory cancellation. [Usage](../../guides/collection-editors.md).
