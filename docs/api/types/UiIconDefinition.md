# UiIconDefinition

Import from `@uninterface/uninterface/icons`.

SVG files are supported through core's optional [createUiIconLoader](../functions/createUiIconLoader.md): import `./icon.svg?ui-icon` and use the result in `component` or `tones`. The loader compiles the asset to an inline Vue component, preserving the same catalogue and backend contract without requiring a Vue wrapper file. A normal SVG URL is not a component.

`{ component: Component; mirrorInRtl?: boolean; tones?: Readonly<Partial<Record<UiThemeColor, Component>>> }` maps semantic identity to scalable artwork. `component` is the default/untinted artwork; optional `tones` selects authored variants for explicit tones, rejecting missing variants. Without a variants map, the backend supplies the requested themed foreground. Multicolor artwork can retain authored colors.

Default mirroring is false. Mark logical directional artwork only; physical directions and ordinary symbols must not flip. Artwork is noninteractive, fits proportionally inside a square, and inherits the enclosing accessibility policy. SVG authors should use viewBox/preserveAspectRatio and avoid fixed external dimensions or embedded focusable actions.

Verification: single override affects both UiIcon and entry rendering; RTL mirrors only marked definitions; omitted tone selects default artwork.
