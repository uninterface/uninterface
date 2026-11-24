# UiCardTreatment

Import from `@uninterface/uninterface`. Portable presentation requests for one hierarchy level, used in [UiCardPresentation](UiCardPresentation.md). Every property is optional; omission retains that level's default. These are strategy-authoring choices, not required per-card settings.

| Property | Values | Meaning |
|---|---|---|
| color | UiThemeColor or null | Default semantic color role; null requests neutral |
| header | band, plain | Themed separated header region, or an integrated header without a separator |
| footer | normal, muted | Normal native footer text, or theme-muted text with smaller typography; neither hides the footer nor changes its separator/background |
| density | roomy, normal, compact | Card-owned interior insets; does not resize child controls or their spacing |
| surface | plain, tinted | Ordinary surface, or subtle tint using the effective color/neutral boundary tone |
| elevation | flat, raised | No shadow, or backend-owned raised-surface shadow |
| border | solid, dashed, dotted, double | Enclosing boundary and visible internal separator pattern; double uses solid internal separators |
| titleSize | large, normal, small | Relative title typography, independent of heading rank and body typography |

Backends own dimensions, palette tones, exact typography and native integration. The border option coordinates the outer enclosure and existing header/footer separators: solid, dashed and dotted apply to both; double is confined to the outer enclosure and uses solid internal separators. Double enclosure includes sufficient width to show both lines. Pattern does not create a separator or reveal an omitted region. A plain header still has no separator. Separator colors/thicknesses and footer backgrounds remain native or backend-owned; the explicit footer treatment controls text emphasis; they need not match the outer color or thickness. Density still applies to footer content insets. Color applies to the boundary and requested tinted body surfaces, with ordinary foreground text. Band headers use a role tint or a coordinated native cap background; their decoration must be at least as prominent as ordinary footer decoration. It does not recolor child controls or imply interaction/status. Color omission uses the level default, currently neutral; unsupported installed theme roles fail when consumed. Actual rendering depends on the backend/theme, while these qualitative requests have the same meaning across backends.

Title size affects the explicit title slot, including a direct heading supplied there. An arbitrary header slot retains its content's own typography. Header treatment is inert when there is no header/title/description content. Density, border, elevation and surface continue to apply to headerless cards.

Verify every requested treatment in light/dark mode, long titles and narrow layouts. Changes must retain mounted descendants and focus. Do not use style differences alone as evidence that users can understand hierarchy.


`footer: 'muted'` requests quieter ordinary text, using backend theme foreground and small-text values. It never applies whole-region opacity, changes child control-size strategies, hides actions, or alters separator patterns. `normal` restores the normal footer foreground and typography. Control text scaling must remain independent so inputs/buttons do not shrink with footer text. Nested cards reset their body typography to their backend baseline. Native HTML and third-party content that intentionally inherits surrounding typography follows normal CSS inheritance; explicitly styled content retains its own presentation. A rich footer is not automatically a caption or a disabled region.
