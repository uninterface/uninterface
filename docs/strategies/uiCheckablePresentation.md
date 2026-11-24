# uiCheckablePresentation

## Purpose

Arrange checkbox, switch and radio/checkbox-group fields relative to the form's label and control areas. This is presentation policy; it does not select values, alter validation or change control ownership. Ordinary text fields, dropdowns and segmented selectors are outside its scope.

## API and values

Import from `@uninterface/uninterface`.

```ts
uiCheckablePresentation(
  value: 'adapt' | 'flushed' | 'control-aligned' | 'separated',
  options?: { scope?: UiStrategyScope },
): UiStrategyDeclaration
```

| Value | Meaning |
|---|---|
| `adapt` | Control-aligned for effective `beside-near` or `beside-far` ordinary label placement; flushed for other effective placements. |
| `flushed` | Control and adjacent standalone label start at the field's logical start. Group titles appear above their options. |
| `control-aligned` | Control and adjacent standalone label align with the control/value area. Descriptions and below-control feedback start at the control/value area, aligned with the check control rather than its adjacent label. Group titles occupy the label area and options occupy the value area. |
| `separated` | Standalone field label or group title occupies the label area; the control/options occupy the value area. Individual option labels remain beside their controls. |

Checkable standalone labels, group titles and option labels stay visible even under `uiFieldLabels('hidden')`. In separated presentation, `beside-near` aligns label text toward the control area and `beside-far` away from it. Unspecified alignment uses the backend's ordinary alignment. Label/control areas may stack on narrow screens. Long option labels wrap beside their controls.

## Default and agreement

Omission and unanswered/conflicting contributions use `adapt`; no application declaration is required. Adapt depends on effective ordinary label placement. Agree on original label requests, resolve defaults/general values and unsupported placement to a concrete supported treatment, then select control-aligned for effective beside placement or flushed otherwise. This ordering applies to every backend; unsupported beside resolving to integrated labels selects flushed, while unsupported floating resolving to beside selects control-aligned. Adapt then resolves to flushed/control-aligned before rendering. Beside alignment is also resolved to near/far, using one backend-wide policy. Responsive stacking fulfills the selected mode without changing control state.

Common contributions use unanimity: equal values agree and different ones decline. There is no local-wins or declaration-order rule. Scope applies at participating `field` nodes, with normal depth/stopAt limits. Block the factory to stop that family, or [uiCheckablePresentationQuery](../api/constants/uiCheckablePresentationQuery.md) to stop all incoming contributions to the concern.

Explicit arrangements require backend support. Unsupported control-aligned or
separated requests fall back through adapt, then to the supported flushed
baseline, before rendering. Original requests still govern agreement. A backend with no separate label/value areas can fulfill flushed without manufacturing columns. Unsupported optional requests do not throw. Consult the selected backend’s strategy reference for its supported arrangements.

## Usage and ownership

```vue
<UiStrategy :use="[
  uiFieldLabels('beside-near'),
  uiCheckablePresentation('separated'),
]">
  <AccountPreferences />
</UiStrategy>
```

The business composition owns typed fields and meaningful labels. Backends own column measures, spacing, native label facilities, responsive adaptation and direction. Changing modes must retain the editor, its checked/mixed state, focus, label activation, required annotations and feedback associations. Control-aligned descriptions and below-control feedback align with the control area/check control, including adapt resolving to that mode and narrow stacking. Flushed standalone descriptions align with label text. Consumers do not reconstruct control internals or add alignment CSS.

## Backend implementation requirements

These are shared implementation obligations for field and checkable-editor
views. They apply to current and new backends; native mappings and any remaining
implementation gaps belong in each backend's documentation.

| Resolved mode | Standalone checkbox/switch | Radio/checkbox group | Field description and below-control feedback |
|---|---|---|---|
| `flushed` | Check and adjacent label at the field's logical start. | Title above the options; option labels adjacent. | Standalone descriptions align with adjacent label text; group field descriptions use the options' value area. |
| `control-aligned` | Check and adjacent label in the value area. | Title in the label area; options in the value area. | Start at the value-area/check-control edge, rather than the adjacent label. This also applies when columns stack on narrow screens. |
| `separated` | Field label in the label area; check in the value area. | Title in the label area; options in the value area. | Use the value area. Individual option descriptions retain their relationship to their own option labels. |

