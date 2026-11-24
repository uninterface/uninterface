# UiEntryCollection

Readonly observable collection state returned by `UiEntryControl.collection(parentKey?)`. Import from `@uninterface/uninterface`.

| Member | Meaning |
|---|---|
| `entries: readonly UiEntry[]` | Last applicable entries; treat entries as immutable |
| `status` | `idle`, `loading`, `ready`, `refreshing`, or `error` |
| `error: unknown` | Provider/contract failure, otherwise null |
| `query: string` | Request query, initially empty |

Clear returns the collection to idle with no entries or error while preserving its query. Ready plus an empty array is a successful empty result. Refresh can retain same-query entries; search clears old-query entries. Backends display localized generic failure text rather than exposing arbitrary server error details. Verify loading and failure cannot masquerade as empty success. See the [entry contract](../../contracts/entries.md).
