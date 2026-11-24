# UiAppHosting

```ts
type UiAppHosting = 'document' | 'viewport'
```

Import from `@uninterface/uninterface`. Selects where [UiApp](../components/UiApp.md) obtains its initial vertical space. Document is the default and grows with content. Viewport occupies the dynamic browser viewport height and supplies a measured bounded height to its primary region layout. It does not independently choose which content scrolls.

Viewport hosting requires `hosting.viewport.v1` from the backend. The view reports actual available height, updates it on resize and disconnects observation on unmount. No document/body scroll lock or global style mutation is used. Use at the document application root, with body margin managed by application integration; it is not the allocated-height mode for an embedded frame.

The initial bounded consumer is UiRegionLayout with a scroll-policy. Library layout/content boundaries do not pass the entire root offer into their descendants as if it were their local allocation. UiModal separately owns scrolling for its content-sized body and masks the outer height offer. A generalized frame/allocated-space API is not provided; nested modal layouts use document flow rather than assuming the whole application viewport is their body height.

Acceptance checks document growth, viewport measurement and resizing, cleanup, independent application instances, and failure for unsupported hosting values. Actual browser geometry must complement DOM tests.
