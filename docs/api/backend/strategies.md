# Strategy integration

[Backend reference](README.md) · [API reference](../README.md)

Query resolution, field policy, alignment and size integration.

## Strategy queries

Core creates logical strategy nodes for its public components and gives backend views the existing node. Backend wrappers must not add depth. Use `useUiStrategy(query, supports, context?)` from `@uninterface/uninterface/backend` during setup. It returns `ComputedRef<UiStrategyResolution<T>>`; `supports` is a readonly value array or a predicate. Queries with a required context type require its getter as the third argument. Common query identities include `uiButtonVariantQuery`, `uiControlSizeQuery`, `uiFieldLabelsQuery`, `uiCheckablePresentationQuery`, `uiRequiredAnnotationsQuery`, `uiFieldHelpQuery`, and `uiValidationFailureQuery`. The [strategy catalog](../../strategies/README.md) links each concern and its query reference; this list is not exhaustive.

```ts
const size = useUiStrategy(uiControlSizeQuery, [-2, -1, 0, 1, 2])
// In computed/render: use size.value.value only when status === 'answered'.
// Otherwise retain this backend's normal supported presentation.
```

Declare only concerns the adapter fulfills. For common queries with documented fallback relationships, accept the entire request vocabulary, agree on original requests, then fulfill the result through the documented relationships. Native support need not include every concrete treatment. For example, size accepts all five requests and maps the agreed value toward zero when a level is unavailable (clamp -2/2 to -1/1 for three-level backends). The field policy helper similarly generalizes label detail after agreement; its labels option declares concrete placement support. Custom queries without a fallback contract may filter unsupported contributions before agreement. Do not infer strategy effects from family names or forward unsupported toolkit props. Core filters contributions, applies query agreement and returns a reactive resolution; adapter mapping stays backend-owned. Changing a decision must preserve the interaction target, value, focus, accessibility associations and control lifetime. Unimplemented optional concerns are ignored; common concerns that participate must follow their fallback contract. Required capabilities remain independent. Contributor names and unanswered reasons support inspection without selecting a winner by attachment order.

Custom participant components register a logical role with `useUiStrategyNode` from this entry point in setup:

```ts
useUiStrategyNode(
  target: UiStrategyTarget,
  attachment?: () => {
    use?: UiStrategyDeclaration | readonly UiStrategyDeclaration[]
    block?: UiStrategyBlock | readonly UiStrategyBlock[]
  },
): {
  query<T, Context = void>(
    query: UiStrategyQuery<T, Context>,
    supports: readonly NoInfer<T>[] | ((value: NoInfer<T>) => boolean),
    ...context: void extends Context
      ? [context?: () => Context]
      : [context: () => Context]
  ): ComputedRef<UiStrategyResolution<T>>
  resolve<T, Context = void>(
    query: UiStrategyQuery<T, Context>,
    supports: (value: NoInfer<T>) => boolean,
    ...context: void extends Context
      ? [context?: Context]
      : [context: Context]
  ): UiStrategyResolution<T>
}
```

The optional attachment getter defaults to no local declarations/barriers and is evaluated reactively. It uses the same incoming-block/local-use semantics as UiStrategy. `NoInfer<T>` keeps support declarations constrained to the query's value type. Call `node.query(query, supports)` for the reactive result. This registers one logical node and provides its context to descendants. Use this for genuinely new logical participants; backend views rendering existing core nodes use useUiStrategy instead. Calls require Vue setup context. Common/custom types and factories are exported from the business entry point and documented individually in the API index.

UiStrategy needs no backend view. It supports reactive declarations/barriers, per-declaration targets/depth/stopAt and logical Teleport propagation. See the [strategy contract](../../contracts/strategy.md) for support declarations, common values, agreement, depth and barriers. A size adapter maps zero to its native default. Declare each supported field-presentation concern and document native label support, label/failure fallback and checkable adaptations in the backend package. The shared contract defines vocabulary, scope and fallback rules.

