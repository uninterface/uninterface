# Input-styled controls

This presentation contract coordinates Uninterface, business authors and backend implementers. This names a shared convention of existing components. Delegated control-frame ownership supplies the backend/plugin integration contract; no business-side styling prop is required. The applicability and implementation limits below distinguish the agreement from verified conformance.

## Meaning

The broader [control presentation principles](../guides/design-principles.md) also apply: a coherent rectangular region, compatible native facilities first, consistent adaptation, and stable dimensions through ordinary state changes. The multiline and wrapping adaptations below describe intentional behavior; they do not permit incidental resizing on focus or loading.

An **input-styled control** is a field editor presented as a conventional input: it fits the field's control area, aligns to its logical start, provides a coherent input frame with visible focus, and normally occupies one row. The term includes selection and compound editing, not just text entry or the HTML input element. “Styled” includes these interaction and arrangement expectations, not merely a decorative border.

Business authors can rely on this agreement when arranging ordinary forms. Backends fulfill it using their own input design language, without requiring business-side width, border, spacing or focus CSS.

## Shared agreement

| Concern | Agreement |
|---|---|
| Field placement | The control's outer boundary aligns to the logical start of its allocated control area: left in LTR, right in RTL. It normally fills the available inline width, while respecting the containing layout's allocation and constraints. It does not claim the whole page width or move the field label. |
| Input frame | Editable parts, selected-value display, prefixes/suffixes and integrated actions read as one input surface. The backend owns the border or equivalent native boundary, background, interior padding, rounding and typography. Start alignment does not remove interior padding. |
| Focus | Keyboard focus is visible and the frame communicates engagement with the control. Internal movement between participating parts/actions must not make a compound surface appear to have lost focus. Focus requests reach a meaningful editor; actions keep their normal activation and focus behavior. |
| Shape | The ordinary closed control is one row. Multiline text and wrapping selected values are explicit adaptations within the same surface. Popup content and field help/errors do not count as extra input rows. |
| State | Available, disabled, readonly where supported, invalid and pending states follow the component's semantics and shared presentation strategies. The actual editing targets and actions obey restrictions; a disabled-looking wrapper alone is insufficient. |
| Responsive behavior | Long values, localization and narrow allocations remain usable without forcing overflow. Document wrapping or other adaptations; do not force every control to an identical pixel height. |

One input-styled control may contain several named editing parts and tab stops. One visual frame does not merge their names, imply a single native input element, or decide how their values are stored. The component's editing contract still determines validation timing, keyboard behavior, popup focus/dismissal and submission. Input styling does not itself provide popup participation or a new validation rule.

## Responsibilities

Business authors choose an editor for its value and interaction semantics, supply its documented binding/control, names and business rules, and arrange its field using shared layouts. They do not reconstruct backend appearance to obtain this style. UiField and form presentation strategies continue to own label/control arrangement, requirements and feedback; an input-styled control works in the control allocation whether the label is above or beside it.

Core defines the shared meaning and the component's value/control behavior. Backends own the concrete surface, interior arrangement, native toolkit integration, focus mechanics and theme mapping. Native components should retain their established input look and feel. Where the toolkit lacks a suitable primitive, the adapter must compose or adapt it sufficiently to meet the same agreement. Toolkit limitations must be documented as gaps or explicit adaptations, not silently converted into business-side styling obligations.

Compare ordinary text, select and compound inputs within the same backend/theme. They should belong to the same input family in boundary treatment, typography, size treatment, focus and state cues. Exact colors, spacing and dimensions remain backend/theme decisions; supported application customization and light/dark modes must remain coherent. This contract requires no identical appearance across different backends.

