# uiButtonVariant

## Purpose

Apply a button presentation preference to a logical region without repeating component props. It changes neither action behavior nor business state.

## API and values

Import from `@uninterface/uninterface`.

```ts
uiButtonVariant(value: UiButtonVariant, options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
```

The recommended vocabulary is [UiButtonVariant](../api/types/UiButtonVariant.md): `filled` (filled surface), `outline` (outlined boundary), `neutral` (neutral resting surface with semantic interaction feedback), `soft` (subdued tinted surface), `text` (content without persistent fill/boundary), and `icon` (visually hide the label and show the icon). Icon presentation retains the text for accessible naming and a hint; supply an icon slot and meaningful label on each intended button.

```vue
<UiStrategy :use="uiButtonVariant('soft')">
  <UiButton>Preview</UiButton>
  <UiButton variant="filled">Save</UiButton>
</UiStrategy>
```

## Recommended default

The core recommendation is `filled`. Omission allows a composition-specific default before the backend default. Ordinary buttons directly supplied in UiNotice actions default to text; an agreed strategy or explicit variant takes precedence. Outside such a context the backend chooses its default. No declaration is automatically installed. An explicit UiButton.variant takes precedence over this regional preference; this is the button concern's rule, not a universal strategy precedence rule.

## Fallback relationships

A backend that cannot fulfill a treatment may leave that preference unanswered and use its own default. An icon request without an icon slot retains visible text using the text treatment. An icon request must never produce an unnamed or empty button. Icon geometry and fill are backend-owned, so icon does not generalize to a prescribed fill style.

Agreement compares requested values before any backend translation. Conflicting requests leave the contextual default (if supplied), otherwise the backend default in place; declaration order does not resolve conflict. Scope filtering or blocking may leave another applicable declaration. Removing an explicit variant restores the applicable regional preference, then the contextual default (if supplied), otherwise the backend default if unanswered.

## Use and implementation responsibility

Only button nodes consume this query. Standard per-declaration targets, depth and stop boundaries apply. Block uiButtonVariant to stop that family, or [uiButtonVariantQuery](../api/constants/uiButtonVariantQuery.md) to stop all incoming answers to the concern, including custom families. See the [strategy guide](../guides/strategies.md).

Backends query uiButtonVariantQuery and combine the agreed answer with the explicit binding variant. The shared backend helper useUiButtonPresentation implements this policy without prescribing DOM. Backends own native treatments, icon placement and geometry, hidden-label markup and activity presentation. Declare `strategy.button-variant.v1` for integration and `button.variant.v1` for all six treatments. Invalid common values throw.

## Verification

Check all values, omitted defaults, explicit prop precedence and removal, equal/conflicting declarations, family/query blocking and custom answers. Reactive changes preserve the button and focus. Icon text remains accessible and the native hint follows localized label changes. Loading/disabled guards and native submit/reset routes remain effective. Browser checks are needed for appearance, focus visibility and hint behavior.
