# Backend implementation and compliance checklist

[Agent guide and index](README.md)

Use this checklist to implement or review a presentation backend. It applies
to human and agent authors. Completion means evidence for the contracts the
candidate claims; it is not a claim that all planned Uninterface features or
all accessibility standards have been implemented.

Read the [backend authoring reference](../api/backend/README.md), relevant
[component references](../api/components/README.md),
[capability contract](../contracts/capability.md) and
[test-kit contract](../contracts/test-kit.md) first. These documents define
the current bindings and guarantees; this checklist provides the procedure.

For applicable editors, review the [input-styled control agreement](../contracts/input-styled-controls.md) alongside the component contract. Compare field alignment/width, shared surface, keyboard focus, normal row shape and documented wrapping/multiline adaptations with ordinary inputs in the same backend/theme. Record gaps and browser evidence; a matching component name or passing DOM test is insufficient.

Apply the [control presentation principles](../guides/design-principles.md) across controls: inspect coherent rectangular surfaces, ordinary-state dimension stability and consistency with native neighbors. Separate documented exceptions, such as circular avatars or UiCollapsible expansion, from incidental shape or size changes. Use the guide's observable acceptance checks and record remaining gaps.

## 1. Establish the mapping before writing adapters

Audit complete features and compositions, not just matching prop names. A
native input inside a hand-built field does not by itself establish native
field integration. A native popup shell does not establish correct menu
composition, focus or loading behavior.

For each claimed feature, record:

| Required information | What to establish |
| --- | --- |
| Shared rule | Business meaning, authoritative control state and applicable capability identifiers. |
| Native facility | Toolkit component family, composition, services, styles and defaults that fulfill it, with exact dependency versions and source or official documentation references. |
| Translation | How state, interactions, feedback and lifecycle cross the adapter boundary. |
| Integration assumptions | Document baseline, theme/locale context, teleport destination, focus ownership and setup requirements. |
| Adaptation | The specific mismatch or missing native facility, the smallest supplement needed, and its upgrade risk. |
| Acceptance | Observable scenarios, applicable tests, visual comparisons and known limits. |

- [ ] Inspect the pinned toolkit version; distinguish it from newer online
  examples. Reproduce a suspected limitation before treating it as fact.
- [ ] Use compatible native features for loading, disabled state, field
  feedback, menu structure, focus, placement and theme handling.
- [ ] When a high-level widget falls short, examine supported lower-level
  primitives before recreating its behavior or copying its classes.
- [ ] Justify each bypass or visual override by a concrete contract or
  integration need. Preserve native combinations and defaults where compatible.
- [ ] Where native control behavior conflicts with core authority, adapt or
  bypass that behavior while retaining compatible presentation facilities.
- [ ] Treat an independently designed reference presentation separately: it has no vendor aesthetic
  to reproduce, but the same claimed semantic guarantees still apply.

For example, pass source pending state to a toolkit select's native loading
facility when available. Use its native default text when business code has
not requested an override. A menu without that facility may need an adapter
extension; that does not justify replacing the select's working facility.

## 2. Verify assembly and package boundaries

- [ ] Supply the descriptor, machine-readable capabilities, stylesheet and
  statically imported view modules required by the backend reference. Follow
  its composition rules: not every public component requires a separate view.
- [ ] Keep public/backend view names aligned (`UiButton.vue`, for example).
  TypeScript and bundler resolution must select the same backend.
- [ ] Put backend-specific setup instructions in the backend package. Export
  required Vue/build hooks through the documented assembly boundary; a declared
  hook failing to load must not be silently ignored.
- [ ] Preserve tree shaking. Avoid an eager render registry, global widget
  catalog registration or loading unselected backends and their styles.
- [ ] Document global stylesheet/reset effects. Document typography and
  native context must reach teleported content where needed; UiApp is a frame,
  not an implicit owner of all document configuration.
- [ ] Do not require an arbitrary backend-marker ancestor or mandatory styling
  provider. Retain native toolkit theme classes when they serve a documented
  function. Keep component styles from restyling unrelated mixed content.
- [ ] Explain any necessary private toolkit integration and identify what must
  be rechecked on dependency upgrades.
