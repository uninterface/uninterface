# UiStrategy

A renderless logical attachment boundary for presentation strategies. Import from `@uninterface/uninterface`. No backend view or stylesheet is needed for the boundary itself.

```vue
<UiStrategy :block="uiControlSizeQuery" :use="uiControlSize(0)">
  <RecordEditor />
  <UiButton>Save</UiButton>
</UiStrategy>
```

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `use` | `UiStrategyDeclaration` or readonly array | Omitted | Local declarations |
| `block` | `UiStrategyBlock` or readonly array | Omitted | Incoming family/query propagation barriers |

The default slot can have multiple roots. There are no public emitted events, exposed methods, DOM root or forwarded root attributes. Both props may be omitted; empty arrays add nothing. It requires core `strategy.scope.v1`. Blocking affects incoming contributions only, including at the attachment node; local and descendant declarations remain eligible. Array order gives no priority.

Per-declaration scope limits belong to factory arguments. See the [strategy contract](../../contracts/strategy.md) for identities, depth, target roles, stopping, support filtering, agreement and defaults. Use and block react reactively without remounting children. Native wrappers are transparent; Teleport retains logical ancestry. Backends fulfill presentation intent according to the shared [principle](../../contracts/strategy.md#strategy-intent-and-backend-fulfillment); invalid declarations and unexpected implementation errors propagate. Strategies do not alter field values or business rules.

Core provides scope transport and barriers. Backends/custom participants query only supported concerns and implement resulting decisions; arbitrary third-party content does not receive effects automatically. Verify no added element, sibling isolation, reactive instance/draft/focus retention, transparent wrappers, Teleport, incoming blocking and local reintroduction.

See the [usage guide](../../guides/strategies.md) for common/custom authoring examples.

## Stacking

`zOrder?: UiZOrder` describes outward stacking. Its renderless scope projects onto its rendered roots without adding a layout wrapper. See [dynamic stacking](../../guides/dynamic-z-order.md) for scope, lifetime, pending refs and observable overlap checks. Core owns order; the backend owns rendering targets.
