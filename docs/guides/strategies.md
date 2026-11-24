# Apply presentation strategies

Use strategies to express a presentation preference once for a logical region. Import UiStrategy and common factories from `@uninterface/uninterface`. Ordinary use needs no strategy: the backend supplies its normal presentation.

```vue
<UiStrategy :use="[
  uiControlSize(-1),
  uiFieldLabels('beside'),
  uiFieldHelp('replace-help'),
]">
  <RecordEditor />
  <UiButton>Save</UiButton>
</UiStrategy>
```

UiStrategy is renderless and supports multiple roots. Native containers and business components can carry its scope to participating descendants. Teleported descendants retain their logical scope. Strategies do not automatically style arbitrary third-party components.

## Limit each declaration

```vue
<UiStrategy :use="[
  uiControlSize(-1, { scope: { targets: ['button'], depth: 2 } }),
  uiFieldHelp('replace-help', { scope: { stopAt: ['form'] } }),
]">
  <RecordEditor />
</UiStrategy>
```

Depth zero is this UiStrategy node. Registered logical children increment depth; DOM wrappers and unregistered business components do not. A form and its field each consume a level before an editor. A nonmatching target still consumes depth. StopAt excludes a matching descendant and its subtree. Omit limits for normal region-wide use. See the [canonical scope rules](../contracts/strategy.md#logical-scope-and-limits) before depending on depth in reusable compositions.

## Block incoming policy

```vue
<UiStrategy :use="uiControlSize(-1)">
  <SearchPanel />
  <UiStrategy :block="uiControlSizeQuery" :use="uiControlSize(0)">
    <RecordEditor />
  </UiStrategy>
</UiStrategy>
```

Import `uiControlSizeQuery` to block all incoming sizing contributions. Blocking `uiControlSize` instead blocks that family alone; custom strategies answering the sizing query remain eligible. Use and block each accept one item or readonly arrays. Barriers do not affect strategies introduced locally or below. Blocking does not change control state or supply a replacement presentation.

## Common and custom declarations

A custom business policy can answer an existing common query:

```ts
import { createUiStrategy, uiControlSizeQuery } from '@uninterface/uninterface'

export const reviewControls = createUiStrategy<-1 | 0>({
  name: 'review-controls',
  answers: (size) => [uiControlSizeQuery.answer(size)],
})

const compactReview = reviewControls(-1, {
  scope: { targets: ['text-editor', 'selection-editor', 'button'] },
})
```

Create/export the family once. Supply declarations through use; recreate them reactively when arguments change. Custom families and common families use the same query protocol and support filtering. Business meaning, value constraints and coordinated scope belong to the custom factory's author.

For a new concern, create a typed query and document its agreement:

```ts
import { createUiStrategyQuery, createUiStrategy } from '@uninterface/uninterface'

export const precisionQuery = createUiStrategyQuery<number>({
  name: 'example.precision',
  agree: (values) => Math.max(...values),
})
export const reportPrecision = createUiStrategy<number>({
  name: 'example.report-precision',
  answers: (digits) => [precisionQuery.answer(digits)],
})
```

Only a custom participant implementing this query receives the effect; ordinary controls ignore it. This example changes presentation precision, not field parsing or persisted numeric values. Validate business-specific arguments inside the custom factory's answers function. Query agreements must handle every supported contribution and avoid relying on attachment order accidentally. Read the [backend query API](../api/backend/strategies.md#strategy-queries) for implementing a participant.

## Intent and presentation

Declare the presentation you want. Strategy values describe intent; backends supply their supported presentation. Authors do not select a matching policy or qualify individual choices with implementation limits. `yes`, `show`, and ordinary `beside` preserve backend defaults for details left unspecified. Explicit choices specify those details. Omission adds no preference, and `hidden`/`no`/`none` explicitly suppress the corresponding visible treatment.

Apply size to a region to coordinate fields, labels, feedback, editors and buttons. A scope targeting only editors deliberately excludes field labels. Common queries apply equal contributions and decline conflicting ones; use block to isolate incoming policy instead of relying on nesting order. See the shared [fulfillment principle](../contracts/strategy.md#strategy-intent-and-backend-fulfillment) and [backend support](../contracts/strategy.md#common-vocabulary-and-support).

Verify the actual business task with the selected backend. Differences in native sizes are expected; changing presentation must preserve values, availability, accessible feedback and focus. Strategy objects are presentation policy, not authorization or a second control state owner.

## Common recommendations and fallback

The [common strategy catalog](../strategies/README.md) gives every strategy the same reference format: purpose, vocabulary, recommendation, fallback, responsibilities and verification. Recommendations express best-default intent; omission allows backends to select different ordinary defaults. Applying a recommendation explicitly requests that intent.

General values leave unspecified details to the backend. More detailed label placements generalize through beside or show when unsupported; required-marker placement generalizes to yes; failure placement generalizes to show. Size levels generalize toward zero. Together and replace-help are alternative policies rather than a hierarchy. These relationships are implicit fulfillment, not another author option. Hidden/no/none remain exact suppression requests. Agreement still compares original requests.

Defaults and fallback resolve before rendering. If a backend chooses far
alignment for beside, `beside` and `beside-far` use the same presentation,
including spacing. Likewise, general yes/show values and unsupported requests
use the concrete supported treatment selected by resolution. There is no
separate "backend default" strategy in rendering. Configuration changes can
change that resolved treatment while preserving the editor and draft.

## Failure messages and label positions

`uiValidationFailure('none' | 'show' | 'show-below' | 'show-embedded' | 'show-tooltip')` controls field failure presentation. Embedded means the message itself inside the control surface. Tooltip requests an anchored floating error bubble, accessible by keyboard, touch and assistive technology. `show` uses the backend default. None suppresses the visible failure message while retaining native invalid-state highlighting, aria-invalid, validation and submission rules. Preserve an appropriate failure explanation elsewhere if selecting none. Form summaries remain independent. Successful validation has no additional presentation.

`uiFieldLabels('show' | 'above' | 'beside' | 'beside-far' | 'beside-near' | 'floating' | 'hidden')` selects label visibility and placement. Show requests visible labels using backend-default placement. Far aligns away from the editor, near toward it. Floating integrates a persistent label with the editor; hidden removes only its visual presentation. Keep enough visible context when hiding labels. Leave the strategy unspecified to retain backend defaults. Backend support is documented by each backend; shared fallback rules are in the [support and fallback contract](../contracts/strategy.md#common-vocabulary-and-support).

## Checkable controls and group headings

Use [uiCheckablePresentation](../strategies/uiCheckablePresentation.md) for regional checkbox, switch and radio/checkbox-group arrangement. Omission selects `adapt`: effective beside placement aligns controls to the value area; other effective placements use the logical start. Label defaults and unsupported requests resolve before adapt selects the arrangement. Explicit `flushed`, `control-aligned` and `separated` express the three arrangements. Backend support governs fulfillment: unsupported aligned/separated requests fall back through adapt to a supported arrangement, with flushed as the baseline. Separate group titles from option labels: titles occupy the field label area in the latter two modes, while individual option labels stay beside controls.

Checkable labels and group titles remain visible under `hidden`. The separated mode may put a standalone checkbox/switch label in the label area; it does not detach the label's activation or accessible association. Narrow layouts may stack the two areas. Ordinary non-checkable fields keep their own hidden-label behavior. See [the principles and acceptance checks](design-principles.md#checkable-control-labels).

## Required annotations

Use `uiRequiredAnnotations('prefix' | 'suffix' | 'yes' | 'no')` to position or hide the annotation on required fields. `yes` enables the annotation using the backend’s default placement, including native form configuration. This affects presentation only: `no` keeps required accessibility semantics and validation intact. Optional annotations are a separate concern and are not implemented.

```vue
<script setup lang="ts">
import { UiStrategy, uiRequiredAnnotations } from '@uninterface/uninterface'
</script>

<template>
  <UiStrategy :use="uiRequiredAnnotations('prefix')">
    <CustomerForm />
  </UiStrategy>
</template>
```

`CustomerForm` is an application-owned form composition. Its required fields receive prefix annotations; its optional fields are unchanged. Verify each choice with ordinary, checkbox and grouped fields, including switching to `no` without losing the draft, editing focus or required semantics.

## Button presentation

Use [uiButtonVariant](../strategies/uiButtonVariant.md) to apply a regional button treatment. Each explicit UiButton.variant takes precedence over the regional preference. The vocabulary is filled, outline, neutral, soft, text and icon; the selected backend documents fulfillment and fallback. Icon placement remains backend-owned; provide a single icon slot plus meaningful default-slot label. See [UiButton](../api/components/UiButton.md).

Use [uiCollectionActionVariant](../strategies/uiCollectionActionVariant.md) for collection record-action surfaces: bordered, soft or text. The collection's text/icon+text/icon content mode remains independent. Default leaves the collection variant to the backend. Bordered preserves each action's ordinary treatment, including mixed filled/outline buttons. Composition defaultVariant supplies that per-action treatment; explicit variant remains authoritative. This concern and the generic button variant must agree on a surface when both answer. See the reference for scope, barriers and defaults.

Use [uiHierarchyLevel](../strategies/uiHierarchyLevel.md) for regional card hierarchy. Negative values are higher, zero ordinary, positive values subordinate; see [cards and hierarchy](cards.md).

See [layout density](layout-density.md) for numeric compact/default/spacious spacing of related items while retaining independent controls.

Collection headers also support [reactive adaptation selection](../strategies/uiCollectionHeaderPresentation.md). Select built-in or custom objects directly; the header supplies current context, and the query agrees on selected objects rather than selector functions or names. Ordinary headers automatically use the built-in responsive choice.
