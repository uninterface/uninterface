# UiLoadingIndicator

Displays busy activity, with optional visible default-slot text. Import from `@uninterface/uninterface`.

```vue
<UiLoadingIndicator v-if="pending">Loading orders…</UiLoadingIndicator>
```

## API

No component-specific props, emitted events, or exposed methods. The optional default slot supplies visible status text. Empty output uses a localized accessible Loading label. The caller controls visibility with normal Vue composition. Attributes target the backend indicator root.

## Responsibility and verification

The backend owns artwork, animation and control-size strategy fulfillment. The indicator does not start operations, block interaction, move focus, set a surrounding region busy or create a live announcement. The surrounding component owns those mechanisms. Verify standalone and slotted labels, localization, inherited size strategy and no interactive tab stop. See [loading guidance](../../guides/loading.md) and [UiLoadingRegion](UiLoadingRegion.md).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
