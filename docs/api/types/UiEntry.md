# UiEntry

Import this union from `@uninterface/uninterface`. It describes one keyed occurrence in an entry tree. See the [entry contract](../../contracts/entries.md) for all properties and invariants.

```ts
const entries: UiEntry[] = [
  { key: 'refresh', label: 'Refresh', description: 'Reload current results' },
  { kind: 'separator', key: 'divider' },
  { kind: 'group', key: 'columns', label: 'Columns', entries: [
    { key: 'name', label: 'Name' },
  ] },
  { kind: 'submenu', key: 'more', label: 'More', children: async () => [
    { key: 'archive', label: 'Archive', disabled: true },
  ] },
]
```

Every entry has a string key, unique across the control's tree. Non-separators require a nonempty text label. Item kind may be omitted. Rich `render?: () => VNodeChild` is local presentation content with textual fallback. Icon is `{ name: UiIconName; tone?: UiThemeColor }`; shortcuts are display strings. Group entries and submenu children express distinct relationships. `href` is optional, including for navigation hosts; applications can map activation keys to destinations. Selection rules and selected keys are not properties of entries.

Implementation must reject invalid structure and duplicate keys, keep disabled items ineligible for activation, and preserve accessible names. Verify the same entry definition can participate in different selection scopes without changing its structure.

UiMenu and UiNavMenu resolve semantic icon names through the application catalogue automatically; an icon slot is optional. UiSelect uses the textual label. See [UiIcon](../components/UiIcon.md).

`label`, `description` and item `shortcut` accept [UiTextSource](UiTextSource.md). Labels must resolve to nonempty text. Entry-control reads retain these sources; menu/select/choice/navigation projections resolve them reactively, including retained descriptions. Menu entry and icon slots receive resolved strings. Locale changes do not reload entries or change selected keys. See [text sources](../../guides/text-sources.md) for author obligations and acceptance checks.
