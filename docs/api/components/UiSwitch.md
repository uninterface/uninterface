# UiSwitch

Binary setting editor. Import from `@uninterface/uninterface` in an application initialized by createUiApplication.

## API

`disabled?: boolean` and `readonly?: boolean` default to false. Requires a surrounding UiField with boolean editing values; use a field codec for business values. No independent model, public events or slots. Exposes `focus(): Promise<boolean | null>`. Standard target attributes/listeners reach the control.

```vue
<UiField :field="enabled" label="Notifications"><UiSwitch /></UiField>
```

## Ownership and implementation

Core writes and validates the field after accepted activation. Backends render switch semantics followed by its label, with keyboard Space activation and named checked/disabled/readonly state. False is a valid value, not missing. Color is not part of this API.

See the [binary setting editor guide](../../guides/controls.md) for setup and composition.

## Observable verification

Verify pointer/Space toggle, readonly and disabled preservation, codec translation, and baseline reset.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

## Label presentation

Labels and group headings remain visible even under `uiFieldLabels('hidden')`. Individual option labels stay beside their controls. Standalone checkbox/switch labels are adjacent except with the explicitly selected separated arrangement. [uiCheckablePresentation](../../strategies/uiCheckablePresentation.md) selects flushed, control-aligned or separated placement; omission uses `adapt`. Backends own native markup, responsive stacking and logical-direction alignment. Changes preserve the control, value, focus and label activation. See the [shared principles](../../guides/design-principles.md#checkable-control-labels).
