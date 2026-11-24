# uiDefaultInputEquals

Editing-value equality: `uiDefaultInputEquals` is exported from `@uninterface/uninterface`.

Draft equality only; never used to skip validation, revisions or notifications.

## API

```ts
/** Draft equality only; never used to skip validation, revisions or notifications. */
export function uiDefaultInputEquals(left: unknown, right: unknown): boolean;
```

## Ownership and implementation

Default equality compares primitives, arrays and plain records recursively, Dates by time, URLs by href, and File/Blob values by metadata. It does not read file bytes. Supply field inputEquals when business equality needs different semantics.

See the [editing-value equality guide](../../guides/controls.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify equivalent drafts remain clean, changed values become dirty, and cyclic structures terminate.
