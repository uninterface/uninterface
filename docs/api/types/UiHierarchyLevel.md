# UiHierarchyLevel

Import this type from `@uninterface/uninterface`.

```ts
type UiHierarchyLevel = -2 | -1 | 0 | 1 | 2
```

| Value | Business meaning |
|---|---|
| `-2` | Higher grouping, two levels above ordinary |
| `-1` | Higher grouping, one level above ordinary |
| `0` | Ordinary unit and default |
| `1` | Subordinate grouping |
| `2` | Further subordinate grouping |

Use with [UiCard.level](../components/UiCard.md) or [uiHierarchyLevel](../../strategies/uiHierarchyLevel.md). Levels express hierarchy presentation, independently of size, semantic heading rank, color and stacking. They are not offsets automatically added to a parent's level.

Backends own exact presentation and may render -2 using -1. Other levels remain differentiated; text remains readable and groups visibly bounded. Original requests stay distinct during strategy agreement. Verify default zero, invalid runtime input, all requested levels and state preservation during changes. See the component and strategy references for ownership and supported examples.
