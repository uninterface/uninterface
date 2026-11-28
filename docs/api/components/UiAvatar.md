# UiAvatar

Show a person's or organization's identity in a stable square footprint. Import
from `@uninterface/uninterface`. The avatar can appear beside an identity label
or carry the name on its own.

| Prop | Default | Meaning |
| --- | --- | --- |
| `src?: string` | — | Image URL. Empty or missing input shows the fallback. |
| `size?: string` | Size strategy, then neutral | A positive length in `px` or `em`, such as `32px` or `2em`. Sets both dimensions. |
| `shape?: 'circle' \| 'square'` | `circle` | Clips the image and fallback. The theme sets corner styling for a square. |
| `fit?: 'cover' \| 'contain'` | `cover` | Cover fills the area and may crop the image. Contain fits the whole image within the square bounds before shape clipping. Both preserve aspect ratio. |
| `aria-label?: string` | — | Name for a standalone avatar. Omit it when adjacent text identifies the person or organization. |

Use the optional `#fallback` slot for passive content such as initials or
application artwork. It is centered in a full-size area while the image loads,
when the source is empty, and on failure. The backend supplies default text and
surface styling and a generic identity glyph when the slot is omitted. A branded
fallback can fill the slot area to supply its own background.

```vue
<UiAvatar :src="sender.photoUrl">
  <template #fallback>{{ senderInitials }}</template>
</UiAvatar>
<strong>{{ sender.name }}</strong>

<UiAvatar
  :src="organization.logoUrl"
  :aria-label="organization.name"
  shape="square"
  fit="contain"
  size="2em"
/>
```

The avatar follows the agreed [uiControlSize](../../strategies/uiControlSize.md)
step at the `avatar` target. With no agreed step it uses the backend's neutral
size. The recommended neutral diameter is 3.25 times the theme's default
avatar fallback text size. An explicit size takes precedence.
`em` resolves against the font size of the avatar root. The fallback content can
style its own font independently.

The accessible name and allocated footprint persist through image loading,
failure and replacement. With a name the avatar is exposed as a single image.
With no name it is decorative. Compose it with a separately named link or
button when activating the identity is part of the workflow.

When hydrating a server-rendered avatar, the client also recognizes images
that finished loading or failed before hydration.

Requires `avatar.v1`. Core owns current-image state, strategy agreement and
accessible intent. Backends own image and fallback markup, clipping and theme
mapping. Verify the fallback during loading, recovery with a changed source,
the name throughout, fit and clipping, both explicit length units, and reactive
scoped size changes.

## Choosing initials

Supply the initials or short label through `#fallback`. Prefer a label the
person has chosen, when available. For generated labels, base the rule on the
name's language or script when known. The interface language can change
independently of that information. Keep the person's full name in adjacent
text or in the avatar's `aria-label`.

- For structured English names, one common convention takes the first letter
  of the given name and surname. William Smith becomes `WS`. In JavaScript,
  use grapheme segmentation to keep a letter and its combining marks
  together. [Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)
- For locale-aware monograms from structured name fields, ICU's
  `PersonNameFormatter` implements Unicode CLDR person-name rules and is
  available in ICU4J. [ICU PersonNameFormatter](https://unicode-org.github.io/icu-docs/apidoc/released/icu4j/com/ibm/icu/text/PersonNameFormatter.html) · [CLDR person names](https://www.unicode.org/reports/tr35/tr35-personNames.html)
- For a Chinese name, one application may show the written surname, such as
  `张` for 张伟. Another may show `ZW` when using Mandarin pinyin. The JavaScript
  library `pinyin-pro` can supply first Latin letters with surname-aware
  pronunciation. Use the person's preferred romanization when known.
  [pinyin-pro](https://pinyin-pro.cn/en/use/pinyin.html)

When the available name data cannot support your rule, use a short label
from the identity record or let the avatar show its default glyph.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See
[dynamic stacking](../../guides/dynamic-z-order.md).
