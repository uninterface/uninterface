# uiFieldHelp

## Purpose

Field help: Choose whether helper text remains beside a visible error or yields to that error. The field owns the helper content; this strategy only controls its relationship to failure feedback.

## API and values

Import from `@uninterface/uninterface`.

```ts
uiFieldHelp(value: 'together' | 'replace-help', options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
```

The common vocabulary is the recommended set of author-facing values:

| Value | Meaning |
|---|---|
| `together` | Keep helper text and visible errors together. |
| `replace-help` | Hide helper text while an error is displayed; restore it after correction/reset or error suppression. |

## Recommended default

The core recommends `replace-help`, focusing feedback on the error until it is resolved. A backend can choose a different ordinary policy; consult its documented default when unspecified.

Core recommendations are best-default intent values, not mandatory active declarations. Backends may choose different defaults when unspecified.

## Fallback relationships

These are alternative policies, not levels of specificity. Neither generalizes to the other. If a backend cannot express the requested relationship, it retains its ordinary supported policy. Omission also leaves that policy to the backend.

There is no show/default value: this concern describes coexistence, not general helper visibility. Replacement removes only the hidden helper’s description association and restores it afterward. Unrelated descriptions remain. An error hidden by validation-failure none must not displace the helper.

## Use and implementation responsibility

Use the declaration with `UiStrategy.use`. Its optional scope limits targets, depth and stop boundaries. Block the factory to stop this family, or its corresponding query to stop all incoming contributions to the concern. Common requests must agree before backend fulfillment; different requests do not become equal because they share a fallback. Conflicts retain backend defaults. See the [strategy guide](../guides/strategies.md) and [shared contract](../contracts/strategy.md).

Backends own concrete markup, native integration, theme and fulfillment; strategies preserve business/control state and accessibility. Invalid common values throw. The corresponding shared query is [uiFieldHelpQuery](../api/constants/uiFieldHelpQuery.md).

## Verification

Display and clear an error under both policies. Check helper/error coexistence, restoration and accessible description IDs, including when failure feedback is suppressed.
