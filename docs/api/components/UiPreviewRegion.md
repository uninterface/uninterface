# UiPreviewRegion

A visibly framed, read-only field control for preview content. Import from `@uninterface/uninterface`. UiField owns the label, help and validation feedback; UiPreviewRegion supplies the control surface and allocation. UiImagePreview or another read-only renderer supplies the content.

## API

| Prop | Default | Meaning |
| --- | --- | --- |
| `extent?: 'compact' \| 'regular' \| 'large'` | `regular` | Backend-owned preview-area allocation |
| `disabled?: boolean` | `false` | Additional disabled presentation; field/control restrictions also apply |

Use inside a grouped UiField. Group semantics accommodate arbitrary preview content without pretending it is an editable text input or a native labelable input. There is no public label prop: field presentation strategies govern the UiField label. The default slot supplies one read-only preview surface. No events, model, editable mode or exposed handle.

```vue
<UiField :field="attachment" label="Preview" group>
  <UiPreviewRegion>
    <UiImagePreview v-if="attachment.state.input" :file="attachment.state.input" />
  </UiPreviewRegion>
</UiField>
```

The region fills its allocated width and supplies a definite preview height. Compact, regular and large select progressively larger areas; exact dimensions belong to the backend. Empty, loading, successful and failed content keep the frame and allocation. Empty content adds no placeholder, hint or status text.

The viewport centers its content and clips overflow. Renderers must fit the allocation; this is not a scrolling layout or an editable composition. Image previews use these bounds without consumer CSS or pixel dimensions. The control boundary belongs to the region, never to the image renderer. It follows ordinary backend field styling: a full outline is not mandatory where a native filled surface and bottom border define the control. Group semantics do not request a visual group box.

## Ownership and implementation

The region consumes the nearest UiField context, including its accessible name, description associations, disabled and validation states. It is always read-only: no acquisition, replacement, removal, value writes or validation triggers. It creates no second state owner. A preview may observe the same control as an editable field elsewhere; rendering another view does not register another form participant.

UiField owns labels and feedback, including supported presentation strategies. Backends use a named group for preview content and do not put unsupported aria-readonly or aria-required on that role. The content is intrinsically noneditable; no fake textbox or contenteditable element is introduced. The region adds no tab stop. UiField retains its existing invalid-group feedback focus behavior. The renderer owns its accessible alternative text and must contain read-only content.

Backends implement UiPreviewRegionViewProps and declare preview.region.v1. The backend supplies its ordinary input surface and field-label treatment, including a filled surface with a bottom border where appropriate. Native single-line input widgets cannot host arbitrary preview content, so their frame facilities are adapted without creating inputs. Frame sizing, disabled/failure treatment and feedback follow the backend's existing field integration. Label/extent updates preserve renderer identity.

UiUploadRegion continues to own its internal optional preview and action arrangement. This component does not define a collection UI. See the [files guide](../../guides/files.md), [UiField](UiField.md) and [UiImagePreview](UiImagePreview.md).

## Observable verification

DOM coverage checks field-derived naming, hidden labels, descriptions, disabled/invalid state, feedback suppression, empty allocation, arbitrary preview content, child identity and absence of edits or input mechanics. File-demo checks retain selection, invalid-editor focus, reset and URL cleanup. Browser coverage checks the visible control frame, borderless image content and stable bounds through empty/image/failure states; browser execution remains a separate acceptance step.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
