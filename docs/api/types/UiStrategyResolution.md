# UiStrategyResolution

Import type from `@uninterface/uninterface`.

```ts
type UiStrategyResolution<T> =
  | { readonly status: 'answered'; readonly value: T; readonly contributors: readonly string[] }
  | { readonly status: 'unanswered'; readonly reason: 'no-answer' | 'no-agreement'; readonly contributors: readonly string[] }
```

Reactive query result payload. No-answer means no applicable supported contributions. No-agreement means eligible contributions did not agree. Contributor names are diagnostic, can repeat and are not identity or priority. Unanswered retains supported ordinary presentation.

See the [strategy contract](../../contracts/strategy.md) for ownership, support fallback, scope, agreement and observable acceptance. The [usage guide](../../guides/strategies.md) shows common/custom declarations. Implementations must preserve typed identities, control state and accessibility; a supported type vocabulary does not imply every backend implements every value. Verify this type through the corresponding factory/query, scope and blocking scenarios rather than assuming toolkit behavior.
