# UiExpansionOptions

Options accepted by createUiExpansionControl. Import from `@uninterface/uninterface`.

```ts
interface UiExpansionOptions {
  mode?: UiExpansionMode
  initialExpanded?: readonly string[]
}
```

Defaults are single mode and no expanded keys. Keys must be unique, nonempty strings. Single mode rejects more than one initial key. Inputs are copied; mutating the original array does not update the control. Keys may exist before any view is mounted and are not DOM IDs.

Core validates the initial state before returning a control; backends have no role in construction. Verify invalid configuration, caller-array isolation and initialization before views mount. See [createUiExpansionControl](../functions/createUiExpansionControl.md).
