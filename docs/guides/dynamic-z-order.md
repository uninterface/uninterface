# Dynamic stacking relationships

Uninterface owns stacking relationships and derives CSS values. Ordinary attached choices, menus and hints belong above content in their owning surface; new modal sessions dominate earlier surfaces. Business authors only declare additional relationships where the composition needs them. See the [contract](../contracts/dynamic-z-order.md) for encoding and lifecycle details.

## Order allocations

```vue
<UiRegionLayout :z-parts="{ start: { above: ['main'] } }">
  <template #start>Header</template>
  <template #main>Content</template>
</UiRegionLayout>
```

`UiLayout`, `UiFlowLayout` and `UiGridLayout` address participating allocations by zero-based source-order indices. Use `{ 0: { above: [1] } }` when position is intentional. Use `[{ part: firstRef, order: { above: [secondRef] } }]` when the same keyed child should remain above the other after reordering. Pass registered component refs or explicit handles; don't inspect `$el`. Empty refs remain pending. Unknown names, invalid indices, duplicate aliases and live outside-layout refs fail explicitly.

A part orders its allocation wrapper. Its child's `zOrder` describes a separate participant inside that allocation. Raising a child cannot raise the allocation. Columns, wrapping, scrolling and RTL do not change numeric addressing. `v-show` keeps identity; unmount removes it.

## Order components and compositions

Every public component accepts `zOrder`. Use either `{ position: 2 }` or `{ above: [peerRef], below: [anotherRef] }`. Positions express relative order among explicitly positioned peers, not CSS numbers or reserved slots. Comparisons require the same band and ordering parent. Order the intended ancestors explicitly instead of expecting a child request to promote them.

Reusable components can consume a `zOrder` prop and call `useUiZOrder(() => props.zOrder)` in setup. The composable registers their outward identity and attaches their rendered roots without adding a wrapper. Forwarding a declaration to a chosen inner public component is also valid if the reusable component documents that boundary. Don't both register and independently forward the same declaration. Opaque third-party descendants retain their ownership.

```ts
const stacking = useUiZOrder(() => props.zOrder)
defineExpose({ stackingHandle: stacking.handle })
```

Consumers may pass the explicit `stackingHandle` in relationships. The returned `resolved` and `snapshot` are readonly diagnostics, including paths, widths, value and version. `describe()` also identifies physical targets. Do not write the derived number back into author declarations.

## Layers and special integration

The built-in order is Background < Content < Floating inside each Surface. A modal gives directly owned tooltips and its header and footer internal positions between Content and Floating. The header and footer paint above those tooltips. Interactive popups use Floating or the ordering scope of their enclosing popup. Setup may add a named layer.

```ts
createUiApplication(App, {
  zLayers: { annotations: { above: ['content'], below: ['floating'] } },
})
```

Use `zOrder: { layer: 'annotations' }` to attach within that layer. Extensions cannot reverse the built-in order. Plugins may register application-lifetime names through `useUiStacking().registerLayer` in setup. Register once per application; duplicate names are errors.

`useUiStacking().resolve(ref)` resolves registered identity; `fromElement(element)` finds an existing physical registration through ancestors. Element lookup is for special integration, not automatic business-parent discovery. A teleport does not change logical attachment. Native/third-party compositions join with explicit composable handles and backend target registration. Unregistered outside overlays are outside the managed guarantee.

## Ownership and observable checks

Core owns graph validation, shared packing and transactions. Backends register actual positioning wrappers, consume core values and retain native appearance, focus, dismissal and exit motion. Geometry and clipping remain separate concerns; ordering doesn't create overlap or remove clipping. Authors must preserve supported host boundaries when adding application CSS.

Invalid updates retain valid ordering and report `UiZOrderError`; actual removals still release their subtree. Visible exit motion retains registrations until dismissal finishes. Reopening creates a new modal-session identity. KeepAlive retains ordinary components while overlays close on deactivation. SSR preserves ordinary output and activates registrations on the client; reference-dependent pre-hydration order and server-rendered open overlays are not promised.

Verify overlapping content by clicking the visible intersection before and after scrolling, keyed moves and allocation growth. Confirm focus, keyboard use, native modality and dismissal remain unchanged. Exercise popup intersections and engine-specific behavior on the selected backend. Logical order and DOM wiring alone do not establish painted order or browser interaction.
