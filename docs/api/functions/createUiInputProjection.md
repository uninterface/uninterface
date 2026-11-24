# createUiInputProjection

Defines a named string-property editing target for one field-owned structured draft. Import from `@uninterface/uninterface` and define it once inside a reusable business component.

```ts
createUiInputProjection(field, key, { label, invalid? }): UiInputProjection
```

`field` accepts a UiFieldControl or a Vue ref/getter of it. `key` must be a nonempty string key whose draft property is a string; TypeScript rejects numeric/unknown properties. `label` is a string or reactive ref/getter. Optional `invalid(): boolean` attributes an existing owner failure for focus; omission attributes it to this editor. The immutable result exposes `key` and reactive `label`, not a second draft owner.

Pass the result to `UiTextInput :projection` inside a UiInputFrame belonging to the same grouped UiField (`group`). Its editor is named by the projection. Updating copies the current whole draft and changes only this property through field.set; incomplete text and sibling changes are retained. There is no separate parse/validate/reset/lifetime. Target changes require a keyed editor remount. Foreign/forged projections and non-string runtime drafts fail explicitly.

Core owns projection coordination; backend views receive the selected string and ordinary bindings, never inspect field properties. Verify type rejection, sibling preservation during rapid edits, zero/empty strings, external updates, field locks, stale validation invalidation and reset to the owner baseline.

See [shared input frames](../../guides/input-frames.md) for supported compositions and complete examples.
