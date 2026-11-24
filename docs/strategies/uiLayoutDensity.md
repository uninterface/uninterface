# uiLayoutDensity

## Purpose

Request closer or wider separation between related layout items without choosing CSS gaps or changing their data/control ownership. Implemented for UiLayout, UiFlowLayout and UiGridLayout. See [layout density](../guides/layout-density.md) for an independent-checkbox example.

## API and values

Import from `@uninterface/uninterface`.

```ts
uiLayoutDensity(value: UiLayoutDensity, options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
```

| Value | Meaning |
|---|---|
| `-1` | More compact peer spacing |
| `0` | Backend default peer spacing |
| `1` | More spacious peer spacing |

The initial supported scale is `-1 | 0 | 1`. Other numbers, fractions, nonfinite values and strings throw. Levels are ordinal, not pixels, multipliers or additive offsets. Negative means more compact and positive means more spacious; additional levels are not currently supported.

## Recommended default

Omit the strategy for ordinary use. Zero explicitly requests the same spacing as the backend default. No application-level density choice is required.

## Fallback relationships

Optional backend level mappings declare support; unsupported answers are ignored. No answer or disagreement retains the backend default. Zero always selects the backend's ordinary peer-spacing descriptor. Requests do not add together, and a local zero does not override an inherited negative request: block the incoming query when resetting it.

## Use and implementation responsibility

Apply through UiStrategy.use. Layout targets are `layout` (including UiFlowLayout's logical layout) and `grid-layout`. Target, depth and stopAt scopes and family/query barriers follow the [strategy guide](../guides/strategies.md). Supported answers require unanimity before rendering. [uiLayoutDensityQuery](../api/constants/uiLayoutDensityQuery.md) allows custom contributors and query barriers.

Core owns scope and agreement. Backends own actual spacing through their static layout presentation module. Density changes peer separation, including documented backend removal of surplus row whitespace around direct control items. It does not scale control surfaces/hit targets, fonts, content/frame insets or adjoining UiRegionLayout allocations. Nested participating layouts inherit within the declared limits; there is no inherited CSS gap that bypasses a barrier. Forms, choice groups, lists and tables do not directly consume this strategy in this implementation.

## Verification

Change levels and remove the declaration; check default restoration, retained child identity/draft/focus, target/depth/stopAt boundaries, query resets and conflicting requests. Confirm grid gaps change on both axes and region allocations remain adjoining. The shared DOM regression runs against each backend; real-browser spacing, wrapping and focus geometry remain separate acceptance checks.
