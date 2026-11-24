# uiHierarchyLevel

## Purpose

Apply a hierarchy presentation preference to a logical region without repeating component levels. UiCard currently consumes this concern; other components do not acquire hierarchy behavior merely by being descendants.

## API and values

Import from `@uninterface/uninterface`.

```ts
uiHierarchyLevel(value: UiHierarchyLevel, options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
```

[UiHierarchyLevel](../api/types/UiHierarchyLevel.md) accepts -2, -1, 0, 1 and 2. Negative values request broader/higher grouping; positive values request subordinate grouping. All matching cards receive the requested level; no automatic increment or arithmetic inheritance occurs.

```vue
<UiStrategy :use="uiHierarchyLevel(1, { scope: { targets: ['card'] } })">
  <UiCard>Delivery details</UiCard>
  <UiCard :level="0">Ordinary summary</UiCard>
  <UiStrategy :block="uiHierarchyLevelQuery">
    <UiCard>Ordinary presentation</UiCard>
  </UiStrategy>
</UiStrategy>
```

## Recommended default

Zero is ordinary hierarchy. UiCard uses zero when neither a prop nor an agreed regional preference supplies a level. No strategy declaration is automatically installed. Exact zero appearance remains backend/theme-owned. An explicit card level overrides the regional preference for that card only; this concern-specific rule does not establish universal strategy precedence.

## Fallback relationships

The only permitted collapse is `-2 → -1`. The default card presentation shares its higher treatment for these two requests. A [uiCardPresentation](uiCardPresentation.md) map can customize them independently; adapters must preserve explicit differences. Default levels 0, 1 and 2 must remain differentiated from that treatment and each other; lower levels do not suppress grouping or dim the entire content.

Common answers require unanimity before translation. Requests -2 and -1 disagree even if rendered alike. On disagreement/no answer UiCard uses zero. There is no local-wins, declaration-order or nearest-node rule among strategies. Remove an explicit level to restore the regional answer, then zero if unanswered.

## Use and implementation responsibility

Apply through UiStrategy.use; standard targets, depth and stopAt scopes apply. Card is a logical node and consumes one depth. Block the uiHierarchyLevel family or [uiHierarchyLevelQuery](../api/constants/uiHierarchyLevelQuery.md) for all incoming answers including custom families. Native presentation must not leak through these barriers.

Core resolves the typed query at the card node and passes the requested level to its backend view. Backends declare `card.v1` and `strategy.hierarchy-level.v1`, provide the actual treatments and preserve arbitrary content, meaning, editing state and focus. Invalid common values throw. See the [card guide](../guides/cards.md) and [strategy guide](../guides/strategies.md).

## Verification

Check every value, scope limits and barriers, reactive updates, omitted defaults, explicit override/removal and equal/conflicting custom declarations. Test -2/-1 disagreement before adaptation. Compare rendered treatment and preserved content in a browser in light/dark mode and at narrow/wide widths.
