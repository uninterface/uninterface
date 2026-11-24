# UiCollectionPresentationOptions

Width preferences for [UiCollectionView](../components/UiCollectionView.md)’s `cards-grid` presentation. Import the type from `@uninterface/uninterface`.

```ts
interface UiCollectionPresentationOptions {
  minWidth?: string
  maxWidth?: string | 'default'
  stretchSingleColumn?: boolean
}
```

`minWidth` requests a preferred minimum outer card/column width. `maxWidth` requests a finite maximum outer width, or explicitly keeps the backend’s default maximum with `default`. Lengths are positive `rem`, `em` or `px`; arbitrary CSS expressions, percentages, zero, negative and nonfinite values are rejected. `rem` resolves against the document root’s font size; `em` resolves against the rendered collection list’s font size. Padding and borders are included in the allocated card width. An explicit or resolved maximum below the effective minimum is rejected, including mixed units after client measurement.

| Options | Meaning |
| --- | --- |
| Omitted or `{}` | Backend default minimum and finite maximum |
| `{ minWidth, maxWidth }` | Explicit bounded range |
| `{ minWidth }` | Preferred minimum, no maximum; occupied columns stretch as in the original grid |
| `{ maxWidth }` | Default minimum and explicit maximum |
| `{ minWidth, maxWidth: 'default' }` | Explicit minimum and default maximum |

The object expresses a complete request, not a partial patch over default bounds: a minimum-only request must not acquire the default maximum. Properties set to undefined follow omission. Unknown keys and invalid values fail visibly. Options are validated when supplied, but sizing applies only to `cards-grid`; table and `cards-full-width` ignore its dimensions. Replace or update options reactively without replacing the binding, remounting content, reading the source or changing selection/drafts.

With a finite maximum, columns are counted from the offered container width and preferred minimum, independently of item count. Equal column widths grow only to the maximum, subject to the single-column exception below. Ordinary backend gaps remain between visible cards; surplus stays at logical end, and incomplete rows retain the same columns. Below the preferred minimum, one column shrinks to fit. With only a minimum, unused columns collapse and occupied columns share the available width without a cap, including a lone full-width card.

Core validates author inputs; the backend supplies defaults, concrete layout and unit resolution. No sizing belongs to the list controller. Verify sparse/full/partial collections, options omission/reset, min-only stretch, invalid ranges, container-only resizing, font changes, RTL, focus and keyed child identity. See [collection sizing](../../guides/collection-views.md#card-grid-width-preferences).

`stretchSingleColumn` defaults to `true`. When the container can fit only one column according to the effective preferred minimum and ordinary gap, that column ignores the maximum and occupies the entire available width. Set it to `false` to enforce the maximum even with one column. This depends on column capacity, not record count: one record in a container that fits multiple columns remains capped; one record in the last row does not stretch independently. An object containing only this flag retains default min/max bounds. Minimum-only requests already stretch and are unaffected by the flag. Changes are reactive and preserve item identity, drafts and focus. The initial server/premeasurement CSS fallback remains bounded; the exception takes effect with client column measurement.