Verify scope filtering, common fallback and custom support filtering, conflict behavior, custom queries, live updates, default recovery and actual native size classes. Browser checks must additionally verify geometry, responsive label/feedback placement and visible keyboard focus. DOM evidence alone is not visual conformance.


### Field policy integration helpers

These helpers from `@uninterface/uninterface/backend` resolve policy and associations without rendering DOM. Backend views retain native widgets, markup, theme values and responsive layout ownership.

```ts
useUiFieldStrategies(
  binding: () => UiFieldViewBinding,
  defaults?: {
    help?: 'together' | 'replace-help'
    showRequiredAnnotations?: boolean | (() => boolean)
    requiredAnnotations?: 'prefix' | 'suffix' | (() => 'prefix' | 'suffix')
    labels?: readonly LabelPlacement[] | ((value: LabelPlacement) => boolean)
    defaultLabels?: () => ResolvedLabels
    defaultBeside?: () => 'beside-near' | 'beside-far'
    besideAlignments?: readonly ('near' | 'far')[]
    checkableModes?: readonly ('flushed' | 'control-aligned' | 'separated')[]
    failureModes?: readonly [FailureMode, ...FailureMode[]]
    defaultFailure?: () => FailureMode | 'none'
    feedbackRoot?: Ref<unknown>
  },
)
// LabelPlacement = 'above' | 'beside' | 'floating'
// ResolvedLabels = 'above' | 'beside-far' | 'beside-near' | 'floating'
//                | 'hidden' | 'integrated' | 'adjacent'
// FailureMode = 'show-below' | 'show-embedded' | 'show-tooltip'
```

The computed policy resolves presentation before rendering. Its rendering
members are `labels`, `labelAlignment`, `checkableMode`,
`checkableLabelAlignment`, `requiredAnnotations`, `markerPosition`, `marker`,
`help`, `failure`, `showFailure`, `issue`, `showHelp`, `describedBy` and
`inlineFeedbackDeferred`.
`active`, `labelsSpecified`, `requestedLabels`, `annotationsSpecified`,
`failureSpecified` and `requestedFailure` are diagnostic intent metadata;
renderers must not use them to repeat default or fallback decisions.

Supply the field's root element or native Vue component ref as `feedbackRoot`
to keep newly added feedback from moving a pressed target outside the field.
While `inlineFeedbackDeferred` is true, `showHelp` preserves the previous
layout. Make the new `issue` available to assistive technology through its
existing description ID while keeping it out of the layout. Use the backend's
normal feedback treatment once the press and click complete. Validation state,
description associations and native form submission continue independently.

`labels` always contains a concrete treatment, including when the query is
unanswered. `defaultLabels` reports reactive ordinary native placement (above
if omitted). General show resolves to that visible placement. The internal
integrated and adjacent treatments represent native integrated labels and
standalone checkable labels respectively; they are not public strategy values.
The `labels` option declares ordinary placement support, including the column
arrangement used to resolve adapt for checkable fields. Do not disable beside
support merely because a checkable's final label remains adjacent; the backend's
ordinary column capability is the prerequisite, before checkable mode selection. Hidden is terminal and
retains accessible names. Unsupported floating/above resolves to the ordinary
visible treatment. Beside resolves to a supported near/far value before rendering.
`defaultBeside` supplies the current native horizontal alignment (far if omitted),
and must select a member of `besideAlignments` when that list is provided.
`besideAlignments` declares backend-global alignment support, independently of
per-field placement support. Every participating ordinary/checkable heading uses
that same resolution; there is no separate general-beside render path.
`labelAlignment` is near/far for concrete beside labels and undefined otherwise.

