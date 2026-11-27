# Strategy contract

Renderless attachment, typed queries, custom declarations, reactive scope limits and propagation barriers are implemented. Button variants, control sizing and five field-presentation vocabularies are available, subject to backend-declared support. General negotiation beyond the explicit synchronous query agreement is not implemented.

## Business meaning and ownership

A strategy packages presentation policy so business authors can apply a meaningful treatment to a logical region without repeating component props or supplying CSS. Common strategies have Uninterface-owned query contracts. Custom strategies either answer common queries or introduce queries understood by custom participants. Both use the same mechanism; neither receives automatic priority.

Strategies do not own business values, validation rules, authorization, form participation or control lifetime. Backends own markup, native toolkit mapping, exact dimensions, colors and typography. Native HTML and ordinary business or third-party components can contain participating descendants without understanding strategies themselves. An arbitrary third-party widget receives an effect only if it participates in the relevant query contract.

Read the [usage guide](../guides/strategies.md) for authoring examples and the [backend reference](../api/backend/strategies.md#strategy-queries) for integration.

## Attachment and blocking

[UiStrategy](../api/components/UiStrategy.md) renders only its default-slot content, including multiple roots. It introduces no DOM wrapper, layout, spacing or CSS boundary. Both props are optional:

- `use`: one declaration or a readonly array; omitted or empty adds no local strategies.
- `block`: one strategy-family or query identity, or a readonly array; omitted or empty adds no barriers.

A family barrier removes matching incoming declarations. A query barrier prevents every incoming declaration from answering that query, while preserving its answers to other queries. Barriers apply at the boundary and throughout its subtree. They do not block declarations introduced at that boundary or below it. Array order carries no priority. Empty use does not clear inherited strategies.

Blocking a common family does not block custom strategies answering the same concern. Block the query to isolate that concern entirely. Blocking supplies no replacement value; applicable remaining contributions and defaults continue normally.

## Logical scope and limits

Factories accept an optional second argument `{ scope: { targets?, depth?, stopAt? } }`. Scope belongs to each declaration, not the UiStrategy component.

| Scope member | Meaning |
|---|---|
| `targets` | Exact logical role names eligible to receive answers; omitted matches all; empty matches none |
| `depth` | Maximum logical depth, inclusive; nonnegative integer; omitted is unbounded |
| `stopAt` | Stop before any matching descendant role, removing that declaration from its whole subtree |

The attachment node has depth zero. Each registered logical node increments depth, whether or not it matches targets. Native DOM, backend wrappers and unregistered Vue components add no depth. Teleport retains logical ancestry. StopAt examines descendants, not the node introducing the declaration. It is an explicit stopping rule; it does not restart depth, mutate values or reset other strategies.

UiCollectionFooter registers the `collection-footer` logical role; it adds one strategy depth and forwards context to its slotted controls.

Logical roles include `strategy`, `app`, `content`, `card`, `navbar`, `form`, `field`, `text-editor`, `boolean-editor`, `selection-editor`, `button`, `layout`, `region-layout`, `grid-layout`, `menu`, `navigation-menu`, and `icon`; this is not an exhaustive role registry. Additional components register their own roles, such as `date-editor` and `suggestions`. UiFlowLayout uses its UiLayout composition's single `layout` node. Private region allocations add no node. A custom participant can register an application-owned role using `useUiStrategyNode` from the backend entry point; its lifetime is the component's setup lifetime. Counting is independent of toolkit DOM, but changing logical composition can deliberately change depth.

Core enforces the declared limits. Strategy authors remain responsible for selecting appropriate roles and limits. There is no configurable arbitrary reset callback in the current API; broader reset behavior requires its own contract.

## Queries and agreement

Query identity is a symbol-backed object created once by `createUiStrategyQuery`. Strategy families are symbol-backed callable identities created by `createUiStrategy`. Human-readable names support inspection but are not identities; independently created objects with the same name remain distinct. Export and reuse identities rather than reconstructing them during rendering.

A declaration contains typed query answers and immutable scope data. A backend asks a query at the existing logical node and declares the values it can implement. Core gathers every applicable answer, removes blocked and unsupported contributions, and calls that query's explicit `agree(values)` function once with all remaining values. No local-wins, last-wins or priority rule is implied. Query contracts define their own agreements; an agreement must not rely on incidental declaration order unless its contract explicitly defines that significance.

The common queries use **unanimity among supported contributions**: equal values agree; differing values return no agreement. A backend then retains its ordinary presentation. This is the agreement of these queries, not a universal resolver rule. A custom query must explicitly supply its agreement and can combine contributions in another documented way. Strategies participate in that agreement by contributing typed answers under the query's contract. Per-strategy negotiation callbacks and asynchronous agreement are outside the current implementation.

Reactive replacement of use/block and their scopes updates decisions without remounting content. Repeated occurrences contribute separately; there is no deduplication or hidden instance priority. Query results expose `answered` with a value, or `unanswered` with `no-answer`/`no-agreement`, plus contributor names. Inspection does not establish backend conformance.

## Optional preferences, defaults and failures

Strategies are optional presentation preferences. Independent query answers from one custom strategy can be applied independently. If a custom policy requires inseparable decisions, its author must express that coordination through a suitable query and agreement; a list of independent answers is not an atomic bundle.

### Strategy intent and backend fulfillment

A strategy states the desired presentation, independently of toolkit support. Its values and descriptions describe that intent; matching is an implicit backend responsibility, never an extra author choice or a qualifier attached to a strategy value.

A general affirmative value enables the treatment and leaves unspecified details at backend defaults: label show preserves default visible placement, required annotations yes preserves configured placement, failure show preserves its ordinary visible presentation, and beside leaves alignment to the backend. Explicit values request those details. Omission expresses no preference; hidden/no/none explicitly suppress the named treatment and must not turn into a visible alternative.

Backends use supported native APIs and documented mappings, preserve intent wherever possible, and leave an unsupported concern alone when no appropriate treatment exists. They must not invent unrelated behavior or weaken business, interaction or accessibility guarantees. Common requests agree on their original values before fallback. Unsupported detail then generalizes through the strategy’s documented relationships; differing requests remain a conflict even if they could produce the same native treatment. Required capability checks remain independent. Strategy-specific generalization relationships belong to each common strategy reference. Concrete native mappings and limits belong to backend support documentation and the [backend protocol](../api/backend/strategies.md#strategy-queries).

**Resolve before rendering.** After agreement, resolve omission, general values,
contextual defaults and unsupported detail to a concrete supported presentation.
Rendering consumes that result; it must not interpret an unresolved "backend
default", repeat fallback, or select a separate path for equivalent requests.
For example, beside resolves to either beside-near or beside-far according to
the backend's current default; yes resolves to the selected annotation
placement; failure show resolves to a supported visible message treatment;
adapt resolves to a concrete checkable arrangement. This rule applies to every
strategy with defaults or fallback relationships. Native configuration may be
reactive, so resolution must update with it. Preserve the original query answer
for agreement, dependent policy and diagnostics; do not feed fulfilled values
back into agreement. No answer or disagreement also resolves an ordinary
presentation before rendering, without manufacturing an author declaration.

When a strategy depends on effective presentation, resolve that prerequisite
before deriving the dependent result. Checkable adapt uses effective ordinary
label placement after defaults and support fallback, on every backend: beside
selects control-aligned; above, integrated, floating and hidden select flushed.
Explicit checkable modes select their own arrangement where supported.
Unsupported arrangements resolve through adapt to a supported mode, with flushed
as the baseline. This
ordering does not change agreement on original contributions or responsive
stacking of the resolved arrangement.

Equivalent resolved presentations use the same native integration, geometry,
spacing and state treatment for the same field and context. A backend may use
a concrete integrated-label treatment or native binding values internally;
these are fulfillment results, not additional author-facing strategy values.

No answer or no agreement retains the backend's supported ordinary presentation. Control sizing uses zero as the ordinary level; exact dimensions remain backend/theme-owned. With no applicable strategy, consumers need no strategy wrapper to get usable presentation. Each common strategy documents its recommended value. Recommendations express best-default intent, not mandatory active declarations: a backend may choose a different default when unspecified, including application-owned native configuration. Explicit general affirmative values still require the treatment to be visible. A general context-based default-selection engine is not implemented.

An application can still explicitly require a capability. Optional strategy fallback does not waive that requirement. Invalid common values or depth limits throw; unexpected factory/query/adapter errors propagate. Unsupported optional preferences do not produce warnings or errors merely because they are unsupported. An agreement returning an invalid query value is an implementation error. A valid request needing generalization is ordinary fulfillment.

### Checkable-control labels

Checkboxes, radio buttons and switches form the checkable-control presentation category. Their labels and group titles remain visible even under hidden. Whole-field arrangement uses [uiCheckablePresentation](../strategies/uiCheckablePresentation.md): adapt by default, or explicit flushed/control-aligned/separated. Individual option labels stay beside their controls; separated may place a standalone label in the field label area. See the [principles and acceptance checks](../guides/design-principles.md#checkable-control-labels).

Backends must fulfill the [implementation requirements and mode matrix](../strategies/uiCheckablePresentation.md#backend-implementation-requirements),
including control-area descriptions/feedback in control-aligned mode,
label-text descriptions for flushed standalone controls, reactive adapt
resolution, native interaction and retained editor/association identity.
Responsive stacking does not change those responsibilities.

## Common vocabulary and support

The [common strategy catalog](../strategies/README.md) links the canonical individual references. Each defines purpose, values, core recommendation, default/fallback relationships, responsibilities and verification.

| Factory / corresponding query | Values | Core recommendation |
|---|---|---|
| [uiCollectionActionVariant](../strategies/uiCollectionActionVariant.md) / `uiCollectionActionVariantQuery` | `bordered`, `soft`, `text` | Backend collection variant |
| [uiButtonVariant](../strategies/uiButtonVariant.md) / `uiButtonVariantQuery` | `filled`, `outline`, `neutral`, `soft`, `text`, `icon` | `filled` |
| [uiLayoutDensity](../strategies/uiLayoutDensity.md) / `uiLayoutDensityQuery` | `-1`, `0`, `1` | `0` |
| [uiControlSize](../strategies/uiControlSize.md) / `uiControlSizeQuery` | `-2`, `-1`, `0`, `1`, `2` | `0` |
| [uiFieldLabels](../strategies/uiFieldLabels.md) / `uiFieldLabelsQuery` | `show`, `above`, `beside`, `beside-far`, `beside-near`, `floating`, `hidden` | `show` |
| [uiCheckablePresentation](../strategies/uiCheckablePresentation.md) / `uiCheckablePresentationQuery` | `adapt`, `flushed`, `control-aligned`, `separated` | `adapt` (backend default) |
| [uiRequiredAnnotations](../strategies/uiRequiredAnnotations.md) / `uiRequiredAnnotationsQuery` | `prefix`, `suffix`, `yes`, `no` | `yes` |
| [uiFieldHelp](../strategies/uiFieldHelp.md) / `uiFieldHelpQuery` | `together`, `replace-help` | `replace-help` |
| [uiValidationFailure](../strategies/uiValidationFailure.md) / `uiValidationFailureQuery` | `none`, `show`, `show-below`, `show-embedded`, `show-tooltip` | `show` |

Size is ordinal, not a multiplier or additive offset. Zero requests ordinary size; negative/positive levels request smaller/larger controls. The three-level scale is -1/0/1; five-level support adds -2/2. Agreement compares requested levels; distinct requests do not become equal merely because a backend presents them alike. Size concerns control scale/footprint, not layout width or peer spacing. Density and visible mark size can differ; mappings must describe the actual effect.

A regional size request applies to participating fields as well as their editors and buttons. Field labels and feedback use the backend’s coordinated field-size presentation. Native size or density facilities can deliberately change geometry while leaving typography unchanged. Size is not a universal font multiplier. Field sizing must not leak through a query barrier or exceed a declaration's targets/depth via toolkit context inheritance. Targeting editors alone deliberately leaves the field's label presentation ordinary.

Label positions preserve accessible associations. `floating` places the label within the editor presentation and moves it to a persistent raised position when focused or populated; it never substitutes a placeholder for the label. `hidden` visually hides ordinary non-checkable field labels/group names while retaining their accessible names. Checkable labels and group titles follow the always-visible rule above. Consumers selecting hidden must provide enough visible context to understand the field. Omission contributes no label answer: it must not impose above, floating or another shared placement. Each backend retains its own supported defaults and application configuration. Supported beside placement can adapt above when space is insufficient. Unsupported label detail generalizes to a visible treatment through the documented label fallback paths; do not invent a replacement layout. `beside-far` aligns label text away from the editor, and `beside-near` toward it; ordinary `beside` lets the backend select its supported alignment. Required annotations affect only required fields: `prefix` and `suffix` select placement relative to the label, `yes` enables an annotation using the backend’s default placement, and `no` hides it. Omission expresses no preference. Required accessibility semantics, validation rules and group descriptions remain intact even with `no`. Optional annotations are a separate concern and are not implemented. Help replacement removes only the helper's description association while the error is present and restores it afterward. Errors must remain understandable without color alone. These declarations never change validation timing.

Native size levels, label support and configured defaults are documented by the selected backend. Supporting the shared query vocabulary does not promise a distinct native size or exact label placement for every request.

Beside-far/near requests generalize to beside where supported, otherwise show. Near/far support is backend-global: one subset of participating field labels must not honor near while another falls back to far under the same request. General beside chooses the backend's near or far alignment; when equivalent to an explicit alignment, retain the same field arrangement and spacing in the same context. Implementations distinguish text alignment within a label column from the side on which that column is placed. Groups retain naming associations. Checkable arrangements follow their explicit strategy and retain native-compatible label activation and accessible associations. Concrete native mappings and current implementation gaps belong in backend documentation; this requirement does not itself establish adapter conformance.

Supported beside form-label arrangements adapt when space is insufficient. Individual option labels remain beside their controls at every viewport width; separated standalone labels and group headings may stack with the field label area. Responsive thresholds, native size mappings and typography behavior are backend-owned.

### Validation failure presentation

`none` suppresses the visible field error message while retaining native invalid-state styling, validation state, semantic aria-invalid, validation timing and submission blocking. It removes associations to hidden errors and restores helper text if replacement had hidden it. Form submission summaries remain a separate mechanism; consumers selecting none must ensure the overall workflow still explains failures where needed.

`show` selects the backend’s default treatment. `show-below` requests the message below the editor. `show-embedded` requests the error message itself inside the control's visible surface; native details below, borders, icons and tooltips do not qualify. `show-tooltip` requests the error message in an anchored floating bubble associated with the editor. It does not imply an icon, hover-only activation, or an additional business-side trigger setting. The message must be available to keyboard, touch and assistive-technology users. `none` must be honored exactly. Concrete native treatments and limitations are documented by each backend. No success presentation is selected. The error message remains understandable without color alone.

Floating-label support depends on the backend and editor; unsupported requests generalize to show. Checkable and ordinary-group floating requests also generalize to show unless a documented integrated presenter fulfills the request. Segmented editors use ordinary fields. Hidden labels, tooltip failures and ordinary feedback defaults depend on the backend’s documented support. While an issue is present, the visual tooltip follows the anchor and requires at least half of its area to be visible within known clipping and layout boundaries. Error descriptions remain available independently of the bubble. In a popup above its owning modal’s header and footer, supporting field presenters use below-field feedback to keep the error with its editor. Native positioning and theme are backend-owned. Unsupported embedded requests follow the concern’s documented fallback.

Backends declare support for required annotations, helper coexistence/replacement and failure visibility individually. Native help/error slots are retained where they express the requested policy. Field and editor views coordinate both styling and accessible description IDs. Changing strategies must preserve the editor instance, draft and focus.

Core declares `strategy.scope.v1`. A supporting backend declares `strategy.control-size.v1`, meaning query integration for all five requests, not five distinct native sizes. Related capabilities include `strategy.button-variant.v1` (all six button variants), `strategy.field-labels.v1`, `strategy.required-annotations.v1`, `strategy.field-help.v1`, `strategy.validation-failure.v1`. Declarations are support claims; simulated-DOM tests verify state, markup and associations, while real-browser verification remains necessary for geometry and responsive presentation.

### Button presentation

[uiButtonVariant](../strategies/uiButtonVariant.md) supplies region-wide filled, outline, neutral, soft, text and icon preferences. An explicit UiButton.variant takes precedence; this is this concern's rule. Unanswered omission leaves the backend default. The icon slot remains a single semantic slot, with placement owned by the backend. Icon presentation retains the label for accessible naming and a native hint. See the strategy reference for defaults, fallback and verification.

## Observable acceptance

Verify renderless multi-root output, preserved keyed instances/drafts/focus on reactive changes, transparent business/native wrappers, logical Teleport inheritance and sibling isolation. Test family versus query blocking, local reintroduction, empty arrays, targets, inclusive depth and stop boundaries. Test unsupported contributions alongside supported outer answers, equal and conflicting common answers, custom agreements, and propagated unexpected errors. Test native size mappings across the declared subsets and default recovery. For field preferences, verify label targeting, required semantics, helper/error descriptions and their restoration. Real-browser checks are needed for computed geometry, focus visibility and responsive presentation; DOM assertions alone do not establish those properties.

Compare general values and unsupported requests against the explicit treatment
they resolve to, including reactive native defaults and restoration after
blocking/conflict. Rendering must receive concrete treatments in every case.
Compare heterogeneous participating fields together so a per-control fallback
cannot hide a backend-wide inconsistency.

## Hierarchy level

[uiHierarchyLevel](../strategies/uiHierarchyLevel.md) answers uiHierarchyLevelQuery for card nodes. Its five values are -2/-1 for higher grouping, 0 ordinary/default, and 1/2 for subordinate grouping. Supporting backends accept all five and currently map -2 to -1; other levels remain differentiated. This is not control sizing or heading rank. Agreement compares original values before adaptation; conflicts/no answer yield zero. UiCard.level overrides the regional answer on that card only. Scope targets/depth/stopAt and family/query barriers retain the usual rules, without arithmetic nesting or native style inheritance bypasses.

## Dynamic stacking integration

The [dynamic z-order contract](dynamic-z-order.md) defines core-owned ordering across surfaces, layers, groups and local parts. Universal `zOrder`, layout `zParts` and adapter registration are implemented; real-browser acceptance remains separately reported. Ordering is distinct from inward layout, visual framing and presentation strategies. Ordering does not replace layout, framing or strategy ownership.

### Layout density support

UiLayout, UiFlowLayout, UiStartEndLayout and UiGridLayout implement numeric peer-spacing intent through uiLayoutDensity. Supporting backends support -1/0/1, require unanimity and retain their original defaults at zero or without an answer. Density uses logical strategy scope rather than inherited CSS. Region allocations remain adjoining; nested ordinary layouts can participate. No direct form, choice-group, list/table, padding, typography or control-size adjustment is implied. See the [guide](../guides/layout-density.md) and each backend's strategy documentation for concrete mappings and evidence limits.

## Collection header adaptation selection

The implemented uiCollectionHeaderPresentation concern is resolved in core at collection-header for participating backends. Its open adaptation objects supply Vue render implementations owning composition and presentation interactions; built-in defaults are long-row outside mobile and narrow-expandable in mobile. Selectors receive a typed current context and are evaluated before object-identity agreement. No answer/disagreement restores the default selection. Names are diagnostic, not registry keys or a finite strategy value catalog. This adds contextual agreement to typed queries without changing scope/block/support semantics for existing concerns. See the [strategy reference](../strategies/uiCollectionHeaderPresentation.md).

The button-width concern exposes content/full through uiButtonWidth and uiButtonWidthQuery. supporting backends declare strategy.button-width.v1. It changes standalone text-button width within its allocation, excluding icon-only and parent-input-frame actions; equal values agree, conflict/no answer preserves defaults. See [button width](../strategies/uiButtonWidth.md).
