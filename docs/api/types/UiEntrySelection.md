# UiEntrySelection

Selection rules supplied separately from entries to `createUiEntryControl`. Import from `@uninterface/uninterface`.

```ts
{ key: 'columns', mode: 'multiple', keys: ['name', 'email'], selectedKeys: ['name'] }
```

`key: string` names the scope. `mode` is `single` or `multiple`. Optional `keys: readonly string[]` limits membership; omitting it covers all ordinary items and cannot coexist with another scope. Optional `selectedKeys` supplies initial state. Single scopes accept at most one key. Scopes cannot overlap; their configuration is fixed for the control lifetime.

State is read through `selectedKeys(scope)` and changed through `choose(key)` or `setSelectedKeys(scope, keys)`. Menu presentation derives check/radio indicators; no special entry kind is required. Parent–descendant selection propagation is not implied. Verify independent scopes, empty selection, toggling and selection retention across source changes. See the [entry contract](../../contracts/entries.md).
