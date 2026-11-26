# Field alignment

This is a core presentation requirement for backend implementers. A field label and its control are a common composition, including standalone settings outside a form. Business authors supply their meaning and arrangement; they must not repair label offsets, focus clearance or adapter wrapper heights with CSS. This discipline complements [control presentation principles](design-principles.md) and the [form contract](../contracts/form.md).

## Ownership and alignment anchors

Checkable fields additionally follow the [checkable mode matrix and backend
requirements](../strategies/uiCheckablePresentation.md#backend-implementation-requirements):
always-visible labels/titles, adjacent individual option labels, explicit
standalone separation, and descriptions/feedback aligned according to mode.
Use the [backend review checklist](../agents/backend-compliance.md#checkable-presentation-review)
to verify them alongside ordinary fields; generic first-row alignment does not
replace those requirements.

UiField owns label, requirement, help and feedback arrangement. The editor owns its visible surface, content rows and focus treatment. The containing layout owns peer placement and wrapping. Coordinate those three responsibilities without inspecting opaque business-component interiors or changing data/control ownership. Accessibility grouping does not justify a different spacing rhythm by itself.

Compare visible surfaces and first content rows, not arbitrary outer wrappers. Focus clearance, invisible announcements, empty status elements and implementation wrappers must not introduce an unexplained inset or change a field's alignment footprint. Keep focus visible and local scrolling usable; removing clipping protection without providing an alternative is not a fix.

| Situation | Required alignment basis |
|---|---|
| Label above a control | Label and control allocation share logical inline-start. Use the same theme-owned label-to-control spacing for ordinary and grouped fields in the same presentation context. |
| Above-labelled fields arranged horizontally | Anchor the first label rows at the top of the peer row. With equal single-line labels their control surfaces start together. A taller control or feedback grows downward; it must not vertically recenter either field. |
| Label beside a text control | Align the label's first text baseline with the control's first editable text baseline. Native label line-height/padding or baseline layout may fulfill this; do not center the label against a textarea's full height or the control-plus-feedback block. |
| Label beside a non-text control | Use the first interaction row as the reference: center the label's first line against that row. A tall preview or composite with no row uses the ordinary single-row control band at its block-start, not its full height. Document that adaptation. |
| Beside-labelled fields with unequal editor heights | Keep their first interaction/text rows anchored; additional rows and feedback extend downward. Shared label-column widths belong to the form/layout presentation, not per-field compensating spaces. |
| Native floating/integrated labels | Preserve the native label band and control content-height budget across comparable editors, including grouped compositions. An external-label rule does not force a floating-label backend to duplicate its label. |

Wrapped labels keep their first line anchored and grow downward. Above-labelled controls can therefore start at different heights when label line counts differ: equalizing those starts requires a layout that explicitly coordinates label rows. Do not silently truncate labels, reserve a universal label height, overlap content, or stretch short controls to the tallest editor. Different explicit sizes, descriptions, vertical choices and multiline controls may legitimately have different heights. Comparable single-row controls at the same size should share the backend's native height rhythm, accounting for borders as well as padding.

An explicit UiLayout/UiFlowLayout `align` request still controls the complete peer allocations. The field discipline governs internal composition and backend-owned default arrangements such as UiNavbar actions; it does not secretly override explicit center/end alignment, inspect arbitrary descendants, or introduce a new public alignment prop. In a mixed row, bare actions may retain their native centering; field peers use the first row anchor. A borrowing business component remains responsible for forwarding or defining its own outer layout contract.

## Selectable peer baseline alignment

Use `align="baseline"` on a horizontal UiLayout or UiFlowLayout when adjacent controls should share their first text baseline. It works with or without wrapping; each wrapped row forms its own group. The default remains stretch, and center/start/end continue to position whole allocation boxes. Vertical baseline requests fail; region/grid layouts do not expose this choice. Applications using the option declare `layout.baseline.v1` in addition to the usual layout capabilities.

```vue
<UiLayout direction="horizontal" align="baseline" wrap>
  <OrderSearch :value="keyword" :search="searchOrders" />
  <UiButton @click="clearFilters">Clear filters and sorting</UiButton>
</UiLayout>
```

The layout owns peer placement. Backends own the meaningful baseline exported by their components: first editable text for hidden-label text inputs and UiInputFrame; first visible caption for text buttons; the first label line for above-labelled fields; coordinated label/editor text for beside labels; editable text for floating labels. Leading icons, spacers and trailing actions must not take over a compound editor's reference. Help/errors appearing below must not change the first reference. Native font, padding and control height remain backend-owned; text-baseline alignment does not imply identical surface tops or bottoms.

Business compositions propagate that reference through their own roots using ordinary CSS baseline rules. Vue boundaries do not require special registration. Arbitrary opaque/multi-root content and text-free items use native export/synthesis; UiLayout does not inspect their interiors to select a business target. An above-labelled field beside a button aligns the button with the label row, not the editor below it. Coordinating editor rows independently of label arrangement remains a separate concern.

To compare alignment, put a UiInputFrame with a leading icon, text input and integrated submit action beside an independent reset button. Compare baseline, center and start with and without wrapping. Verify the first text rows at different sizes, with pending state and feedback, RTL, and empty, placeholder and typed values. Measure text baseline references in a browser. Use [UiCollectionHeader](collection-header.md) for coordinated editor bands when label rows vary.

## Implementation and customization

Reuse native FormField/FormItem label and container theme slots where possible. Shared tokens alone are insufficient if different DOM structures add padding twice or count a border outside a control's height budget. Keep native typography, semantic requiredness, group naming, label activation, feedback associations, responsive stacking and RTL logical sides intact. Supported theme changes must flow through the same spacing source for grouped and ordinary fields.

For scrollable segments, paint focus within the scrollable surface or provide clearance that does not move that surface relative to the field's allocation. Do not add an unexplained padded outer box to only one editor type. Keep focused off-screen options reachable through native scrolling. Changes to focus paint belong to the adapter and must preserve native theme colors and forced-colors visibility.

## Supported examples and current implementation

UiNavbar field peers use block-start alignment. Backends coordinate borders, height, label baselines and contained focus without surplus outer scroll insets. Integrated-label support and native adjustments belong in backend documentation; requesting beside does not establish native support.

General label-row coordination across arbitrary opaque components remains unimplemented. UiCollectionHeader coordinates the editor bands of registered UiField views, including through business wrappers, using measured label space. It does not change ordinary first-baseline alignment.

## Observable acceptance

1. Place select, segmented select, single-line text and textarea/vertical-choice fields side by side with short labels. At each supported size compare visible inline starts, label-to-control gaps and first-row anchors. Tall controls must not pull adjacent labels downward. Test both ordinary and grouped fields.
2. Repeat with supported beside, above, hidden and floating label presentations. For beside text fields compare first text rows, including a textarea and a wrapped label. For non-text surfaces record the first-interaction-row adaptation. Unsupported strategy values must retain documented defaults.
3. Add and remove help, errors and source status. Existing labels and control starts must stay anchored; subsequent content may move. Preserve described-by associations and announcement lifetime.
4. Focus the first, middle and last segment, including an initially unselected option; verify visible contained focus, arrow-key navigation, scrolling to the focused option and unchanged surface bounds. Repeat in forced colors.
5. Repeat at narrow widths, with wrapping, RTL, long translations, text zoom and supported application theme customization. Do not infer painted geometry from class assertions or DOM rectangles supplied by a DOM simulator.

Use browser measurements for geometry. Verify rendered structure, label association and feedback naming separately.

Individual checkbox, radio-button and switch labels follow the [checkable-control rule](design-principles.md#checkable-control-labels): always beside for visible labels, including on narrow screens. They are not ordinary form-label columns. Group headings retain the alignment rules above.
