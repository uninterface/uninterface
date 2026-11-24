# UiTabsBinding

Import from `@uninterface/uninterface`.

Producer-independent contract consumed by UiTabs:

```ts
interface UiTabsBinding {
  readonly target: 'tabs'
  readonly id: string
  readonly selectedKey: string
  readonly disabled: boolean
  readonly requestSelected: (key: string) => void
}
```

The stable id is document-unique, with the same value during SSR/hydration. Reactive selectedKey owns display; disabled blocks user requests. requestSelected is a request, not an acceptance signal: the producer may decline or decide asynchronously by retaining selectedKey. Producers own cancellation/stale-decision policy for asynchronous decisions. One stable binding identity associates one bar with its panels. Changing binding identity requires a keyed remount. No factory inspection is required. Verify a denied request leaves both actual native selected styling and panel visibility unchanged.

See [createUiTabsControl](../functions/createUiTabsControl.md) and the [panels guide](../../guides/panels.md).
