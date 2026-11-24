# UiButton

An action the person can invoke. Business code supplies what it means, whether it is available, and what happens when invoked. The backend supplies its element structure, visual emphasis, focus treatment, and pointer/keyboard interaction.

```vue
<UiButton color="success" :loading="approval.pending" @click="approval.submit()">Approve</UiButton>
<UiButton :binding="form.bindings.submitButton" color="primary">Save record</UiButton>
<UiButton color="danger" variant="outline" @click="remove">Delete</UiButton>
```

Import from `@uninterface/uninterface`. Place in an application initialized with `createUiApplication`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Ordinary action, submit, or reset the containing form; omit with a binding |
| `color` | [UiThemeColor](../types/UiThemeColor.md) | Omitted | Semantic theme color role: `primary`, `success`, `danger`, `warning`, `info`, `secondary`, or supported theme extensions |
| `variant` | [UiButtonVariant](../types/UiButtonVariant.md) | Omitted; strategy, contextual default, then backend default | Optional `filled`, `outline`, `neutral`, `soft`, `text`, or `icon` presentation; an explicit prop takes precedence over a regional variant strategy |
| `allowWhenReadonly` | `boolean` | `false` | Allows this action under a participating input frame’s readonly policy; never overrides disabled/loading, and reset remains blocked |
| `disabled` | `boolean` | `false` | Additional restriction on action availability |
| `loading` | `boolean` | `false` | Display activity and prevent activation; omit with a binding |
| `form` | `string` | Omitted | Native form ID for submit/reset actions outside their form; bound actions require that matching UiForm in the same application |
| `binding` | [UiButtonBinding](../types/UiButtonBinding.md) | Omitted | Read-only reactive configuration, state and invocation from a control |

The default slot supplies the action label, normally meaningful text. The optional `icon` slot supplies decorative artwork, normally UiIcon. The backend owns its spacing and placement; the slot name does not select a side. Content must not contain nested interactive controls.

