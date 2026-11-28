# uiControlSize

## Purpose

Request a smaller, ordinary or larger footprint across a region. Participating fields coordinate their labels, annotations and feedback with editors. Buttons and [UiAvatar](../api/components/UiAvatar.md) also participate. This strategy concerns component size. Layout width and peer spacing have their own policies.

## API and values

Import from `@uninterface/uninterface`.

```ts
uiControlSize(value: UiControlSize, options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
```

The common vocabulary is the recommended set of author-facing values:

| Value | Meaning |
|---|---|
| `-2` | Extra small request. |
| `-1` | Small request. |
| `0` | Ordinary control size. |
| `1` | Large request. |
| `2` | Extra large request. |

## Recommended default

Use `0` for ordinary sizing. The recommended scales are `-1 / 0 / 1` and `-2 / -1 / 0 / 1 / 2`.

Core recommendations are best-default intent values, not mandatory active declarations. Backends may choose different defaults when unspecified.

## Fallback relationships

Requests generalize toward zero when a level is unavailable: `-2 → -1 → 0` and `2 → 1 → 0`. Zero uses the backend’s ordinary supported level. A three-level backend therefore maps -2/-1 to small and 1/2 to large. Levels are ordinal, neither multipliers nor additive offsets. Native density can change footprint without scaling typography; actual mappings are documented by each backend, under the [support and fallback contract](../contracts/strategy.md#common-vocabulary-and-support).

Omission retains the component's configured default, which can differ from an explicit ordinary-size request. UiAvatar uses its neutral size when there is no agreed request and honors its explicit `size` first. Native size context must not bypass targets, depth or query barriers.

## Use and implementation responsibility

Use the declaration with `UiStrategy.use`. Its optional scope limits targets, depth and stop boundaries. Block the factory to stop this family, or its corresponding query to stop all incoming contributions to the concern. Common requests must agree before backend fulfillment; different requests do not become equal because they share a fallback. Conflicts retain backend defaults. See the [strategy guide](../guides/strategies.md) and [shared contract](../contracts/strategy.md).

Backends own concrete markup, native integration, theme and fulfillment; strategies preserve business/control state and accessibility. Invalid common values throw. The corresponding shared query is [uiControlSizeQuery](../api/constants/uiControlSizeQuery.md).

## Verification

Switch between supported levels and remove the declaration. Check coordinated field/editor sizing, native defaults, barriers and preserved drafts/focus; use a browser for geometry.
