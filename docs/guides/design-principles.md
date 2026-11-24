# Control presentation principles

These design principles apply to business authors and backend implementers and extend the [input-styled control agreement](../contracts/input-styled-controls.md). They establish expectations and review criteria, independent of a particular backend’s visual acceptance. Component APIs and current support are documented in the linked references.

Uninterface defines the intended presentation and behavior; backends fulfill them using their own design language. Business authors should be able to compose conventional controls without repairing their shape, state transitions or visual consistency with CSS.

## A coherent rectangular region

A control normally occupies one coherent rectangular region. Rounded corners are compatible with this principle. Avoid a fragmented silhouette formed by several offset rectangles with gaps or empty cutouts, even if their enclosing bounding box is rectangular. The purpose is predictable alignment and a readily understood control boundary.

A full circle, such as a round avatar, is a recognized exception. This is an example of an established shape in the design language, not an exhaustive exception list or a declaration that an avatar component is implemented.

This principle concerns the presented control as a whole. It does not require a visible border, background, single DOM element or single tab stop. Internal parts may have their own arrangement while participating in a coherent surface. Separate controls in a layout remain separate controls and may have normal peer spacing. An attached popup has its own surface; it does not have to fit inside the closed control's rectangle.

Rectangular shape does not mean every control has the same size or fills its available width. The component's contract determines its allocation. For example, ordinary input-styled controls normally fill their field's control area; that requirement is not generalized to every button or other control.

## Native support first, consistent adaptation where needed

Start with the backend's natively supported components, features and compositions where they fulfill the Uninterface contract. Prefer supported properties, events, slots, methods and theme facilities before building a replacement. This preserves the backend's established appearance and interaction conventions and reduces unnecessary custom implementation.

For integrated actions such as Clear, password reveal and picker triggers, use the backend's supported input-action facilities first; adaptations for control ownership or accessibility should preserve their coordinated sizing, placement and state treatment. Replacing them with independently sized buttons requires a concrete integration reason. Where no suitable native facility exists, compose actions that fit the input's design language and selected size without increasing its ordinary height when they appear.

When native support is incomplete, identify the concrete gap and adapt or compose the available facilities. Aim to keep the result consistent with neighboring native controls: typography, dimensions, boundary treatment, spacing, focus and state cues should belong to the same backend design language. Use its theme facilities so supported customization and light/dark presentation remain coherent. A backend supplying its own reference presentation follows the same requirement for internal consistency.

Native preference does not allow a toolkit to redefine Uninterface semantics or excuse a missing required behavior. Adaptation must preserve control ownership, availability, naming, keyboard operation and feedback. Document remaining gaps and verification limits in the backend's documentation; business authors should not have to repair them through toolkit-specific markup or CSS. Different backends need not look identical.