Use [UiIcon's size prop](UiIcon.md) when an action needs a specific square icon box. The backend accommodates that box while applying its own padding and control size. A surrounding allocation must provide enough room for the icon and button. If the allocation is too small, the button can overflow and a clipping ancestor can hide it. The [width strategy](../../strategies/uiButtonWidth.md) applies to eligible text-labelled buttons. Icon-only buttons reserve space for an explicit icon size when a loading indicator takes its place.

```vue
<UiButton variant="soft">
  <template #icon><UiIcon name="save" /></template>
  Save record
</UiButton>
<UiButton variant="icon">
  <template #icon><UiIcon name="delete" /></template>
  Delete record
</UiButton>
```

The icon variant visually hides the default-slot text while retaining it as the accessible name. Always supply meaningful label text. It also uses plain text/interpolations from that slot as a native browser `title` hint, unless an explicit title is supplied. For labels rendered by opaque child components, provide title explicitly; aria-label is a hint fallback when no direct slot text can be extracted. Native hints are supplemental: display on keyboard focus and touch is browser-dependent, and no guaranteed tooltip interaction is supplied. Without an icon slot, icon presentation retains visible text with the text treatment. Icon artwork is hidden from assistive technology to avoid repeating the label.

Ordinary unbound buttons emit `click(event: MouseEvent)`; other standard target listeners and accessible-name attributes reach the actionable element. A template ref exposes `focus(): Promise<boolean | null>` with the [shared focus contract](../../guides/controls.md#focus). Disabled or loading buttons resolve false; focusing never activates the action. Loading retains the action label and adds backend-owned activity feedback; it also disables activation. Effective disabled is `loading || disabled`. Loading does not change the button type or track a returned promise. Clearing loading restores availability only if disabled is also false.

Inside UiInputFrame, buttons automatically join its surface and restrictions. Under readonly, activation is blocked unless allowWhenReadonly is true; reset remains blocked. Use the opt-in for actions compatible with unchanged readonly values, such as copying or information. It does not authorize value mutation. Core rechecks activation; authors remain responsible for callback behavior. Outside a readonly frame, the prop has no availability effect. The backend supplies a contextual text-action default after explicit/strategy requests and keeps visible action focus.

## Control binding

Pass `form.bindings.submitButton` or `form.bindings.resetButton` inside the matching `UiForm` to obtain role, activity and availability without manual pending expressions. The button understands the shared target contract, not the form's implementation. Generic producers can supply ordinary button bindings too. See [UiButtonBinding](../types/UiButtonBinding.md) for the complete interface, custom-producer example, association requirements, and lifecycle.

Bindings own type, loading and activation. Supplying local `type`, `loading` or `@click` with a binding throws, even if the values agree. Local `disabled` may tighten availability: effective disabled is `binding.loading || binding.disabled || disabled`. A local false cannot override either producer restriction. Content, color and variant remain independent. For external submit/reset buttons, set `form` to the matching UiForm ID. Core verifies the binding owner against that host; another control’s form is rejected. While the named UiForm is absent, the bound button is disabled. Without `form`, a form binding requires its matching logical ancestor and native containment. Ordinary callback bindings do not accept `form`. Core guards activation using live availability, so a request arriving before disabled markup rerenders cannot bypass the button check. The owner must still enforce its operation policy for every invocation path.

Native submit/reset bindings use the form event route only. Ordinary bindings may supply `activate`; the button invokes it without creating another busy state. Loading without a binding can observe an operation owned elsewhere; the button remains unavailable until that activity ends and all disabled restrictions are cleared.

## Color, treatment, and defaults

`color` names a theme role, never a literal CSS color. `primary` is the primary theme role, not a main-action flag. `accent` is an optional complementary-emphasis extension; availability depends on the installed theme's declared capabilities. `danger` communicates potentially destructive actions; `error` describes failed/invalid state elsewhere and is not a baseline theme color. Themes may map danger and error to the same palette. No color triggers confirmation, persistence, validation, or destructive behavior.

`variant` is an optional presentation choice, independent of color. [UiButtonVariant](../types/UiButtonVariant.md) defines all six values, including the icon variant's hidden-label meaning. All must work with every supported color. Variants do not express action importance.

Core preserves omitted presentation props. An explicit variant takes precedence over an agreed uiButtonVariant strategy; otherwise a composition may supply a contextual default before the backend chooses its own default. UiNotice supplies text for ordinary buttons directly authored in its actions slot, without reaching into custom components; size and color remain independent. The core recommends filled and the supporting backends ordinarily use it, subject to supported native application configuration. Color defaults independently. Removing an explicit variant restores the regional preference, contextual default, or backend default in that order. Concrete colors, interaction-state tones, geometry and toolkit mappings belong to the backend theme.

[UiStrategy](UiStrategy.md) supplies supported control-size preferences through the [query agreement protocol](../../contracts/strategy.md#queries-and-agreement). [uiButtonVariant](../../strategies/uiButtonVariant.md) supplies regional button presentation preferences; color does not participate in strategy queries. Ordinary business compositions may omit `variant` and rely on backend defaults.

## Capability requirements

`actions.v1` covers the base action; `control.focus.v1` covers its asynchronous focus handle. Explicit `color` requires `button.color.v1` (consuming installed theme roles) and `theme.colors.v1` (six baseline roles); an extension also requires `theme.color.<name>.v1`; explicit `variant` requires `button.variant.v1` (all six treatments, independent of color). Declare those requirements in application/scenario manifests when used; core checks them at runtime as well. The icon slot requires `button.icon.v1`; regional variants require `strategy.button-variant.v1`. Bindings require core `button.binding.v1` and backend `button.loading.v1`. Supplying `loading`, including an explicit false, requires `button.loading.v1`. Reset requires backend `form.reset.v1`. Unknown colors/variants fail loudly, including literal CSS colors and `variant="full"`.

## Implementation obligations

Core selects the backend view and supplies the default action type. The backend must expose button semantics, prevent activation while loading or disabled, support native-equivalent Enter/Space activation, preserve a visible keyboard focus indicator, and place forwarded attributes/listeners on the actual action target even when it uses wrappers or a third-party component. A submit action must participate in [UiForm](UiForm.md)'s submission route. Backends must not invent a persistence or validation operation.

A backend can combine a decorative loading indicator with an adjacent visually hidden live status using localized `UiMessages.loading` text. Activity announcements should remain available while the action exposes busy state, and the action name stays unchanged. Indicator appearance, animation, reduced-motion treatment and resulting button dimensions are backend-owned. Do not infer geometry or screen-reader conformance from DOM tests alone.

Backends report native reset through `UiForm` so core restores the accepted editing baseline rather than allowing an independent native reset. An ordinary button must never accidentally submit its containing form. Business callbacks still own authorization and operation semantics; visual availability is not authorization.

## Acceptance

An ordinary action invokes its handler without submitting; a submit action follows the form control; loading or disabled actions do neither. Verify all four loading/disabled combinations, recovery when loading ends, retained explicit restrictions, and live-state checks before rerender. Keyboard operation, accessible naming, and focus visibility must work with each backend.

Verify every supported theme color with all six treatments, independent omitted defaults, and reactive changes without remounting or losing focus. Verify decorative icon placement, retained hidden labels and reactive hints, including missing-icon visible-text fallback, regional preference/prop precedence and strategy blocking. Forwarded accessible names must reach the action target; invalid colors, variants and binding combinations must fail visibly. Tests may inspect toolkit-specific mappings inside a backend's own suite, while shared acceptance checks the behavior above.

Use browser and manual checks for computed appearance, keyboard operation, visible focus, announcements and color contrast. Simulated DOM results alone do not establish those properties.

Inside UiInputFrame, inherited disabled state also prevents activation. Readonly does not automatically disable informational actions; compositions must disable and guard value-changing actions using the frame slot state.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

[uiButtonWidth](../../strategies/uiButtonWidth.md) selects content/full width for standalone text-labelled buttons. Icon-only and parent-input-frame actions retain their geometry. Width fills only the space offered by the layout.

## Choosing presentation for a business action

Follow the [button action guidance](../../guides/button-actions.md): danger for destructive/removal actions, success/danger for explicit Yes/No decisions, primary/filled for an ordinary standalone or principal action, and primary/neutral for its companion. Destructive meaning takes precedence over an affirmative answer. These are composition choices using the existing independent props; bindings and omitted backend defaults do not infer action roles.

Neutral is a variant, not a new theme color: use color="primary" variant="neutral" for a companion such as Cancel. It retains a visible neutral boundary and label at rest, while the requested color informs interaction feedback. It does not mean secondary, disabled or icon-only. Exact colors and interaction-state treatments are backend-owned. Continue using danger/outline or danger/filled for destructive actions so their warning color is visible without hover.