Integrated Clear, reveal and picker actions follow the [native-first input-action rule](../guides/design-principles.md#native-support-first-consistent-adaptation-where-needed): preserve compatible native sizing and placement when adapting behavior, and fit actions to the selected input size rather than letting an independently sized button enlarge its ordinary height.

## UiInputFrame and composition

[UiInputFrame](../api/components/UiInputFrame.md) is the frame designed to compose sub-inputs and supporting content so that the result acts as **one input-styled control**. [UiTextInput](../api/components/UiTextInput.md) supplies a named text-editing part that shares this surface instead of adding its own frame. Prefixes, suffixes, icons and actions can participate in the same composition.

The business composition still owns the draft projections, parsing, operations, validation rules and lifecycle. UiInputFrame coordinates surface state and participating focus; it does not turn arbitrary children into a complete editor automatically. It supports an ordinary field for a scalar string and a grouped field for named projections, with explicit component admission, inherited availability and whole-interaction focus. Public custom children declare and consume the admission contract; their backend views use the delegated control-frame binding. Owned-popup engagement remains coordinated; opaque controls need integration. Temporal ranges use this same helper. See the [input-frame guide](../guides/input-frames.md).

The parent owns the shared boundary and whole-control focus, error and availability presentation. Participating editors must suppress independent input surfaces and state highlights while retaining accessible invalid state, editing, segment selection and action focus. Delegation does not transfer or aggregate validation ownership. See [delegated control frames](../guides/control-frames.md) for the typed backend binding, lifecycle and acceptance checks.

Existing input-styled controls may use a toolkit's native frame directly. They are not required to render the public UiInputFrame component internally.

## Applicability and current limits

| Component or presentation | Relationship to this contract |
|---|---|
| [UiTextInput](../api/components/UiTextInput.md) | Input-styled control, including password and suggestion modes. `multiline` is the explicit textarea adaptation; the surface remains input-styled. |
| [UiSelect](../api/components/UiSelect.md) | Input-styled single selection, including its search-binding presentation. The closed field surface follows this agreement; the choice popup retains its own interaction contract. |
| [UiMultiSelect](../api/components/UiMultiSelect.md) | Compact picker presentations are input-styled controls; selected values may wrap. A backend may document a bounded native multiple listbox as a distinct presentation rather than claiming this compact style. |
| [UiDateInput](../api/components/UiDateInput.md), [UiTimeInput](../api/components/UiTimeInput.md), [UiDateTimeInput](../api/components/UiDateTimeInput.md) | Scalar editors are input-styled controls, including native segmented editing or a picker trigger where provided. Ranges compose named endpoint editors and supporting actions inside one UiInputFrame surface; endpoints retain native editing where supported and may stack at narrow allocations. |
| UiInputFrame with participating UiTextInputs | Composition mechanism for one input-styled control. Neither the frame alone nor an unframed part is a complete business editor. |
| [UiFileInput](../api/components/UiFileInput.md) | Input-styled single-file acquisition: chooser trigger, accepted filename as text and clear action form one surface. UiFilePreview is a separate business-composed view for this input. [UiUploadRegion](upload-region.md) supports optional internal preview with backend-owned layout; it is a distinct drop region, not a single-row input. |

Checkboxes, switches, radio groups and other field editors are not automatically input-styled controls. This term does not replace the broader field-editor concept or require every field control to adopt an input frame. Future components must state their relationship explicitly.

This documentation establishes the agreement; it is not a new assertion that every supported size, theme, viewport or backend has passed visual acceptance. Apply the selected backend’s documented limitations and verify the supported sizes, themes and contexts in a browser.

## Observable acceptance

1. Place text, select and compound controls in the same field arrangement. Their outer boundaries start at the control allocation's logical start and use its available width without business styling. Repeat with beside labels and RTL.
2. Compare ordinary, focused, invalid, disabled and supported readonly states under the same backend size/theme. Inspect the shared input family, actual restrictions and visible keyboard focus, including light/dark and application customization.
3. Tab through a compound editor and its actions. Internal movement keeps coherent frame focus; actions work independently; leaving, entering an owned popup and returning follow the component's documented interaction contract. Only explicitly cooperating owned popups retain frame engagement.
4. Exercise multiline text, wrapping selections, long localized content and narrow widths. Preserve names, values and operability without accidental overflow or extra independent frames around cooperating parts.
5. Verify naming, help/error associations and validation ownership alongside appearance. Browser observation is necessary for geometry and focus appearance; passing type or DOM checks alone does not establish visual conformance.