For checkable fields, `checkableMode` is flushed/control-aligned/separated after
adapt resolution; it is undefined for ordinary fields. Resolve effective ordinary
label placement after agreement and defaults/fallback, then derive adapt from
that supported result. Effective beside selects control-aligned; every other
placement selects flushed. This applies to explicit label requests as well as
omission and general show. `checkableModes` declares supported concrete
arrangements (all three if omitted); it must include flushed. Unsupported
requests fall back through adapt, then flushed, after agreement and before
rendering. A backend without a separate control area declares flushed only rather than manufacturing columns. Group titles use
above in flushed mode and concrete beside alignment in aligned/separated modes;
standalone labels use adjacent unless separated. `checkableLabelAlignment` is
the checkable alias of resolved `labelAlignment`. Backends own columns,
responsive stacking and description alignment; fulfill the
[mode matrix and lifecycle requirements](../../strategies/uiCheckablePresentation.md#backend-implementation-requirements).

`failureModes` lists supported visible treatments in preference order (below if
omitted). `defaultFailure` reports ordinary native message configuration,
including none for configured suppression; it must report a supported treatment.
Omission resolves that configuration. General show and unsupported placement
resolve a concrete visible default, using the first supported mode when the
ordinary default suppresses messages. None remains exactly none. The policy's
issue is null when hidden; the binding retains the real issue. Use policy.issue
for visible messages and binding.issue for semantic invalidity, native
invalid-state styling and validation. Embedded requires actual message text
inside the control surface. Equivalent resolved modes use the same native
message integration and metrics; do not branch on the original request.

`requiredAnnotations` resolves to prefix/suffix/no. Yes resolves the backend's
configured placement; omission also respects `showRequiredAnnotations`.
Explicit prefix/suffix/no remain authoritative. Supply a getter for reactive
native marker placement. `help` resolves to together/replace-help, with
replace-help as the helper fallback unless the backend supplies its policy.
Hidden message associations are removed without removing caller descriptions;
helpers yield only to visible errors. These helpers own no DOM, inject no
strategy declarations, and never authorize editor replacement.

`useUiFieldStrategyContext()` returns the nearest field's computed resolved
policy, or undefined outside a field. Editors use this shared policy rather
than independently querying/defaulting field presentation. It creates no
logical node, control owner or DOM boundary.

`useUiFieldFailure(binding: () => { invalid: boolean })` returns a computed
boolean for native invalid-state highlighting. Suppressing failure messages
does not suppress this state. Never use it to overwrite semantic aria-invalid
or validation state.

`useUiFieldDescription(binding: () => { id: string; describedBy?: string;
invalid: boolean }, defaultHelp?: 'together' | 'replace-help')` returns the
computed description-ID string, or undefined. It retains caller associations,
removes this field's issue ID when messages are suppressed, and removes its
help ID only while a visible failure replaces help. Outside a field it uses
the supplied help default (together if omitted). Supply the owning field ID,
not an inner editor/frame ID. Backends attach the result to the actual
interactive target and preserve description/announcement lifetime.

Observable verification for these helpers includes omission, affirmative and
unsupported-request equivalence, reactive native defaults, agreement/conflict,
query barriers, hidden/none restoration, unchanged semantic invalidity, and
retained editor/draft/focus. Browser geometry and accessible associations must
be checked alongside policy values.


## Field alignment discipline

Backends must fulfill the [field alignment discipline](../../guides/field-alignment.md) for ordinary and grouped fields: shared theme spacing, first-row alignment for above/beside labels, predictable growth of unequal-height controls and feedback, and focus clearance that does not offset visible surfaces. This applies to standalone settings as well as forms. Concrete DOM and techniques remain backend-owned.

`UiFieldViewBinding.checkable` identifies a registered standalone checkable or radio/checkbox group without inspecting opaque editor internals. `useUiFieldStrategies` returns `checkableMode` and `checkableLabelAlignment`, alongside requested and fulfilled label intent. `defaultLabels` reports reactive concrete native form configuration; general values and fallback resolve before rendering, and adapt depends on effective ordinary label placement after that resolution. Fulfill supported checkable arrangements and always-visible labels/titles while preserving option-label identity. The backend owns markup and measurements.

