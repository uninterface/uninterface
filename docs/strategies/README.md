# Common strategies

For application authors selecting optional presentation preferences, and backend authors fulfilling them. Each strategy reference uses the same format: purpose, API and values, recommended default, fallback relationships, implementation responsibility and verification.

| Strategy | Core recommendation | Reference |
|---|---|---|
| Collection header | Responsive long-row / narrow-expandable | [uiCollectionHeaderPresentation](uiCollectionHeaderPresentation.md) |
| Search filter | Context-sensitive search editor | [uiSearchFilterPresentation](uiSearchFilterPresentation.md) |
| Choice filter | Context-sensitive single/multiple-choice editor | [uiChoiceFilterPresentation](uiChoiceFilterPresentation.md) |
| Range filter | Context-sensitive range editor | [uiRangeFilterPresentation](uiRangeFilterPresentation.md) |
| Layout framing | No separators; flat surfaces | [uiLayoutFraming](uiLayoutFraming.md) |
| Card presentation | Shared five-level treatment map | [uiCardPresentation](uiCardPresentation.md) |
| Hierarchy level | `0` | [uiHierarchyLevel](uiHierarchyLevel.md) |
| Collection action variant | Backend collection variant | [uiCollectionActionVariant](uiCollectionActionVariant.md) |
| Button variant | `filled` | [uiButtonVariant](uiButtonVariant.md) |
| Button width | Backend default | [uiButtonWidth](uiButtonWidth.md) |
| Layout density | `0` | [uiLayoutDensity](uiLayoutDensity.md) |
| Control size | `0` | [uiControlSize](uiControlSize.md) |
| Checkable arrangement | `adapt` (backend default) | [uiCheckablePresentation](uiCheckablePresentation.md) |
| Field labels | `show` | [uiFieldLabels](uiFieldLabels.md) |
| Required annotations | `yes` | [uiRequiredAnnotations](uiRequiredAnnotations.md) |
| Field help | `replace-help` | [uiFieldHelp](uiFieldHelp.md) |
| Validation failure | `show` | [uiValidationFailure](uiValidationFailure.md) |

UiCard selects its documented portable default treatment map in core, then backends translate it. UiCollectionHeader selects its built-in responsive adaptation in core. Checkable presentation defaults to adapt across backends. Other recommendations express the core’s best-default intent; omitted strategies leave defaults to each backend, which may choose differently. Explicit general values such as show and yes still require the treatment to be visible while leaving unspecified details to the backend. Suppression values remain exact.

Fallback generalizes an unsupported requested detail. It is implicit backend fulfillment, not an extra author setting. Requests must agree before fallback; two different requests do not agree merely because they could render alike. See the [strategy contract](../contracts/strategy.md#strategy-intent-and-backend-fulfillment) and [usage guide](../guides/strategies.md) for composition, scope, blocking and custom strategies.

[Documentation index](../README.md)
