# UiNavigationDrawerOptions

Optional coordination policy for [createUiNavigationDrawerControl](../functions/createUiNavigationDrawerControl.md). Import from `@uninterface/uninterface` using `import type`.

```ts
interface UiNavigationDrawerOptions {
  afterNavigate?(
    key: string,
    context: { signal: AbortSignal },
  ): void | Promise<void>
}
```

`afterNavigate` runs after successful drawer completion, physical exit, modality release and cleanup, using the latest confirmed key after exit. It also handles unchanged navigation and external confirmed-location changes during a run. Desktop requests made with no drawer run do not invoke it; the application retains ordinary page focus policy there.

The application supplies its meaningful destination and actual focus operation. Async callbacks must respect `signal` after every await and before focusing. A confirmed-location change, new request/opening, authoritative close or disposal aborts the previous handoff. Do not await the callback's own navigation request, remove its owner before cleanup or assume the control can undo work from a callback that ignores cancellation. Callback failures appear in `state.error`; they do not rewrite an already confirmed navigation result as a routing failure.

The backend retains focus entry, containment and dismissal restoration. This hook supplies application focus after that lifecycle rather than moving focus behind an active modal. Verify callback ordering, unchanged/external navigation, cancellation and error reporting; browser checks must confirm the actual focused target. See [drawer navigation](../../guides/drawer-navigation.md).
