# createUiEntryControl

Creates a business-owned source/selection control. Import from `@uninterface/uninterface`.

```ts
const entries = createUiEntryControl(async ({ signal, query }) => {
  const response = await fetch(`/api/choices?q=${encodeURIComponent(query)}`, { signal })
  if (!response.ok) throw new Error('Choices unavailable')
  const records = await response.json()
  return records.map(record => ({ key: record.id, label: record.name }))
})
onUnmounted(() => entries.dispose())
```

Signature: `createUiEntryControl(source: UiEntrySource, options?: { selection?: readonly UiEntrySelection[] }): UiEntryControl`.

Static sources are available immediately; asynchronous providers remain idle until load/search/refresh. Views request loading according to their lifecycle; UiSelect supports deferring it until selection intent through autoLoad=false. Clear unloads a collection without replacing its control or losing retained descriptions. Scopes and source identity are fixed at construction. For a different source integration create a new control, or return updated business data on refresh. No presentation backend or provider is required to use the factory.

The control manages requests, revisions, result state and selection. Application code defines data meaning and owns lifetime; backends render. Verify asynchronous failure/retry, selection retention and disposal using the [entry contract](../../contracts/entries.md) and [control reference](../types/UiEntryControl.md).
