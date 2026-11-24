# UiEmpty

Presents an empty state in a table, list, card, panel or other business composition. Import from `@uninterface/uninterface`.

```vue
<UiEmpty>No invoices match your search.</UiEmpty>
```

## API

No component-specific props, emitted events or exposed methods. The caller decides when to render it.

| Slot | Meaning |
|---|---|
| Default | Optional message/content; absent or directly empty output falls back to localized “No items.” |
| `icon` | Optional artwork; no illustration is requested by default |
| `actions` | Optional ordinary buttons or business actions |

Attributes target the backend root. Slots preserve ordinary Vue content and interaction; child-component internals remain opaque. Localize business messages yourself. `emptyMessage` supplies the default text in English, Simplified Chinese, Traditional Chinese and Arabic, both standalone and inside collections.

## Responsibility and verification

Requires `empty.v1`. Core supplies localized fallback text; the backend supplies presentation and compatible native empty-state integration. UiEmpty does not fetch, infer search/filter state, clear filters, block interaction, change focus or create a live announcement. The containing component owns visibility, allocation and any announcement. There is no compulsory illustration, title, action, fixed height or enclosing frame.

UiTable, UiList and UiCollectionView render this presentation automatically for successful empty results. Their `#empty` slots replace the whole empty content. Tables place it in the native empty area or a body row spanning the columns; lists/cards place it in their collection region. Loading and failures remain separate.

Verify fallback and custom content, locale changes, optional artwork, independent action activation, no default tab stop/live region, and empty/loading/error transitions. Check actual wrapping, dark mode, RTL and containment on the selected backend. See [empty-state guidance](../../guides/empty-states.md).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
