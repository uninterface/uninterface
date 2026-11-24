# Icon contract

The application catalogue, UiIcon and its vocabulary define the supported icon API. General node-scoped strategy selection and additional sizing vocabularies are not provided.

## Business concept

An icon expresses a semantic name and optional tone. An application catalogue maps that meaning to scalable artwork independently of the backend's vendor glyph names. Business compositions use names such as `save`, `warning` and `billing.invoice`; they do not select SVG paths, font codepoints or CSS colors.

The [common catalogue](../api/constants/uiIconNames.md) defines 58 required names and their meanings. Backends supply defaults; application setup can replace mappings or add namespaced extensions. Two meanings may share artwork without becoming interchangeable business concepts or sharing override identity. Prefer `create`/`delete` for resources and `add`/`remove` for membership; legacy creation uses of `add` remain supported. Recoverability does not distinguish deletion from removal. `first`/`last` mirror like `previous`/`next`; sorting directions do not. Physical `arrow-up`/`arrow-down`/`arrow-left`/`arrow-right` use shafted arrow artwork and never mirror in RTL. See the [usage guide](../guides/localization-and-icons.md#semantic-icons) for operation boundaries and independent overrides. Domain-specific symbols are extensions, not implicit mandatory vocabulary.

## Selection and tone

Resolution is semantic name plus optional tone → application catalogue → artwork and treatment. Setup overlays complete named definitions on the selected backend's defaults. This is explicit application configuration, not general strategy precedence. Catalogue definitions are immutable for that application's lifetime; another app can use different mappings.

Tone uses UiThemeColor, including declared supported extensions. Omitting tone is valid. Monochrome artwork inherits surrounding foreground; multicolor artwork retains its authored default. Omission does not imply primary or infer a color from the icon name. An `error` glyph without a tone need not be red.

Definitions can provide authored tone variants for multicolor artwork. Otherwise the backend supplies a themed foreground. Missing names, unavailable color roles and missing explicit variants fail visibly; an unrelated glyph or different semantic tone is not a fallback. Default artwork remains backend-owned.

Toolkit-internal glyphs are separate. Current catalogue overrides affect UiIcon and UiMenu/UiNavMenu entry icons, not every internal checkbox, submenu arrow or close glyph. Native public customization APIs may extend coverage in a backend, but unsupported internal replacement must not use DOM/CSS tricks. Loading state remains a backend presentation and does not require a catalogue spinner.

## Backend artwork selection

Backend authors map the common semantic names to their supported icon set. Prefer suitable existing set artwork before adapting or drawing an icon; business authors should not need vendor names or compensating styles.

1. Inspect the actual set and version, including its exports and variants. Match the meaning and appearance, not just an export's spelling. Preserve native geometry, stroke weight, proportions and authored colors when they fulfill the contract.
2. Use the existing variant when available. A small transformation such as rotating horizontal dots is appropriate when the needed variant is absent and the transformation preserves its meaning. Do not rotate or redraw an icon merely because the native variant was overlooked.
3. If the set cannot express the required meaning, supply a small backend-owned asset consistent with that set. Document the missing capability and why the chosen adaptation is appropriate. Do not substitute an unrelated symbol to claim support.

Local SVG copies and Vue wrappers still count as native-set artwork when their drawing is preserved. Static imports or bounded local assets are preferred; do not introduce full-set bundles or runtime icon downloads. Record the upstream glyph, source/version and license, and identify transformations and original artwork separately. A difference in SVG command formatting or precision alone does not establish that an icon was unavailable or intentionally redesigned; investigate its provenance before making that claim.

SVG files can supply catalogue components and authored variants through core's optional [SVG loader](../api/functions/createUiIconLoader.md). Build-time loading compiles the asset to inline client/server Vue rendering; backend markup, theme and accessibility responsibilities remain the same. Assets remain application/backend-owned, static and noninteractive. No image URL, runtime compiler or SVG fetch is required. See the [SVG usage guide](../guides/localization-and-icons.md#svg-files) for setup, source obligations and observable checks.

Implementation documentation:

Concrete glyph names, sources, transformations and missing-artwork adaptations belong in each backend’s icon documentation. A shared file glyph may serve a generic menu-item fallback while retaining independent semantic override keys; icon-rail fallback applies only when an entry omits its icon.

Applications may override complete named definitions, including two names that share a component, independently. Supply accessible action labels; a fallback page glyph cannot identify different destinations by itself. Retain square occupancy, proportional scaling, omitted/explicit tone handling and declared RTL behavior without extra focus targets or tooltips.

Acceptance: every required name resolves; inspect glyph meaning against the recorded source, preserve independent overrides, and verify small-size legibility, alignment and light/dark visibility. Check logical RTL mirroring separately from authored orientation. Record automated source/DOM evidence separately from browser visual acceptance. Backend documentation must disclose every transformed or locally drawn mapping and its reason.

## Space and accessibility

UiIcon occupies a square, with a default side length of `1em` and an optional explicit [size](../api/components/UiIcon.md). Artwork fits proportionally within that box. A parent controls allocation, alignment and sibling spacing. An enclosing button accommodates the icon box while keeping its own target dimensions and interaction presentation.

Decorative icons are hidden from assistive technology. A meaningful standalone icon needs a localized aria-label; an icon-only action needs its accessible name on the action. A key is not an accessible label. Tone alone must not be the only indication of important status. Icons do not create an action, focus target or tooltip.

Logical directional definitions may mirror with writing direction; previous/next do so by default. Physical direction and unrelated artwork must not mirror automatically. Light/dark suitability follows theme/artwork support; full color-mode coordination is a separate capability.

## Ownership

| Owner | Responsibility |
| --- | --- |
| Business composition | Semantic name, optional tone and information/action meaning. |
| Application setup | Named replacements/extensions and any custom asset definitions. |
| Backend catalogue | Meaning-equivalent defaults, scalable artwork and asset licenses. |
| Backend icon view | Themed foreground and icon surface. |
| Core UiIcon | Resolution, explicit support checks, variants, accessibility and logical mirroring. |
| Parent presentation | Allocation, alignment and spacing. |

Catalogue assembly must avoid importing entire icon libraries. The current setup intentionally includes a bounded 58-name subset; this is not a claim of individual-icon tree shaking from a string-indexed map. Ordinary component-only imports remain separate from setup. Assets are local and do not need an external service.

## Verification and references

Each backend must render all required names, honor overrides, preserve square occupancy/proportions, support omitted and explicit tones, and correctly distinguish meaningful/decorative icons. App-specific replacements must not leak to another app. Unknown required names/tones must produce errors. Check native internal coverage separately and verify directional behavior rather than mirroring all SVGs.

See [UiIcon](../api/components/UiIcon.md), [UiIconDefinition](../api/types/UiIconDefinition.md), [uiIconNames](../api/constants/uiIconNames.md), and [application localization and icons](../guides/localization-and-icons.md).
