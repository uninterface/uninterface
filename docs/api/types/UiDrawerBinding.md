# UiDrawerBinding

Producer-independent read-only panel expansion binding: `{ target: 'drawer'; expanded: boolean; disabled: boolean; requestExpanded(expanded: boolean): void }`. Use reactive getters/state. Import from @uninterface/uninterface.

UiDrawer mode=panel or mode=docked reads live observations and delivers requests; the producer accepts/declines by changing/retaining state. Combine neither v-model:expanded nor its update listener with a binding. Local disabled can only tighten user availability; programmatic producer changes remain effective. createUiExpansionControl supplies stable bindings.drawer(key). Its disposed bindings become disabled/collapsed/inert to requests. This synchronous projection has no modal run, async pending-close protocol or dirty inference. Verify custom producers, denial, stable identity and disposal.

See [drawers and popovers](../../guides/drawers-and-popovers.md) for composition, ownership and evidence limits.
