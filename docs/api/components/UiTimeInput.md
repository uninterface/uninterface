# UiTimeInput

Time field editor. Import from `@uninterface/uninterface` in an application initialized by createUiApplication.

The scalar UiTimeInput editor is an [input-styled control](../../contracts/input-styled-controls.md), including native segments or a picker trigger where supplied. It follows the shared field placement, surface and focus agreement. Ranges present their specified endpoints, a permitted boundary-mode selector and whole-range Clear inside one shared input surface. Native range inputs fulfill this where supported. Endpoint editors share that surface while retaining their own editing semantics; narrow layouts may stack the endpoints inside it. Popup and range behavior remains governed by the temporal contract.

## API

Required `binding: UiTemporalInputBinding` of kind time. Optional `disabled?: boolean`, `readonly?: boolean`, and `presentation?: UiTemporalPresentation`. Inside UiField, binding.field must be the same field. Without UiField supply aria-label. Ranges should use UiField group semantics. No separate model or public update event; exposes `focus(): Promise<boolean | null>`. 

```vue
<UiField :field="control.field" label="Value"><UiTimeInput :binding="control.bindings.timeInput" /></UiField>
```

## Ownership and implementation

The control owns canonical values, range boundaries and validation. Backends own lossless text editing, native picker integration, localized formatting and accessible naming. Invalid text remains visible. Codecs parse fixed-format temporal strings into business values and format business values back into those strings. Backends own visible formatting and native editing; there is no business-provided display parser.

See the [time field editor guide](../../guides/temporal-inputs.md) for setup and composition.

## Observable verification

Verify text and picker edits share validation, reset restores the baseline, explicit open bounds differ from incomplete text, and readonly/disabled prevent all editing. A range has one coherent frame, retains frame focus treatment while an adapter-owned picker is open (browser-owned pickers follow native focus behavior), and preserves invalid drafts and native editing. Check range geometry at narrow allocations and supported sizes in a real browser.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
