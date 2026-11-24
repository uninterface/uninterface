# uiValidationFailure

## Purpose

Validation failure: Choose whether field failures are visible and how their messages appear. This changes presentation, never validation timing, semantic invalidity, requiredness or submission blocking.

## API and values

Import from `@uninterface/uninterface`.

```ts
uiValidationFailure(value: 'none' | 'show' | 'show-below' | 'show-embedded' | 'show-tooltip', options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
```

The common vocabulary is the recommended set of author-facing values:

| Value | Meaning |
|---|---|
| `show` | Show failures using the backend’s default visible treatment. |
| `show-below` | Show the message below the editor. |
| `show-embedded` | Show the message itself inside the control’s visible surface. |
| `show-tooltip` | Show the message in an anchored floating bubble. |
| `none` | Suppress the field’s visible failure message; retain native invalid-state highlighting. |

## Recommended default

Use `show` to explain failures without choosing presentation details. Omission leaves backend defaults and supported native configuration intact; explicit show requests visible feedback.

Core recommendations are best-default intent values, not mandatory active declarations. Backends may choose different defaults when unspecified.

## Fallback relationships

Unsupported message placement generalizes to show: `show-below → show`, `show-embedded → show`, `show-tooltip → show`. Show uses the backend’s default visible treatment. `none` is terminal and must not become visible feedback.

An error border, icon, tooltip or below-field details row does not fulfill embedded text. Backends own tooltip activation and placement and must provide keyboard/touch access and an accessible error association. The visual tooltip needs at least half of its editor anchor visible and follows the editor when layout moves it. The error and its description remain associated while the visual tooltip is hidden. If a popup stacks above its owning modal header and footer, a backend that supports below-field feedback shows the error inside that popup. Errors must be understandable without color alone.

None preserves native invalid-state highlighting, aria-invalid, validation and submission blocking, removes hidden error description IDs, and restores helper text hidden only by the displayed error. Consumers choosing none must ensure failures are explained appropriately elsewhere. Form submission summaries are independent. Successful validation has no additional presentation through this strategy.

## Use and implementation responsibility

Use the declaration with `UiStrategy.use`. Its optional scope limits targets, depth and stop boundaries. Block the factory to stop this family, or its corresponding query to stop all incoming contributions to the concern. Common requests must agree before backend fulfillment; different requests do not become equal because they share a fallback. Conflicts retain backend defaults. See the [strategy guide](../guides/strategies.md) and [shared contract](../contracts/strategy.md).

Backends own concrete markup, native integration, theme and fulfillment; strategies preserve business/control state and accessibility. Invalid common values throw. The corresponding shared query is [uiValidationFailureQuery](../api/constants/uiValidationFailureQuery.md).

### Independent page jumper

[UiPaginatorJumper](../api/components/UiPaginatorJumper.md) participates without a UiField ancestor, at strategy target `paginator-jumper`. Supporting backends support tooltip and below feedback for this control, defaulting to an automatically visible tooltip so an invalid page does not enlarge its footer. `show` and unsupported `show-embedded` use that default; `none` preserves semantic invalidity and prevents invalid navigation. Editing clears its local error. This control-specific default does not change ordinary field defaults. Supporting backends also support explicit tooltip requests for ordinary fields; ordinary field defaults remain backend-owned.

## Verification

Resolve show and unsupported placement to a concrete supported visible treatment
before rendering. Omission resolves ordinary native configuration, including
configured suppression. Compare equivalent resolved requests for identical
message integration and geometry; renderers do not branch on the original
general or unsupported request.

Exercise every placement and fallback, including none/show transitions. Check native default configuration, error/help associations, invalid state, submission blocking and retained editor identity/focus. Use a browser to verify actual message geometry and tooltip access.