1. **Resolve policy at the field.** Consume the registered checkable category
   and strategy policy through the [backend field contract](../api/backend/controls.md#uifieldviewbinding).
   Do not infer it from opaque business-component internals, label text or
   incidental native markup. Dropdowns and segmented selectors are ordinary
   editors for this concern, even if native internals use radio semantics.
2. **Accept all four requests before agreement.** `adapt` is the default for
   omission, disagreement or no answer. Resolve ordinary label placement first,
   including reactive native defaults, general values and unsupported placement.
   Derive adapt from that effective placement: beside selects control-aligned;
   otherwise use flushed. Explicit modes select their own arrangement where supported.
   Declare supported concrete modes; unsupported modes fall back through adapt
   and then flushed before rendering. Do not manufacture label/value columns
   when the backend has no corresponding ordinary control area.
   Preserve targets, depth, stopAt, family/query barriers and logical ancestry;
   do not introduce a backend strategy node or a local-wins rule.
3. **Retain visible labels.** Standalone labels, group titles and option labels
   remain visible under hidden. Only explicit separated mode relocates a
   standalone label to the label area. Group titles do not replace option names.
   Omit duplicate native/external labels when coordinating field and editor
   views, preserving one meaningful name and label activation.
4. **Keep alignment separate from arrangement.** Near/far aligns text in the
   label area toward/away from the value area, including aligned group titles.
   Near/far support is backend-global: do not honor near for some participating
   field labels and fall back to far for others. General beside chooses the
   backend's near/far alignment; equivalent general and explicit requests must
   preserve the same arrangement and spacing for the same field/context.
5. **Fulfill description ownership.** Apply the matrix above when modes change,
   including adapt, wrapping, RTL and narrow stacking. Field help and feedback
   remain associated with their field; option descriptions remain option-owned.
   Changing arrangement must not duplicate IDs or leave stale help/error
   associations. Visibility, required annotations and validation-failure policy
   retain their separate responsibilities.
6. **Preserve native interaction and identity.** Reuse compatible native label
   and input facilities. Mode changes retain the editor, draft, checked/mixed
   state, focus, disabled/readonly behavior and activation route. Backends own
   markup, dimensions, spacing, responsive thresholds and theme values; business
   consumers must not supply corrective CSS. Core retains value/validation/reset
   authority. No particular DOM tree, breakpoint or pixel measure is prescribed.

## Verification

Verify adapt against effective ordinary placement, including unsupported requests
and reactive native defaults. Unsupported beside falling back to integrated/above
must select flushed; unsupported floating falling back to beside must select
control-aligned. Compare fallback geometry with its matching native presentation.
Explicit checkable modes apply only where the backend supports their arrangement. Verify unsupported arrangements resolve through adapt to a supported mode without changing editor identity.

Compare every mode beside ordinary fields at narrow/wide widths and in both directions. Cover standalone checkbox/switch, radio and checkbox groups, long labels, omitted/hidden/beside label requests and near/far alignment. Check visible labels/titles, control identity, keyboard/pointer/touch activation, accessible names and unique help/error associations. Record DOM wiring, real-browser geometry and human visual acceptance separately. See [the design principles](../guides/design-principles.md#checkable-control-labels).

Verify the matrix's actual text/control/description edges, not only classes or
strategy answer values. Exercise restoration and transitions between modes,
help replacement/coexistence, displayed/suppressed errors and required markers.
Compare all participating field kinds together for backend-global near/far
consistency, and compare general beside with the matching explicit alignment
while holding other settings fixed. A passing checkable-only matrix does not
establish consistency with ordinary fields. The [backend compliance checklist](../agents/backend-compliance.md#checkable-presentation-review)
provides the corresponding review steps.
