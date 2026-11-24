# UiMultiSelect

Edits membership in several choices through one field. Import from `@uninterface/uninterface`. Raw input is a duplicate-free `string[]`, including an empty array for no selection. A field codec translates the complete array to business values. UiSelect remains single-value; this component has its own backend capability and module.

Compact UiMultiSelect picker presentations are [input-styled controls](../../contracts/input-styled-controls.md). Selected values may wrap within the shared input surface. A bounded native multiple listbox is also supported; consult backend documentation rather than assuming a compact picker.

```vue
<UiField :field="channels" label="Notification channels">
  <UiMultiSelect :control="channelEntries" />
</UiField>
```

| Prop | Default | Meaning |
|---|---|---|
| `control: UiEntryControl` | Required | Business-owned static/asynchronous candidate source |
| `disabled?: boolean` | false | Additional availability restriction |
| `autoLoad?: boolean` | true | Load initially and when the source or enabled auto-load setting changes |
| `placeholder?: string` | Omitted | Optional empty display hint for collapsed presentations; native multiple listboxes do not display a placeholder |

No public value/model prop or emitted change event; the field owns input and validation. No slots. A template ref exposes `focus(): Promise<boolean | null>` using the common focus contract. Attributes/listeners target the actual editor. Backend presentation is a compact composite picker, or a bounded native multiple listbox where documented by the selected backend. Clearing is integrated into the field footprint, without a separate action row. Interaction styling and selected-value treatment remain backend-owned. See the [presentation and testing guidance](../../guides/multiple-selection.md#backend-presentation-and-testing).

A single level of grouped entries is supported; separators are omitted, while submenus and nested groups are errors. Entry selection scopes cannot compete with the field. Rich entry content uses the text label. Keys may be empty strings; they are not cancellation or placeholder sentinels.

Selection survives source refresh, failure and missing candidates. Last known labels or raw keys identify retained selections. When a ready result omits a selected key, its displayed label adds localized “Not in current choices”; this does not automatically invalidate the field. The retained choice can be explicitly deselected. Loading/failure does not establish absence.

While a source is not ready, candidate changes and clear are blocked; the current values remain visible. A ready disabled choice cannot be newly selected or directly removed. Clear removes editable memberships and preserves loaded disabled memberships. When only locked selections remain, clear is disabled. Source repair/removal policy remains explicit; a key absent from ready results is removable even if an earlier result described it as disabled. Business validation decides whether retained values are still acceptable, and enforces minimum/maximum membership.

Each eligible edit calls field.set then validates. Removal preserves surviving order and appends new keys; membership has set meaning. Configure `inputEquals` when reordering should not mark the field dirty. Source idle activation requests loading; failures require explicit source refresh/retry supplied by the business composition. Source status and field errors remain distinct. See the [multiple selection guide](../../guides/multiple-selection.md).

Core owns raw-value checks, eligibility guards, codec/validation flow and retention. Backend views own naming, descriptions, focus, visible source state and native multi-selection interaction. Requires `input.select.multiple.v1` and `control.focus.v1`. Verify codecs, empty/special keys, disabled retention, missing-value repair, clear, pending/error/retry, reset and keyboard operation on the selected backend.

An open composite picker handles Escape by closing its choices and returning
focus to its trigger. A later Escape follows the enclosing overlay's dismissal
policy. A native multiple listbox presents choices inline. See the
[frame contract](../../contracts/frame.md#modal-run-contract).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
