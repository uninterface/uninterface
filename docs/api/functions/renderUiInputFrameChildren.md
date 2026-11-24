# renderUiInputFrameChildren

Discovers and admits the selected next level of a cooperating component's children. Import from `@uninterface/uninterface`; call during render or slot rendering.

```ts
renderUiInputFrameChildren(children: readonly VNode[], participation: UiInputFrameParticipation): VNode[]
```

The handle must come from useUiInputFrameParticipant on a component declaring forwards:true. Otherwise the helper throws. Each supported component receives a renderless admission boundary. Original component VNodes retain attrs, keys and refs; no DOM wrapper or eager component registry is introduced. Passive native wrappers/fragments are inspected until the next component boundary. A declaration/version violation fails before that child mounts.

Forwarding shares the same field owner and propagates tightened restrictions; it does not grant arbitrary descendants access. Only content passed through this helper participates. The core frame uses this same discovery implementation. Custom authors select which internal children or slots to forward. Native controls, unknown components and direct unsupported Vue wrappers remain errors.

Verify preserved refs/keyed identity, conditional participants, dynamic content, SSR identity, nested unaware wrappers and absence of value/surface leakage. The helper handles admission; extension/backends still implement actual editor/action behavior.

See [shared input frames](../../guides/input-frames.md) for supported compositions and complete examples.
