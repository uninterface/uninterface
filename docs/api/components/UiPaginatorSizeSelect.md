# UiPaginatorSizeSelect

An independent page-size selector borrowing an existing [UiPaginatorBinding](../types/UiPaginatorBinding.md). Import from `@uninterface/uninterface`.

| Prop | Meaning |
|---|---|
| `binding` | Required paginator binding; the session owns choices and requests |
| `aria-label` | Optional accessible-label override; defaults to localized “Items per page” |

```vue
<UiPaginatorSizeSelect :binding="orders.bindings.paginator!" />
```

It needs no UiPaginator, UiField or UiForm ancestor. Place it using an application layout. Options are the binding's supported numeric `pageSizes`, displayed using localized labels such as `10 / page`. The selected value reflects requested size; choosing a different supported size invokes the existing session operation once, restarting at the initial position. Native page navigation continues to describe accepted results while that request is pending.

Core supplies options, localization and live guards. The backend supplies its native selector, actual accessible naming and normal disabled/busy behavior. Pending requests, unavailable size changes and empty choice sets disable selection. Mount/remount and locale changes never load data; unmount never disposes the session. There is no second writable pagination model.

Required capability: `paginator.size-select.v1`. Its ordinary control-surface height must match or be similar to UiPaginator buttons and UiPaginatorJumper; use the backend's native size/density facilities. Verify placement outside navigation, numeric value mapping, localized options, synchronized multiple borrowers, one reset/read per selection, live disabled guards and no lifecycle reads. Browser geometry acceptance is separate from DOM behavior.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
