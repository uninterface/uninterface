# uiFieldLabels

## Purpose

Field labels: Control label visibility and placement without changing the field’s meaning or accessible name.

## API and values

Import from `@uninterface/uninterface`.

```ts
uiFieldLabels(value: 'show' | 'above' | 'beside' | 'beside-far' | 'beside-near' | 'floating' | 'hidden', options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
```

The common vocabulary is the recommended set of author-facing values:

| Value | Meaning |
|---|---|
| `show` | Show the label using the backend’s default visible placement. |
| `above` | Place it above the editor. |
| `beside` | Place it beside the editor using backend alignment. |
| `beside-far` | Beside, with text aligned away from the editor. |
| `beside-near` | Beside, with text aligned toward the editor. |
| `floating` | Integrate the label with the control surface; raise it on focus or when populated, retaining it after entry. |
| `hidden` | Hide the label visually while retaining its accessible name. |

## Checkable-control rule

Checkable labels and radio/checkbox-group titles stay visible, including under `hidden`. Their whole-field arrangement is governed by [uiCheckablePresentation](uiCheckablePresentation.md), whose default `adapt` uses effective ordinary label placement after defaults and backend support fallback. Effective beside placement selects control alignment; other effective placements select flushed presentation. For example, unsupported beside resolving to integrated labels selects flushed. Option labels always stay beside their controls. The explicit separated arrangement puts a standalone checkbox/switch label or group title in the label area. See [the normative principles](../guides/design-principles.md#checkable-control-labels).

## Recommended default

Use `show` to request visible labels without choosing a location. Omission allows the backend to choose its own default; explicit `show` must display labels even if an omitted strategy would hide them.

Core recommendations are best-default intent values, not mandatory active declarations. Backends may choose different defaults when unspecified.

## Fallback relationships

Use these generalization paths only when the requested detail is unsupported:

- `beside-near → beside → show`
- `beside-far → beside → show`
- `above → show`
- `floating → show`

`show` and `hidden` are terminal visibility choices for ordinary fields; the checkable visibility rule above takes precedence for checkable labels and group titles. A backend must not turn show into hidden, or hidden into a visible fallback. Show selects its default **visible** treatment, not necessarily above. Do not manufacture unsupported layouts. Far/near describes alignment inside the label area, not moving the label to the opposite side of the editor. Ordinary form-label columns may stack on narrow screens; individual option labels remain beside their controls; standalone labels may use explicit separated presentation.

Hidden preserves associated labels or group names. Consumers must provide enough surrounding visible context to understand the field. A placeholder never substitutes for a label. Native support is documented by each backend; shared fallback rules are in the [support and fallback contract](../contracts/strategy.md#common-vocabulary-and-support).

## Use and implementation responsibility

Near/far alignment support is backend-global. Do not honor near for some
participating field labels/group titles while falling back to far for others
under the same strategy request. General beside selects the backend's near/far
alignment; when equivalent to an explicit alignment, the same field/context
must retain its arrangement and spacing. This is independent of checkable-mode
selection. Backend documentation owns concrete mappings and remaining
implementation gaps; the rule alone does not establish current conformance.

Resolve omission, show, beside and unsupported placement before rendering.
Beside must become either beside-near or beside-far using the backend's current
default. Unsupported detail follows the fallback relationships until a concrete
supported treatment is selected; show is not the end of resolution. Rendering
uses that treatment exclusively, with the same native integration and geometry
as an equivalent explicit request. Preserve original requests during agreement.

Use the declaration with `UiStrategy.use`. Its optional scope limits targets, depth and stop boundaries. Block the factory to stop this family, or its corresponding query to stop all incoming contributions to the concern. Common requests must agree before backend fulfillment; different requests do not become equal because they share a fallback. Conflicts retain backend defaults. See the [strategy guide](../guides/strategies.md) and [shared contract](../contracts/strategy.md).

Backends own concrete markup, native integration, theme and fulfillment; strategies preserve business/control state and accessibility. Invalid common values throw. The corresponding shared query is [uiFieldLabelsQuery](../api/constants/uiFieldLabelsQuery.md).

## Verification

Verify every supported position and each fallback, including checkbox/group restrictions. Check that show follows native placement, hidden retains accessible names, and reactive changes preserve the editor, draft and focus.
