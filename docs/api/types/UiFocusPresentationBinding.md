# UiFocusPresentationBinding

Import this type from `@uninterface/uninterface`, or from `@uninterface/uninterface/backend` when implementing a backend. It describes presentation applied to an existing focus target.

```ts
interface UiFocusPresentationBinding {
  readonly class: string
}
```

Obtain it through [useUiFocusPresentation](../functions/useUiFocusPresentation.md) and apply the complete object using Vue `v-bind`. The class is opaque backend-owned presentation, not a public styling-class name to select or reconstruct. Vue merges it with other classes on the same element.

It carries no focusability, roles, ARIA state, listeners, availability or lifetime. The consumer supplies these when appropriate. The selected backend exports a stable immutable binding from `./focus` and supplies its CSS. No exact outline, color, radius or dimensions are promised by this interface. A custom component receiving the binding must forward it to the actual focus target.

Verify that the binding does not alter native semantics or tab order, that keyboard focus is visible, that child controls retain their own treatment, and that theme modes and forced-colors work. See the [focus-presentation guide](../../guides/focus-presentation.md) for ownership, supported examples and limitations.