See the [backend authoring reference](../api/backend/presentation.md#native-feature-translation) for integration responsibilities.

For ordinary actions in a UiNotice, text presentation is the contextual default: it integrates the action with the message without adding another persistent filled surface or outline. Backends use their native text/ghost treatment and preserve visible interaction feedback. In notice action rows led by text buttons, align the leading action content with the message where space permits while retaining native padding and hit targets. Preserve containment when the notice has insufficient inset; non-text actions and custom compositions retain their own geometry. Authors can request another variant explicitly or through an agreed regional strategy. This default is limited to directly authored notice actions; custom component interiors own their presentation. See [feedback and details](feedback-and-details.md) for ownership and acceptance checks.

## Native arrows on anchored surfaces

Follow the arrow defaults and documented patterns of the corresponding native user-facing control. Do not remove native default arrows merely because Uninterface owns the interaction lifecycle or composes the surface differently. This applies to specialized controls as well as UiPopover, including temporal pickers and suggestions.

A backend may select an optional native arrow as its ordinary UiPopover presentation. That choice does not automatically apply to internal picker, menu or suggestion compositions; follow the corresponding user-facing control’s defaults. A positioning engine does not prescribe decoration. Document intentional adaptations separately from toolkit defaults.

Compare the matching native control, not just a lower-level positioning primitive. A submenu that natively omits an arrow is not a defect merely because its underlying tooltip primitive can draw one. Optional arrow facilities in other popup families must be distinguished from native default arrows and the selected popover default. A backend without an external toolkit defines its own consistent baseline; a toolkit without a native arrow does not require an invented replacement. Popup pointers are also distinct from disclosure chevrons and keyboard arrow behavior.

Backends own native markup/artwork, theme colors, dimensions and attachment; business authors supply the interaction and anchor without arrow markup or CSS. Arrows are decorative, outside the body scrollport and excluded from keyboard/pointer interaction. They must point toward the actual anchor after placement flips, viewport shifts, RTL mapping, movement and resizing. If constraints make a faithful pointer impossible, hiding that pointer is preferable to pointing through the popup or at unrelated content; the interaction must remain usable.

Inspect visible arrow direction, native fill/border/theme matching, corner clearance and clipping at ordinary/narrow widths, all supported sides, LTR/RTL and light/dark. Verify focus, dismissal and retained content independently. Source/DOM evidence of arrow markup is not browser visual acceptance. The [drawer and popover guide](drawers-and-popovers.md) describes implemented popover support; this principle does not certify every existing popup composition.

## Add only necessary interaction elements

Uninterface does not add elements or steps to an interaction flow unless they are necessary to fulfill its semantics, accessibility or interaction requirements. Preserve a compatible native flow when it already provides the required behavior. Additional buttons, headings, instructions, confirmations and intermediate screens need a concrete purpose; do not add them merely because an adapter can render them.

For example, a calendar popup does not need an extra Close button when its selection behavior and native dismissal mechanisms already provide accessible, operable completion and cancellation. Retain necessary naming, feedback, keyboard operation and focus handling. A genuine missing capability can justify an added element, with that reason owned by the backend implementation rather than pushed onto business authors.

## Stable dimensions through ordinary state changes

In most cases, a control's rectangular region keeps its width and height as its state changes. With the same allocation and presentation context, focus, hover, pressed, disabled, readonly, pending/loading and validity changes should not incidentally resize the control. This keeps neighboring content and interaction targets predictable.

Size changes are acceptable when they are an intentional part of the component's design language and documented behavior. [UiCollapsible](../api/components/UiCollapsible.md) expanding and collapsing is a clear example. The existing input-styled agreement also identifies multiline text and wrapping selections as explicit adaptations. A native widget's incidental resizing alone does not establish an Uninterface exception.

This is not a fixed-pixel-size requirement across viewport sizes, layout allocations, languages, text zoom or explicit size choices. Controls must still respond to those contexts and preserve readable, operable content. Nor does it freeze the entire surrounding field: labels, help and validation feedback retain their own layout and presentation contracts. Distinguish a changing control surface from separately presented feedback or an opening popup.

**Note on sideways growth:** horizontal enlargement can be justified, especially for content-sized buttons that do not normally fill their available width. Adding a loading indicator may widen such a button, and removing it may restore the idle width. This is an accepted presentation behavior, not a violation of size stability. Stable width is also valid; reserved spinner space is not required. This allowance does not automatically extend to height changes or every kind of control.

The backend chooses its sizing technique and indicator presentation. Do not achieve stability by hiding required feedback, clipping meaningful content or removing visible focus. Accepted growth must still respect the containing layout and remain usable at narrow widths. If the obligations cannot be fulfilled together, record the gap rather than silently inventing an exception.

## Navigation as a coherent family

Vertical hierarchy, vertical flyouts and icon rails share root icon positioning and row geometry within a backend. Changing presentation is an intentional allocation change: close floating sessions, preserve current state and remembered tree expansion, retain focus on a surviving entry or ancestor, and honor reduced motion. Exact dimensions and transition treatment belong to the backend.

Persistent tree labels advance toward logical inline-end at every depth, whether icons are present or absent. Siblings share label starts; transparent groups do not create an extra depth. A stable leading column and native indentation preserve this relationship without requiring authors to supply placeholder artwork. Rail destinations without declared icons receive a neutral glyph and a label on hover/focus.

Root navigation is visibly separated from adjacent content. The menu owns that boundary unless a matching UiNavbar or designated UiRegionLayout navigation region takes responsibility for the actual adjoining edge. A selected-item underline or whitespace alone does not replace this separation. Layout-owned separation spans the full shared allocation boundary; explicit suppression of that boundary does not return ownership to the child. Boundary ownership follows logical sides in RTL and must not leak into unrelated nested menus.

Use [UiNavbar](../api/components/UiNavbar.md) for branding, horizontal navigation and actions, and `navigation-region` on [UiRegionLayout](../api/components/UiRegionLayout.md) when a whole supporting allocation is navigation. See the [navigation guide](navigation-menus.md) for composition, ownership and verification. These guarantees are implemented across the adapters; physical geometry and motion still require browser acceptance.

## Ownership and use

| Owner | Responsibility |
|---|---|
| Business author | Select components for their meaning and interaction, supply data, operations and accessible names, and arrange them through shared layouts. Use documented expansion, multiline or wrapping behavior where the task needs it. Do not reconstruct backend geometry or styling to obtain these defaults. |
| Uninterface | Define the shared principles, component-specific guarantees and intentional exceptions. Keep the control contract independent of any toolkit's vocabulary or limitations. |
| Backend implementer | Realize coherent surfaces and stable state presentation, prefer compatible native facilities, and adapt missing support consistently without unnecessary interaction elements. Own concrete markup, theme mapping, focus mechanics and sizing techniques. Document adaptations, gaps and evidence. |

Existing examples illustrate how to apply these principles:

- Use [UiInputFrame and UiTextInput](input-frames.md) for a compound editor whose participating parts share one input-styled surface. Its editing workflow remains business-owned.
- Place independent form actions in a shared layout. They are separate controls; the rectangular-region principle does not merge them into a single control or remove their spacing.
- Use [UiCollapsible](panels.md) when revealing and concealing content is part of the interaction. Expansion is intentional; a content-sized button widening to include its loading indicator is another accepted size change.

These examples identify existing composition mechanisms. They do not certify every current backend's geometry against the new principles.

## Keep the interface concise

Use conventional controls and state cues to communicate what can be done. Do not translate internal states, ownership rules or implementation details into user-facing paragraphs. Add instructions only when users need them to act; an error should explain the problem once, with concise recovery actions. Repeated status captions and explanations of already apparent actions add noise and must not drive larger control allocations.

UiUploadRegion illustrates this rule: its chooser gives way to file/progress/actions while working and to file/preview/removal after retained success. The indicator does not need repeated “Uploading” labels, and removal does not need an association explanation. Accessible naming and announcements remain available without adding visible narration. Verify the ordinary states fit a compact native presentation before expanding their allocation.

## Bounded upload and preview controls

[UiUploadRegion](../api/components/UiUploadRegion.md) owns one stable allocation across acquisition, transfer, recovery and retained-result states. Internal progress, preview and actions are optional semantic functions, selected through props; their layout belongs to the backend, not business-authored slots. Backends may declare minimum dimensions. Hosts must honor those minima, including fill allocations. The region must fit its content and essential actions without internal scrolling or clipping controls. Enlarging the region to accommodate redundant prose is not an acceptable substitute for a concise state design.

A preview renderer and a field control have different responsibilities. [UiImagePreview](../api/components/UiImagePreview.md) renders only an image or a broken-image glyph; [UiFilePreview](../api/components/UiFilePreview.md) renders an image or a compact file summary. They add no field border, label, validation workflow or implicit navigation. [UiPreviewRegion](../api/components/UiPreviewRegion.md) supplies the bounded, visibly framed read-only field surface; UiField owns its label, help and feedback, and the existing business control owns data and validation. Rendering a preview does not create another data owner or form participant.

Field framing follows the backend's ordinary control language. A full outline is not required when the native field uses a clearly defined filled surface and bottom border. Group accessibility semantics do not prescribe a visual group box. Preserve the distinction between readonly and disabled, and do not introduce a hidden text editor to make arbitrary preview content look like a field.

The image fits a supplied bound: preserve aspect ratio by default, or stretch when requested. Known bounds remain stable through loading and failure; unbounded intrinsic sizing cannot reserve unknown image dimensions. The upload region arranges its preview and separately aligned removal action itself. See [files and uploads](files.md) for ownership, supported compositions and verification.

## Observable acceptance

1. Inspect the visible control surface, not just its DOM bounding box. Confirm one coherent rectangular region, allowing rounding or a documented shape exception. For compound editors, check that cooperating parts still read as one surface.
2. Hold the allocation, content, locale, theme and size choice constant. Exercise applicable ordinary states, including loading start/end and valid/invalid transitions. Compare the actual control width and height, neighboring placement and interaction targets. Apply the accepted sideways-growth allowance for content-sized loading buttons; otherwise, unexplained incidental resizing is a gap.
3. Exercise intentional size changes separately, such as UiCollapsible expansion and supported wrapping selections. Verify that changes follow the documented interaction and remain usable; do not count them as ordinary-state failures.
4. Compare adapted controls with native controls in the same backend and theme, including focus and state cues. Repeat with supported light/dark modes and application customization. Record the native facilities used, adaptation reasons and any inconsistencies.
5. Repeat at narrow allocations, with long localized content and text zoom. Preserve names, content, feedback and operation while applying documented responsive behavior. Stable state dimensions must not become a blanket ban on reflow.

6. For upload regions, inspect minimum-sized allocations across chooser, progress, cancellation, recovery and retained preview states. Confirm no internal scrolling, visible action bounds and usable hit targets. For previews, check contain/stretch, file Tile/Row, thumbnail fallback and stable known bounds; confirm labels/validation remain field-owned.
7. Review elements and steps added by the adapter. Identify the unmet requirement each addition fulfills; remove redundant actions or intermediate steps while verifying that completion, dismissal, keyboard use and focus remain operable.

Geometry and visual consistency require real-browser observation. Type, DOM and documentation checks alone do not establish conformance. Record the tested backend, version, theme, contexts and remaining gaps before making a support claim.

## Field labels and control alignment

Follow the [field alignment discipline](field-alignment.md): coordinate label spacing, first-row anchors, unequal editor heights and feedback growth. Backend-owned field rows must not center complete label/control/feedback stacks merely because their heights differ. Native floating labels and explicitly requested layout alignment retain their contracts.


## Checkable-control labels

**Checkable controls** are checkboxes, radio buttons and switches. Dropdowns and segmented selectors are outside this category. Their labels identify the setting or option being checked and remain visible, including under `uiFieldLabels('hidden')`. Radio/checkbox group titles also remain visible; option labels identify individual choices and always stay beside their controls.

[uiCheckablePresentation](../strategies/uiCheckablePresentation.md) controls the field's relationship to label and value areas. The default `adapt` uses control-aligned presentation for effective beside label placement and flushed presentation otherwise. Explicit `flushed` places the control and adjacent label at the field's logical start. `control-aligned` places them in the value area; group titles occupy the label area. `separated` puts a standalone field label or group title in the label area and its control/options in the value area. Group option labels remain adjacent in every mode. Near/far aligns text within the label area. These columns may stack on narrow screens without hiding labels or detaching option labels from controls.

Resolve the backend's effective ordinary label placement, including omission,
general show and unsupported requests, before selecting adapt's concrete arrangement. Unsupported checkable arrangements resolve through adapt to a supported mode, with flushed as the baseline. All defaults and
unsupported detail finish resolution before rendering; equivalent resolved
presentations share native integration, arrangement and spacing.

In control-aligned presentation, field descriptions and below-control feedback align with the control area/check control rather than the adjacent label, including when adapt selects that mode or columns stack on narrow screens. For a flushed standalone checkbox or switch, descriptions align with the adjacent label text's logical start, including multiline text and RTL. Backends own exact spacing and compatible native integration. Business authors supply meaningful UiField and entry labels; no CSS is required.

Acceptance: compare all modes with ordinary fields, including omitted/hidden/beside label strategies, narrow/wide layouts, wrapping and both directions. Verify visible standalone labels, group titles and option labels; retained names, values, control identity, focus, label activation, required annotations and help/error associations. DOM checks establish wiring; real-browser geometry and interaction evidence remain distinct from human visual acceptance.

## Button action color and emphasis

Use the [button action guidance](button-actions.md) to choose semantic color and contextual emphasis independently. Destructive/removal meaning uses danger; explicit Yes/No decisions use success/danger unless destructive meaning takes precedence. Ordinary standalone/principal actions use primary/filled and companions use primary/neutral. When peer actions have no clear ranking, they may all use primary/filled; a row does not require an invented principal/companion hierarchy. Preserve integrated/native controls and intentional presentation specimens.