- [ ] State customization support in public backend documentation. Where
  supported, provide application-owned configuration/stylesheet recipes and
  exact setup steps, preferably concentrated in one or two files. Link the
  guide from the package README and setup documentation. See the
  [customization documentation contract](../api/backend/assembly.md#customization-documentation).
- [ ] Distinguish native toolkit possibilities from adapter-supported inputs.
  For upstream theme exports, identify consumed files, conversion steps,
  unsupported settings and version limits. Explain stylesheet order, fonts and
  other assets, build/runtime scope, popup inheritance and adapter-owned spacing.
  Preserve defaults and semantic requests; do not require users to copy native
  integration or patch dependencies to apply a documented theme.

## 3. Preserve control authority and interaction contracts

- [ ] Render core-supplied state and report requests through the documented
  bindings. Do not create competing validation, persistence, entry-source,
  selection or current-navigation state owners.
- [ ] Preserve raw input strings. Codec parsing, normalization and validation
  belong to the control layer, including stale-result handling.
- [ ] Route submit/reset through one form event path. Cancel native reset
  restoration so core restores its own baseline; avoid duplicate toolkit reset
  or submit behavior.
- [ ] Honor button loading OR disabled, preserve action naming and provide
  activity presentation. Loading ending must not lift another restriction.
- [ ] Keep async-select source status separate from its selected value. Test
  unloaded, pending, failed, empty and ready states, retained values and source
  recovery. Do not disable the trigger merely because candidates are pending.
- [ ] Keep menu checked selection, navigation current value, focus and open
  state independent. Exercise nesting, lazy branches, groups and disabled items.
- [ ] Retain optional native-link behavior; application routing stays outside
  the backend. Key-only activation must not require an invented href.
- [ ] Use one owner for each keyboard/focus operation. Supplement unsupported
  native interactions without dispatching the same operation twice.
- [ ] Clean up listeners, observers and floating surfaces on unmount or
  deactivation as required, without disposing business-owned controls.

See [forms](../contracts/form.md),
[control bindings](../contracts/control-binding.md) and
[entry collections](../contracts/entries.md) for the detailed rules.

## 4. Verify presentation, composition and accessibility

- [ ] Isolate modal region presentation from owned popup infrastructure. Inspect native divider/spacing/last-child selectors against the actual portal DOM, including closed-widget placeholders. Opening/closing tooltips and selectors must preserve modal rectangles and separators throughout transitions; check with/without a footer, narrow/wide viewports and LTR/RTL. Preserve body scrolling, nested focus, popup ownership and exit lifetime. Choose a backend-specific structure rather than imposing a core wrapper or adding a z-order group. See [modal view obligations](../api/backend/overlays.md#uimodalviewprops).
- [ ] Inventory backend-generated hidden labels, status announcements, required descriptions and accessible error text. For each absolutely positioned helper, identify its containing block and explicit anchor inside the owning component or required composition. A native visually-hidden utility or incidental card ancestor is insufficient evidence. Follow the [backend containment guidance](../api/backend/presentation.md#visually-hidden-accessibility-content).
- [ ] Exercise those helpers deep inside an otherwise unpositioned bounded scrollport, without protective application wrappers or document overflow locks. Test empty/populated text, hidden-label strategies, validation/recovery, narrow/wide widths and LTR/RTL. Measure inner/document overflow and footer reachability, then verify wheel boundaries and keyboard focus in a real browser.
- [ ] Preserve helper IDs, accessible associations, live-region lifetime and visible focus while correcting containment. Check native direct-child integration such as floating labels and popup behavior. Record DOM, browser and assistive-technology evidence separately; repeat relevant checks after toolkit or helper changes.
- [ ] Associate labels, requirements, errors and help with the actual input or
  accessible widget. Synchronize descriptions when presentation hides content.
- [ ] Forward supported attributes and events to the correct interactive
  target, preserving toolkit handlers and protected binding semantics.
- [ ] Exercise keyboard entry, movement, activation, Escape, Tab, outside
  dismissal and focus return using the component's appropriate native pattern.
- [ ] Verify popup frames, typography, caret placement, nested positioning,
  viewport bounds and stacking against independently authored native examples.
- [ ] Apply layout allocation and scroll rules without introducing decorative
  gaps between adjoining regions. Content insets travel with scrolling content;
  peer spacing remains local to its arrangement.
- [ ] Preserve child identity, input state and meaningful focus across layout
  updates. Measure scrolling, wrapping and retention in a real browser.
- [ ] Check visible focus, zoom, narrow viewports, long labels, disabled/error
  contrast, reduced motion and applicable RTL behavior. Automated accessibility
  scans supplement keyboard and assistive-technology review.

The [accessibility](../contracts/accessibility.md) and
[layout](../contracts/layout.md) contracts specify shared responsibilities.
Do not equate native widget usage with completed accessibility integration.

## 5. Check inherited environment and native configuration

Shared locale and color-mode coordination use application integration. Color-mode support is declared per backend and requires the acceptance checks below.
The checks below identify required evidence when that support is implemented
or claimed; they do not invent configuration APIs or establish support through
this document. State unsupported scopes explicitly.

- [ ] Backend components inherit the selected theme/mode on initial mount,
  including a mode already established by a host. Installation must not silently
  reset it or install a competing preference controller.
- [ ] Nested compositions and teleported menus/selects inherit the same mode
  without per-component business classes or mode props. Include dialogs and
  other overlay families when implemented.
- [ ] Runtime dark/light changes reach existing and open surfaces; reopened
  and later-mounted content receives the latest mode. Verify the return to
  light as well as entry into dark, without losing editing or selection state.
- [ ] Document who owns the document selector/native theme service and any
  system preference or persistence policy. Do not promise independent local
  themes when the toolkit uses document-wide selectors.
- [ ] Verify inherited native locale and direction as well as core messages
  where supported. Imported translation files or CSS direction alone do not
  prove synchronization of native labels, keyboard behavior and placement.
- [ ] Respect the [i18n editing boundary](../contracts/i18n.md): changing message
  language must not silently reinterpret an unfinished locale-sensitive draft.
- [ ] Inspect inherited font, colors and configuration in overlays outside the
  app subtree. Teardown must not reset a host-owned environment.

Use the toolkit's supported configuration and tokens before adding custom
CSS. Check actual computed appearance and behavior; finding a `dark` class
in the DOM is not sufficient evidence of inheritance.

## 6. Produce compliance evidence

Define acceptance cases from contracts before implementation whenever possible.
Use the same business composition and outcomes across backend candidates.
Backend-specific test drivers may accommodate legitimate native interaction
differences; they must not weaken the shared guarantees.

- [ ] Run type, documentation, manifest and assembly checks applicable to the
  candidate, including unused-module and unselected-backend exclusion.
- [ ] Exercise the actual Uninterface composition in control/DOM and browser
  scenarios. A toolkit-only demo does not test the adapter.
- [ ] Compare native toolkit examples with corresponding adapter scenarios,
  including pending, error, disabled, expanded and focused states. Document
  justified differences rather than enforcing universal pixel identity.
- [ ] Keep the demo useful for human interaction and automated verification.
  Include controllable asynchronous success/failure cases.
- [ ] Verify claimed context inheritance and transitions explicitly, not just
  initial light-mode rendering.
- [ ] Document every public export and capability's business meaning,
  implementation responsibility and observable acceptance. Backend setup,
  limitations and version-sensitive mappings must be reviewable publicly.
- [ ] Record failures and blocked checks. Required or claimed capabilities
  cannot be called compliant by skipping their acceptance cases.

Configure the candidate and its native reference application in your test
environment, then run the checks above through that environment’s commands.
Core does not supply a standalone runner. Browser checks and native comparisons
are separate from build/DOM checks; see the [testing guide](../guides/testing.md)
for harness setup and ownership.

For each capability, provide a review record with:

| Field | Required content |
| --- | --- |
| Candidate | Core, adapter and toolkit versions; build/setup configuration. |
| Scope | Capability, relevant rule, supported combinations and limits. |
| Mapping | Native implementation and justified supplements or overrides. |
| Evidence | Scenario/test, preconditions, actions, expected result and actual result; browser/manual artifacts where appropriate. |
| Status | Passed, failed, blocked, not exercised, or not applicable with a reason. |
| Remaining work | Concrete gap and the evidence needed to resolve it. |

Only exercised guarantees can be reported as verified. An optional capability
may remain unsupported with accurate declarations and documentation. A required
capability must fail visibly when unavailable; it cannot be silently degraded.
Build success, toolkit reputation and visual similarity alone are insufficient
grounds for a compatibility claim.

## Scrolling and focus clearance

- Keep ordinary content insets inside the clipping boundary. Do not rely on padding on a parent frame.
- Supply a visible inward indicator for an ordinary focusable scroll host; test it separately from descendant focus. Toast/notification designated content regions instead project that indicator to the complete delivery surface under the [feedback focus standard](../api/backend/feedback.md#toast-and-notification-focus-standard).
- Preserve native spacing totals when redistributing frame padding into a scrolling body.
- Verify normal focus presentation at first/last controls and both inline edges, including programmatic focus, narrow hosts, RTL and forced colors.
- Keep structural allocations adjoining; do not introduce padding on every layout or cancel explicit nested content insets.

See [scrolling content](../guides/scrolling-content.md).

## Field alignment review

Apply the [core field alignment discipline](../guides/field-alignment.md). Compare grouped and ordinary fields, mixed editor heights, above/beside/native labels, feedback growth, focus in scrolling controls, narrow widths and RTL. Record browser evidence separately from DOM/source checks.

## Checkable presentation review

- [ ] Resolve defaults and unsupported strategy detail after agreement and
  before rendering. No renderer interprets general beside/show/yes/adapt or an
  unresolved backend-default strategy. Retain original intent only for
  agreement, dependent resolution and diagnostics.
- [ ] Compare general values and fallbacks with their matching explicit
  treatments, across heterogeneous fields, sizes, wrapping, LTR/RTL and narrow
  stacking. Equivalent resolution must retain native classes, columns, gaps
  and label padding as well as alignment.

Apply the [checkable backend implementation requirements and mode matrix](../strategies/uiCheckablePresentation.md#backend-implementation-requirements)
alongside the [field binding/helper contract](../api/backend/controls.md#uifieldviewbinding).

- [ ] Cover standalone checkbox/switch, radio/checkbox groups and ordinary
  comparison fields. Use the registered field category, preserving opaque
  business/third-party content and separate group/option names.
- [ ] Implement default adapt, supported explicit modes and unsupported-mode fallback. Resolve effective ordinary
  label placement, including reactive defaults and unsupported requests, before
  deriving adapt. Verify unsupported beside falling back to integrated/above
  selects flushed and unsupported floating falling back to beside selects
  control-aligned. Explicit modes remain independent where supported; unsupported arrangements
  resolve through adapt to a supported mode (flushed baseline). Do not manufacture label/value columns for a backend that supports only flushed. Verify disagreement,
  barriers, targets/depth/stopAt and recovery.
- [ ] Keep all checkable labels and group titles visible under hidden. Retain
  adjacent option labels; only separated mode moves standalone labels to the
  label area. Verify native/external labeling does not duplicate names.
- [ ] Measure descriptions and below-control feedback at the control/value-area
  edge for control-aligned, including adapt and narrow stacking. Preserve
  label-text alignment for flushed standalone descriptions and value-area
  ownership for group descriptions. Check option-owned descriptions separately.
- [ ] Verify backend-global near/far alignment across heterogeneous field kinds.
  Compare general beside with the explicit alignment matching the backend default;
  equivalent requests must preserve the same field arrangement and spacing.
- [ ] Change modes with an edited, checked/mixed, focused, required, disabled or
  invalid field. Preserve editor identity, value, activation, focus and unique
  help/error associations, including help replacement and suppressed errors.
- [ ] Exercise long labels, all supported sizes, narrow/wide layouts and LTR/RTL.
  Record computed geometry and native interaction separately from DOM wiring,
  user visual acceptance and assistive-technology results. A checkable-only
  alignment pass does not certify whole-backend consistency.

## Toast and notification focus review

- [ ] Implement the [toast and notification focus standard](../api/backend/feedback.md#toast-and-notification-focus-standard) for both kinds, with standard and rich content.
- [ ] Provide a single named delivery entry point, reusing native surface focus where available. Direct content-region focus highlights the outer delivery; child-control focus does not.
- [ ] Preserve native control indicators, delivery shadows, scroll behavior, focus pause/resume, scoped dismissal and focus recovery. Arrival never captures focus.
- [ ] Verify both Tab directions, updates without remounting, titled/untitled messages, light/dark, narrow LTR/RTL, forced colors and unclipped indicators. Record browser/AT acceptance separately from DOM matching.
