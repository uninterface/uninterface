# UiImagePreview

Show only an image within its allocated bounds. Import from `@uninterface/uninterface`. There is no border, rounding, avatar treatment, filename, caption, metadata, action or click-to-open behavior. The parent may clip it when needed.

## API

| Prop | Default | Meaning |
|---|---|---|
| `file: UiFileDescriptor` | Required | Source descriptor; previewUrl, contentUrl, then a locally owned Blob URL |
| `alt?: string` | File name | Accessible alternative text, never an additional visible caption |
| `fit?: 'contain' \| 'stretch'` | `contain` | Contain centers the whole image without cropping/distortion; stretch fills both dimensions and permits distortion |
| `width?: number \| string` | Container allocation | Explicit width; numbers are nonnegative finite CSS pixels, strings are CSS lengths/percentages or auto |
| `height?: number \| string` | Container allocation | Explicit height with the same value rules |

No public slots, events or exposed handles.

```vue
<!-- Parent supplies a definite allocation. -->
<UiImagePreview :file="photo" alt="Delivery entrance" />
<!-- Explicit bounds. -->
<UiImagePreview :file="photo" :width="240" :height="160" />
<UiImagePreview :file="photo" :width="240" :height="160" fit="stretch" />
<!-- One dimension: derive the other from the loaded image's aspect ratio. -->
<UiImagePreview :file="photo" :width="240" />
<!-- Intrinsic dimensions, constrained by the containing block. -->
<UiImagePreview :file="photo" width="auto" height="auto" />
```

For a preview beside a form input, [UiPreviewRegion](UiPreviewRegion.md) supplies a visibly framed, read-only control surface inside UiField. UiField owns its label and feedback; the image itself remains borderless.

With neither dimension specified, the view uses its containing block's available width/height. Percentage height requires a definite containing height; a content-height ancestor does not create one. Unbounded auto dimensions follow intrinsic image sizing. Explicitly supplying only one dimension leaves the other auto and uses the loaded natural aspect ratio. The image stays within the containing bounds. When both bounds exist, contain leaves unused space transparent; stretch fills the entire rectangle. For SVG sources, the SVG’s own viewBox/preserveAspectRatio policy also controls its internal artwork. An SVG intended to visibly distort in stretch mode should use preserveAspectRatio="none"; contain still fits its intrinsic ratio. The component does not rewrite source SVG documents.

Before image metadata is available, an unconstrained dimension cannot promise the eventual natural size. Supply both dimensions or a definite parent allocation when stable geometry is required. Failure retains those supplied bounds and presents a small broken-image glyph centered inside them. Without known dimensions, the glyph provides a minimal intrinsic fallback. There is no visible failure prose, filename or retry button. Accessible alternative text remains available.

## Ownership and implementation

Core resolves the descriptor URL and revokes only object URLs created by this mounted preview. The backend owns image/fallback markup, sizing and fitting. Source changes discard old loading/failure state; late events from an earlier source cannot replace current content. Switching fit does not reload the image. Uses `image.preview.v1` and the dedicated UiImagePreviewViewProps backend binding.

Backends use native images or compatible image components, adapting loading surfaces, clipping and transitions to the image-only contract. A contained, accessible broken-image glyph replaces failed content without a decorative frame. Concrete fit and error mappings belong in backend documentation.

UiFilePreview's image branch delegates to this view and therefore also shows only the image. Use UiFilePreview's Tile/Row summaries and optional thumbnail mode when filename and size should accompany an image. Collection workflow/presentation design is a separate concern. See the [file guide](../../guides/files.md).

## Observable verification

DOM tests cover image-only content, contain/stretch mapping, supplied dimensions, one-dimension aspect ratio, missing/failed source fallback, replacement/stale events and accessible names across supporting backends. Existing file/upload tests cover URL cleanup and association locks. Browser scenarios cover portrait/landscape, explicit/container/intrinsic bounds and stable bounded failure. Visual review and automated geometry/profile coverage are recorded separately; these scenarios require real-browser execution to establish measured geometry.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
