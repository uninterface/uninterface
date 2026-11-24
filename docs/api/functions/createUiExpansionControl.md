# createUiExpansionControl

Creates a factory-created keyed expansion control. Import from `@uninterface/uninterface`.

```ts
const panels = createUiExpansionControl({
  mode: 'single',
  initialExpanded: ['delivery'],
})
```

Accepts optional [UiExpansionOptions](../types/UiExpansionOptions.md), defaults to single mode with no open keys, and returns [UiExpansionControl](../types/UiExpansionControl.md). Construction needs no mounted Vue component or backend. It creates reactive state without background watchers or a global registry. The business owner selects its lifetime and disposes it explicitly; component-local ownership may use onScopeDispose(() => panels.dispose()).

Core owns coordination; bindings project each key to a UiCollapsible, and backends own presentation. Core capability: `expansion.control.v1`. Verify initialization without views, isolated owners, disposal and binding-driven coordination. See the [panels guide](../../guides/panels.md).
