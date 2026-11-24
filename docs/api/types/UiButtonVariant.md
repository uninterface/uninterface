# UiButtonVariant

Button presentation, independent of semantic color. Import with `import type { UiButtonVariant } from '@uninterface/uninterface'`.

```ts
type UiButtonVariant = 'filled' | 'outline' | 'neutral' | 'soft' | 'text' | 'icon'
```

| Value | Meaning |
|---|---|
| `filled` | A filled surface defines the button area. |
| `outline` | A visible outline defines the boundary, with a subdued interior. |
| `neutral` | Neutral text, boundary and surface at rest; semantic color appears in hover/focus/pressed feedback. Native geometry and interaction treatment remain backend-owned; tint strength or fill can differ. |
| `soft` | A subdued tinted surface communicates the color role. |
| `text` | Text/icon content without a persistent filled surface or outlined boundary; interaction feedback remains visible. |
| `icon` | Show the icon slot and visually hide the text while retaining its accessible name and hint. The backend chooses a suitable icon-button treatment and geometry. |

`icon` describes content presentation rather than a particular fill. It does not imply circle, text treatment, or a particular outline; those details belong to the backend. Supply both a meaningful default-slot label and the `icon` slot. Without an icon slot, the button retains visible text with the text treatment, preventing an empty action. Content slots must not contain nested interactive controls.

All six variants support every declared [UiThemeColor](UiThemeColor.md). Exact colors, opacity, borders, interaction effects and dimensions belong to the backend/theme. No variant expresses persistent pressed state, navigation, authorization, action importance or a different invocation behavior.

An explicit variant takes precedence over [uiButtonVariant](../../strategies/uiButtonVariant.md). Without either, a composition may supply a contextual default (text for ordinary UiNotice actions); otherwise the backend chooses its default; the core recommendation is filled. The supporting adapters ordinarily use filled, subject to supported native application configuration. Removing an explicit variant restores the applicable strategy, contextual default, or backend default in that order. Unknown public values throw.

See [UiButton](../components/UiButton.md) for slots, hints, capabilities and acceptance.
