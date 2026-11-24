# UiCollapsibleBinding

A producer-independent, read-only connection to UiCollapsible. Import from `@uninterface/uninterface`.

```ts
interface UiCollapsibleBinding {
  readonly target: 'collapsible'
  readonly expanded: boolean
  readonly disabled: boolean
  readonly requestExpanded: (expanded: boolean) => void
}
```

Use reactive getters or a reactive object. The component reads live state rather than copying it. requestExpanded is synchronous request delivery; the producer may accept or decline by changing or retaining expanded. Async business work may later update state, but this interface does not expose pending state or await a decision. Do not supply v-model or an update:modelValue listener alongside a binding. Local disabled can tighten availability; it cannot override a binding restriction.

The component does not inspect the producer's concrete control or own its lifetime. Backends receive normalized state and callbacks, never this business binding. The expansion control produces stable frozen bindings, disabled and collapsed after disposal. Other producers can implement the same contract without creating an expansion control. Capability: core `collapsible.binding.v1`.

Verify a custom producer, denied requests, reactive changes, local/binding disabled combinations and disposal. See [UiCollapsible](../components/UiCollapsible.md) and [UiExpansionControl](UiExpansionControl.md).
