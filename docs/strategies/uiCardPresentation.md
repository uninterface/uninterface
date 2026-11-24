# uiCardPresentation

## Purpose and API

Customize how the five card hierarchy levels are presented, using the same configuration on any conforming backend. This is separate from uiHierarchyLevel, which chooses the level itself. Ordinary cards need no presentation strategy.

```ts
uiCardPresentation(value: UiCardPresentation, options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
```

Import from `@uninterface/uninterface`. [UiCardPresentation](../api/types/UiCardPresentation.md) maps optional level keys to [UiCardTreatment](../api/types/UiCardTreatment.md). Available requests cover color, header, footer, density, surface, elevation, border and titleSize. Exact CSS and toolkit variants are backend responsibilities.

```ts
const accountCards = uiCardPresentation({
  [-2]: { color: 'primary', border: 'double' },
  [-1]: { color: 'primary', elevation: 'flat' },
  0: { color: 'info' },
  1: { header: 'band', color: 'secondary' },
  2: { surface: 'tinted', border: 'dashed', color: 'secondary' },
}, { scope: { targets: ['card'] } })
```

Attach with `<UiStrategy :use="accountCards">`. Named application profiles can be reused across assemblies without importing a backend. Strategy scope follows logical descendants, not DOM nesting; ordinary depth, targets, stopAt and blocking apply. Block the family to stop its declarations, or uiCardPresentationQuery to stop all incoming custom/common answers. A barrier restores the default map, not an inherited native treatment.

## Defaults

| Level | Header | Footer | Density | Surface | Elevation | Border | Title size |
|---|---|---|---|---|---|---|---|
| -2, -1 | band | normal | roomy | plain | raised | solid | large |
| 0 | band | normal | normal | plain | raised | solid | large |
| 1 | band | muted | compact | plain | flat | dashed | normal |
| 2 | band | muted | compact | tinted | flat | dashed | small |

Border pattern is a primary default hierarchy cue: ordinary/higher levels use solid outlines, and both subordinate levels use dashed outlines. Levels 1 and 2 remain distinguished by surface tint and title size. This applies with neutral or semantic colors and can be overridden per level.

All default headers retain a band, separator and full region insets. With an ordinary title and footer text, footer decoration must be no more prominent than header decoration; a backend can use equal native region treatments and stronger title typography. This is a presentation requirement, not a restriction on author-supplied footer actions/content. Custom themes and explicit plain-header profiles must be assessed as complete header/footer pairings.

Border patterns coordinate existing separators: solid/dashed/dotted repeat on visible header/footer lines, while double uses solid internal lines. Separator visibility remains independent of pattern; plain headers and omitted regions do not gain lines. Separator color/thickness and footer fill remain backend-owned. Footer typography follows the independently resolved footer treatment.

All default colors are neutral. Omitted properties retain the defaults for their own level. Core selects these portable defaults, while the backend translates their appearance. Headerless cards retain boundary, density, surface and elevation cues. Body text is never faded or reduced by level. Parent layout owns peer arrangement and spacing.

UiCard.color overrides the profile's color for that card. Explicit null requests neutral; removing the prop restores the profile color. Color never implicitly propagates to nested cards or child controls. Each nested card independently consults the applicable profile and its own level/prop.

## Agreement and fulfillment

Declarations are validated and deeply snapshotted. All eligible profiles must be equivalent after default completion. Equal values agree regardless of object identity/order; differing profiles yield no agreement and restore the full default profile. There is no partial merging or local-wins policy. Combine desired changes in one reusable map, or block an incoming profile before installing a replacement. uiHierarchyLevel is negotiated separately.

Exact -2 and -1 entries are retained, including customized differences. An application may intentionally customize levels alike, taking responsibility for the resulting loss of visual differentiation. Invalid common values throw; malformed custom query answers are ignored. The effective color must be supported by the installed theme. Backends declare strategy.card-presentation.v1 and card.color.v1 in addition to the card/hierarchy capabilities.

## Verification

Compare defaults and one shared custom profile across backends, light/dark modes and mobile/desktop widths, including headerless cards. Check all semantic colors and installed extensions, explicit neutral/role overrides and removal. Change the map while editing nested content: input identity, draft and focus must survive. Check scope, independent hierarchy blocking, profile family/query blocking, equivalent/custom/conflicting answers and independently customized upper levels. Browser evaluation must establish recognizable grouping, usable insets and legible content; structural tests cannot establish visual quality.


## Footer emphasis

Levels 1/2 default to `footer: 'muted'`: smaller, theme-muted ordinary footer text. Higher/ordinary levels default to `normal`. Both subordinate levels use the same smaller scale; level 2 does not progressively shrink text further. Footer background, separator pattern and density remain independent. No whole-region opacity is applied. Controls keep their component size rules and semantics; ordinary HTML and third-party content retain normal CSS inheritance responsibilities.

Restore ordinary footer text independently of the rest of a level:

```ts
uiCardPresentation({
  1: { footer: 'normal' },
  2: { footer: 'normal' },
})
```

Themes supply concrete text colors/sizes in both modes. Verify legibility on neutral and tinted surfaces, preserved control sizing and focus, optional footer removal, and normal/muted switching with retained content. Muting is presentation, not disabled state or reduced business significance.
