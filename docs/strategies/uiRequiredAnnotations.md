# uiRequiredAnnotations

## Purpose

Required annotations: Show, position or hide the visual annotation identifying a required field. This does not make a field required, add validation rules, or establish form participation.

## API and values

Import from `@uninterface/uninterface`.

```ts
uiRequiredAnnotations(value: 'prefix' | 'suffix' | 'yes' | 'no', options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
```

The common vocabulary is the recommended set of author-facing values:

| Value | Meaning |
|---|---|
| `yes` | Show the annotation using backend-default placement. |
| `prefix` | Show it before the label. |
| `suffix` | Show it after the label. |
| `no` | Hide the visual annotation. |

## Recommended default

Use `yes` to disclose required fields while leaving placement to the backend. Omission allows native/backend annotation defaults, including configured visibility; explicit yes enables the annotation.

Core recommendations are best-default intent values, not mandatory active declarations. Backends may choose different defaults when unspecified.

## Fallback relationships

Unsupported placement generalizes as `prefix → yes` or `suffix → yes`. Yes uses the backend’s supported default placement, including application-owned native configuration; it does not mean suffix. `no` is terminal and must not fall back to a visible annotation. Only required fields are affected.

Required accessibility semantics, validation and group descriptions remain intact with no visible annotation. Optional annotations are separate and are not implemented. Themes own the marker artwork.

## Use and implementation responsibility

Use the declaration with `UiStrategy.use`. Its optional scope limits targets, depth and stop boundaries. Block the factory to stop this family, or its corresponding query to stop all incoming contributions to the concern. Common requests must agree before backend fulfillment; different requests do not become equal because they share a fallback. Conflicts retain backend defaults. See the [strategy guide](../guides/strategies.md) and [shared contract](../contracts/strategy.md).

Backends own concrete markup, native integration, theme and fulfillment; strategies preserve business/control state and accessibility. Invalid common values throw. The corresponding shared query is [uiRequiredAnnotationsQuery](../api/constants/uiRequiredAnnotationsQuery.md).

## Verification

Resolve yes and omission to prefix/suffix/no before rendering. Compare yes with
the explicit placement matching the current backend configuration: marker
markup, spacing and native integration must be identical. Reactive configuration
changes update resolution without replacing the editor.

Check prefix, suffix, yes and no on ordinary, checkbox and grouped fields. Vary native default placement/visibility, ensure one visible marker, and retain required semantics and editing focus.
