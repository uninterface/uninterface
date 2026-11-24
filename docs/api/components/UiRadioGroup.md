# UiRadioGroup

Edits one choice in one field. Import from `@uninterface/uninterface`; use inside `UiField group`. Raw input is `string | undefined`, translated to business data by the field codec. See the [choice groups guide](../../guides/choice-groups.md).

```vue
<UiField :field="selection" group label="Choices">
  <UiRadioGroup :control="choices" />
</UiField>
```

| Prop | Default | Meaning |
| --- | --- | --- |
| `control: UiEntryControl` | Required | Business-owned static or asynchronous choice source |
| `disabled?: boolean` | false | Additional restriction; combines with field/control state |
| `autoLoad?: boolean` | true | Load on initial mount, source replacement while enabled, or enabling autoLoad |
| `orientation?: 'vertical' \| 'horizontal'` | vertical | Vertical choices or horizontal wrapping flow; backend owns spacing |

No slots or public emitted events. No competing value/model props. Observe/change the field control. Flat item entries supply key, label, description and disabled state; structural groups/separators/submenus are rejected. Rich content falls back to text, and navigation metadata does not activate links. Entry selection scopes cannot compete with the field.

Tab enters/leaves the group; arrows move and select, wrapping past disabled choices; Space selects. Re-activating the selected radio does not clear it. Undefined is no selection; the empty string is a legitimate key.

Each eligible change calls field.set followed by validation; leaving the whole group validates. Focus movement inside the group does not independently trigger blur validation. Required annotation does not install a rule. Business validation owns limits and eligibility. Disabled selected members stay selected; disabled checkbox members cannot be directly removed, while an enabled radio choice can replace a disabled selection.

Retain missing selected values with last known labels or raw keys, showing “Not in current choices” only for ready results. Loading/failure/empty results do not erase selection or establish field invalidity. Candidate interaction waits for ready results. Source status is separate from field feedback. There is no automatic retry or built-in clear/remove action; business compositions supply recovery and explicit obsolete-value repair. autoLoad=false requires an explicit control.load(). clear() leaves the source idle. See the guide for complete ownership and repair obligations.

A template ref exposes `focus(): Promise<boolean | null>`, using the [shared focus contract](../../guides/controls.md#focus). Focus the selected enabled choice, otherwise the first enabled choice. With no operable choice, focus the named group/status container. Effective disabling prevents the request. Attributes and listeners target the semantic group; they are not copied to every option, and reserved bindings cannot be overridden.

Core owns selection guards, parsing and validation. Backends own native controls, group/option naming, descriptions, field feedback associations, source state, visible retained values, keyboard handling and verified focus. On failed form submission, an invalid radio field receives focus on its selected enabled option, or its first enabled option when no enabled selection exists. The group remains a fallback when no option is usable. They must isolate radio names between mounts and restore group focus when a focused option is removed. Backend modules are statically imported and require `input.radio-group.v1` and `control.focus.v1`.

Acceptance: codec round trips and submitted business values; missing/disabled selections survive refresh; failed sources cannot commit stale candidates; empty values remain distinct; keyboard and focus semantics; reset/accept; and named feedback. Browser verification is required for pointer/keyboard operability and visible focus; DOM checks alone do not establish it.

Failed submission uses the same option-first focus policy without changing selection. The named group/status container is a fallback only when no option is usable; its temporary tabindex is removed on blur. Options retain native focus indicators and field-feedback associations; fallback containers use the backend’s common focus-visible treatment without an extra ordinary group Tab stop. See [choice-group focus](../../guides/choice-groups.md#interaction-and-presentation).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

## Label presentation

Labels and group headings remain visible even under `uiFieldLabels('hidden')`. Individual option labels stay beside their controls. Standalone checkbox/switch labels are adjacent except with the explicitly selected separated arrangement. [uiCheckablePresentation](../../strategies/uiCheckablePresentation.md) selects flushed, control-aligned or separated placement; omission uses `adapt`. Backends own native markup, responsive stacking and logical-direction alignment. Changes preserve the control, value, focus and label activation. See the [shared principles](../../guides/design-principles.md#checkable-control-labels).

