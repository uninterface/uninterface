# Controls, forms and focus

[Backend reference](README.md) · [API reference](../README.md)

Editor and action bindings, form association, focus handles, search and segmented selection.

### UiButtonViewProps

`type: 'button' | 'submit' | 'reset'`, `form?: string`, `color?: UiThemeColor`, `variant?: UiButtonVariant`, `disabled?: boolean`, `loading: boolean`, `loadingLabel: string`. The two type aliases are documented under [UiThemeColor](../types/UiThemeColor.md) and [UiButtonVariant](../types/UiButtonVariant.md). Core normalizes the default type to `button` and preserves omitted presentation options. Resolve color and variant independently; every declared color must work with all six UiButtonVariant values. The core recommends filled, while omitted props/strategies use a core composition default when supplied, otherwise the backend default. The backend documents its default color and translates treatments to its toolkit privately. See [UiButton](../components/UiButton.md) for role meanings and versioned capability obligations. Forward click/keyboard/accessible-name attributes to the actionable element. No view-specific event is defined; expose `UiFocusHandle`. Loading must display perceivable activity, expose accessible state/status using the supplied localized loadingLabel, preserve the action name and useful focus, and honor reduced motion. Indicator structure, spacing and animation are backend-owned; the shared contract does not require reserved space or constant button dimensions. Loading prevents activation: effective disabled is `disabled || loading`. Core includes loading when resolving disabled and guards live activation; backends must render the effective disabled state and suppress pointer/keyboard activation accordingly. Loading still supplies the activity indication, while disabled alone does not. The backend receives these resolved props, never the public control binding or its owner. A polite live status outside the busy element is one way to expose activity without changing the action name. Declare `button.loading.v1` for this contract.

Button views receive `default` and optional `icon` slots. The icon is decorative. Use native toolkit icon slots where available; backends own placement and spacing. With icon presentation, retain the default label in accessible hidden markup and show the icon. Without an icon slot retain visible text. Native title hints supplement the retained name; they do not guarantee focus/touch tooltip behavior. Declare `button.icon.v1`.

When providing `icon.size.v1`, accommodate the explicit square in the icon slot with sufficient target area. Preserve the control size strategy and native padding where they can fit the requested artwork. Keep the action centered in icon presentation and preserve its footprint when loading substitutes an indicator. A constrained parent can clip overflow. See [UiIconViewProps](presentation.md#uiiconviewprops) for the forwarded attributes.

`useUiButtonPresentation(props: UiButtonViewProps)` from `@uninterface/uninterface/backend` runs in backend setup at the existing button node. It returns render-time functions `variant(): UiButtonVariant | undefined`, `iconOnly(): boolean`, `hint(): string | undefined`, and `width(): 'content' | 'full' | undefined`. Explicit variant wins over the agreed uiButtonVariantQuery answer; unanswered omission uses the private contextual default supplied by core when present, otherwise remains undefined for backend defaults. Ordinary buttons directly authored in UiNotice actions receive text through this helper; explicit variants and agreed strategies still take precedence. Custom component interiors do not inherit this default. Functions observe current slots/text when called during render; do not cache their results in a nonreactive setup variable. The hint preserves explicit title, otherwise extracts plain default-slot text for icon presentation, falling back to aria-label. Opaque child component labels need an explicit title for a hint. The helper does not render markup or choose native geometry. Declare `strategy.button-variant.v1` when integrating the query.


### UiFieldViewBinding

`id: string`, `label: string`, `help?: string`, `issue: string | null`, `validating: boolean`, `describedBy?: string`, `requiredLabel?: string`, `group?: boolean`, `checkable?: boolean`. For a simple field, associate the label with the target `id`. For a group, supply native fieldset/legend semantics or equivalent named-group semantics and a focusable invalid group. When shown, render help under `${id}-help` and the issue under `${id}-issue`; `describedBy` lists candidate IDs for the supplied content. The backend must coordinate its field and input views when presentation suppresses a message: if its policy omits help while an error is displayed, omit the helper’s description identifier too, then restore both when the issue clears. Preserve other supplied associations. `requiredLabel` is localized annotation text, not a validation rule or a requirement to display that text verbatim. A backend may use a visual marker while preserving accessible required information. Ordinary controls support `aria-required`; generic groups do not, so required groups need an appropriate localized description. A decorative marker must not be the only source of required semantics. For groups, expose `validating` through accessible busy state. Slot content must remain in the logical field context. Use the [field policy helpers](strategies.md#field-policy-integration-helpers) to coordinate visibility and associations without owning validation.

`checkable` identifies a core-registered standalone checkbox/switch or radio/checkbox group; do not inspect opaque editor internals to infer it. Implement the [checkable presentation requirements](../../strategies/uiCheckablePresentation.md#backend-implementation-requirements): default adapt, supported explicit arrangements and unsupported-mode fallback, always-visible labels/titles (including under hidden), and mode-specific description/feedback alignment. Standalone labels stay adjacent in flushed/control-aligned modes and move to the label area in separated mode. Individual option labels always remain adjacent; group titles remain separate. Coordinate field/editor views privately, retaining native labeling, activation, editor identity, checked/mixed state, focus and accessible associations. Dropdowns and segmented selectors do not enter this category through their native implementation.


### UiControlViewBinding

`id: string`, `describedBy?: string`, `required?: boolean`, `invalid: boolean`, `validating: boolean`, `disabled: boolean`. Disabled is already resolved from control, UiField and local editor restrictions; backends must not replace it with an attribute override. Apply the identifier and associations to the interactive target or an equivalent accessible widget, expose required/invalid state appropriately, and honor disabled behavior. A visual wrapper alone is not the label target. Expose `validating` as accessible busy state on the control; it does not independently disable editing. Use `invalid` for toolkit invalid styling; never let CSS pseudo-validity replace it.


### UiTextInputViewProps

`binding: UiControlViewBinding`, `value: string`, `type: 'text' | 'password'`, `multiline?: boolean`, `readonly?: boolean`, `inputmode: 'text' | 'decimal'`, `autocomplete: string`. Render the complete string unchanged, translate target edits to `update(string)`, and loss of focus to `blur()`. Supply the `UiFocusHandle`. A custom widget must forward keyboard listeners to its editing target. Do not parse or format the business value here. Use native password masking or native multiline/textarea behavior as requested. Readonly prevents editing while preserving focus/selection; apply it independently of disabled. The current focus handle and forwarded attributes/listeners must reach either input or textarea. Backend-native labels, errors and size strategies must work in both modes. Password and multiline cannot be combined. Declare `input.text.readonly.v1`, `input.text.password.v1` and `input.text.multiline.v1` for these features.


### UiCheckboxViewProps

`binding: UiControlViewBinding`, `value: boolean | 'indeterminate'`. Present checked/unchecked/mixed and report `update(boolean)`. Do not use the string value of a native checkbox as the business boolean. Required semantics come from the binding; business rules decide which boolean is acceptable.


### UiSelectOption

`value: string`, `label: string`. The stable submitted value is separate from the visible/localized name. Option values must be unique within the supplied list. Optional `disabled` prevents user selection; optional `hidden` excludes the option from the opened candidate list while allowing its label to represent the current value. Optional `group` supplies a group label. Core uses hidden disabled options for placeholders and retained absent selections. Options contain no backend CSS or widget instances.


### UiSelectViewProps

`binding: UiControlViewBinding`, `value: string`, `options: readonly UiSelectOption[]`. Present the selected label, report `update(string)` for selection and `blur()` on focus exit. Do not infer a new value when options change; reconciliation policy belongs to the business/control contract. Also accepts `status` with collection `state: 'idle' | 'loading' | 'refreshing' | 'ready' | 'error'`, `pending: boolean` and localized `message: string`. Core also supplies `available: boolean`, true only for ready collections with candidate items. When false, preserve the selected/placeholder display and present the source state as nonselectable content inside the opened picker. For loading, prefer the toolkit's native presentation and localized wording; `status.message` is a fallback for manual implementations, not a required override of native text or indicators. Keep busy state and accessible announcements meaningful, using the toolkit locale for its native loading wording. Native selects use disabled status options; composite pickers may use native loading/empty/status areas. Status must not become selected or replace the collapsed label. A native status option must not share a field/candidate value. Hidden options supply display-only labels, not selectable choices. A native implementation may use hidden option elements; a composite picker omits those records from its candidate surface while using their supplied label for the collapsed value. Do not present cached alternatives as choices. Only `binding.disabled` disables the select itself; source state must leave it openable. Reject interactions with hidden/disabled/status options without changing the current value. Emit `requestLoad()` for pointer activation and keyboard selection intent, without suppressing the picker’s normal opening behavior. Core decides whether the source needs loading. Mere focus is not a loading request.

Availability must not be inferred from translated text. Keep source failure distinct from field invalidity. Source recovery controls belong to the business composition; the select view renders no recovery button or retry event. Maintain a visually hidden polite status region outside the busy select for announcements and associate it as an additional description when it has content. Forward ordinary control attributes to the actual native select or composite picker interaction target. Native and composite popup updates, keyboard interaction and retained selected-label display require real-browser acceptance; DOM tests alone cannot establish picker rendering.


### UiFormViewBinding

Optional `height: 'content' | 'full'` defaults to content. Full passes a bounded allocation to the consumer's single authored layout root; the native form must shrink as an allocated item and let its root fill the available height. Declare `form.height.v1`. Do not clip overflowing fixed regions or change field spacing, native submission, focus or busy behavior. This mode does not impose a layout on the default content-height form.

`id: string`, `label: string`, `pending: boolean`. ID identifies the actual native form for external actions. Label names the form; pending exposes busy state for validation or submission. Render the default slot only: the view must not add form-wide feedback, live regions or result notices. Core distributes named UiFormSubmissionError issues onto field controls; backends use their ordinary field presentation and focus paths and never decode API errors. Report submit without running validation or persistence locally. Suppress native reset and emit `reset()` so core restores its own baselines. Declare `form.reset.v1`; do not maintain a second native reset baseline.


### UiFocusHandle

`focus(): Promise<boolean | null>`. UiTextInput, UiCheckbox, UiSelect, UiRadioGroup, UiSegmentedSelect, UiCheckboxGroup and UiButton views must expose this handle and declare `control.focus.v1`. Follow the [shared focus contract](../../guides/controls.md#focus): verify the actual target after required rendering/scheduled work, resolve true/false for observed outcomes, use null only when an issued request cannot be verified, and reject unexpected errors. Disabled or unmounted targets resolve false. Focusing must not activate, toggle, change or open the control. Core exposes the handle through each public component; business compositions should not search backend DOM.

`focusUiTarget(target: () => HTMLElement | null | undefined, disabled: () => boolean): Promise<boolean | null>` is an optional backend utility. It waits for Vue updates, checks live disabled state and target connection, focuses the DOM target, waits for Vue updates again and verifies `:focus`. It returns true/false and propagates unexpected errors. Backends with additional scheduling or opaque widgets implement the handle themselves.


### useUiFallbackFocus

Optional `useUiFallbackFocus(): (element: HTMLElement) => boolean` creates scope-owned programmatic fallback mechanics. Calling it adds `tabindex="-1"` only if absent, focuses synchronously and verifies the active element. It removes its temporary attribute on blur, failed focus or scope disposal; an existing tabindex remains owned by its original author. The adapter supplies the actual named target and backend focus presentation. This helper creates no ordinary Tab stop, markup or naming.


### useUiFormFocus

Optional `useUiFormFocus(root: () => HTMLElement | undefined): () => void` supplies failed-submit recovery for a backend's actual form root. It selects the first invalid usable field, preserves input-frame focus, descends to the selected enabled/first enabled radio or first enabled checkbox, and falls back to the named choice/status group when no choice is usable. Generic grouped editors and the named form remain supported fallbacks. Disabled, hidden and inert targets are skipped. Fallback tabindex is temporary through `useUiFallbackFocus`; ordinary controls retain native focusability. Backends independently own markup, naming, description associations and focus-visible presentation.


### UiFormViewHandle

`focusInvalid(): void`. Focus the first invalid, operable control or composite group in this form's meaningful order. Checkable groups descend to their first enabled checkbox or selected enabled/first enabled radio without changing selection; a named group/status fallback is used only when no option is usable. Temporary fallback focusability is removed on blur. Options keep native focus indicators and feedback descriptions, while fallback containers use the backend's consistent focus-visible treatment. If there is no operable invalid field, focus the programmatically focusable named form. Support visible focus and allow descriptions to be announced. Core invokes this after rejected submission and a Vue update; the backend owns DOM/toolkit-specific focus mechanics.


### UiChoiceGroupOption

`{ key: string; label: string; description?: string; disabled: boolean; selected: boolean }` describes one current flat option. Core computes selected state from the field. Disabled is interaction eligibility, not field invalidity.


### UiChoiceGroupViewProps

Shared by backend `./UiRadioGroup.vue`, `./UiCheckboxGroup.vue` and `./UiSegmentedSelect.vue`:

- `binding: UiControlViewBinding`, `label: string`, `orientation: 'vertical' | 'horizontal'`.
- `options: readonly UiChoiceGroupOption[]`, `available: boolean`.
- `retained: readonly { key: string; label: string }[]` for selected keys missing from options.
- `unavailableLabel: string`, empty until ready; annotate retained lines without inventing selectable candidates.
- `status: UiSelectViewProps['status']`; loading/error text is separate from field invalidity.

Emit `choose(key: string)` for the activated eligible option, and `blur()` only on group exit. Core toggles checkbox membership or replaces radio selection and rechecks live availability. Never emit a replacement array filtered against current options. No changes while unavailable/disabled; retain selected presentation. Expose UiFocusHandle. Group feedback must be associated with actual options; names remain per-option while the group uses the supplied label. Attributes/listeners go to the group. IDs and radio names must isolate mounted editors.

`useUiChoiceGroupView(props, multiple, root, targets, choose, blur, options?)` is an optional backend helper. root and targets callbacks resolve backend-owned DOM; targets return `{ key, element }` records for actual interaction targets. It supplies option-first group focus (first enabled checkbox; selected enabled/first enabled radio; named root only when no usable option, with temporary tabindex and blur cleanup), focusout and radio arrow handling with wrap/disabled skipping, radio tab-stop reconciliation, and focus recovery after removal. Attach returned keydown on capture when it must replace a toolkit's conflicting arrow handling. Optional `options: { fieldLabel?: boolean }` enables external composite-field label activation. It listens on the root document while mounted for label clicks explicitly targeting the binding ID when the target is not an HTML-labelable native control, focuses through the existing guarded handle without selecting, and removes its listener on disposal. Option labels keep native activation. It prescribes no markup or toolkit. Group views remain independently implemented; consumers use the public components.

UiCheckboxViewProps.value accepts the indeterminate sentinel as well as booleans. The backend maps it to native mixed state with an underlying unchecked value where needed; activation emits true, then normal boolean updates. Do not render the sentinel as truthy checked or invent a three-state cycle. Tristate is a separate capability.


### Standalone focus presentation

The backend `./focus` module exports `uiFocusPresentation: UiFocusPresentationBinding`, a stable immutable object containing only an opaque `class`. Export the module explicitly in package.json. The core's `useUiFocusPresentation()` resolves it statically and checks `focus.presentation.v1`. Backends supply the associated CSS in their normal stylesheet; no additional app provider or consumer stylesheet is required.

Use theme-consistent visible keyboard-focus treatment with dark/forced-colors support. Style only the bound element, preserving focus indication on nested controls independently. Do not add tabindex, roles, handlers, runtime DOM work or component imports to this module. The binding must work on arbitrary suitable native elements outside a navbar or menu. The backend chooses its own default boundary shape; never inspect descendants to copy theirs. `contextTrigger` should reuse this presentation, for example by passing `uiFocusPresentation.class` through `useUiMenuView`'s `contextTriggerClass` option. See the [public guide](../../guides/focus-presentation.md) for consumer obligations and verification.


### UiMultiSelectViewProps

`binding` supplies field identity, availability and feedback; `value` is a readonly string array. `options` contains current choices plus retained selected values, with unavailable wording already localized. `available` gates mutation, while `status` reports source state separately. `placeholder` is an optional collapsed-display hint. `clearLabel` and `clearable` define the explicit clear action. Native listboxes may ignore placeholder.

Views emit update with the entire proposed raw membership, clear, blur and requestLoad. Core validates additions and preserves locked members; views must also prevent disabled interactions. Retained options are removable only when core marks them eligible. Source status is nonselectable and must never enter the raw array. Expose the shared UiFocusHandle and target attributes at the real editor. Toolkit popup targets use useUiOverlayTarget when hosted by a modal.


## External form action association

`UiFormViewBinding.id` is the native form identity selected by core. Render it on the actual form element, including when using a toolkit form component. `UiButtonViewProps.form` is optional; forward it to the actual native button's `form` attribute, alongside its native submit/reset type. This association must work even when the two views are siblings or rendered through Teleport in the same document/tree scope. The event still reaches the associated form exactly once; do not substitute click callbacks or an additional validation engine. Keep the existing intercepted native reset and invalid-submission focus behavior.

Core validates ownership using application-scoped host registrations and disables explicitly targeted bound actions while their host is absent. Backends own the concrete elements and native attribute routing. Verify form/ID changes, host removal and remount, two views with different IDs, and external submit/reset alongside loading and disabled restrictions. Browser tests cover Enter and keyboard focus; backend DOM checks establish the association and native event wiring only.

UiCollapsible color is optional: only declare `collapsible.color.v1` when the view maps the installed theme's supported semantic roles. Core validates roles only for a color-capable backend and otherwise drops the request. An undefined color preserves native defaults. Color must not change expansion, availability, child identity or focus. Native treatment may color different parts or appear only when expanded; document the mapping. The optional fallback is specific to UiCollapsible and does not weaken required capabilities on other components. 


### UiSwitchViewProps

Render a named boolean switch followed by its label. Emit update(boolean) only for allowed user interaction; readonly and disabled block changes. Expose UiFocusHandle. Reuse field associations and native size presentation.

```ts
export interface UiSwitchViewProps {
  binding: UiControlViewBinding
  value: boolean
  readonly?: boolean
}
```


### UiSuggestionsViewProps

Render host slot with host bindings and an associated listbox of candidates. Disabled candidates remain unavailable. Query, refresh and accept delegate to core; source status is separate from candidates. useUiSuggestionsView supplies optional active-descendant/IME/keyboard mechanics; backends own native popup presentation.

Size the popup from the editing control, subject to available viewport space, and follow changes to the host width while the popup is open. `useUiSuggestionsView` exposes `anchorWidth` for adapters whose positioning primitive does not supply the needed width.

Render the backend `suggestion` slot with `{ item, active }` inside the option and use `item.label` as the option's accessible name. The slot carries the business content or the core's range-highlighted label. Backend option semantics and event handlers surround that content.

Call `engagement` with changes to popup visibility. The core retains the visible results during debounce and loading and supplies them to the view with selection disabled. Use `pending` for the listbox busy state and present any status message outside the listbox. A status message accompanying retained options describes an update.

```ts
export interface UiSuggestionsViewProps {
 id: string
 results: readonly {key:string;label:string;disabled:boolean}[]
 status: string
 pending?: boolean
 message: string
 label: string
 disabled: boolean
 engagement?(value: boolean):void
 query(value:string):void
 refresh():Promise<void>
 accept(key:string):void
}
```


### UiTemporalInputViewProps

Render scalar or range editing, explicit open-boundary controls and clear action. Keep canonical values separate from presentation. Use display/candidate for timezone projection and eligible for native candidate restrictions. Forward update/blur and UiFocusHandle; name both range endpoints and preserve group feedback.

```ts
export interface UiTemporalInputViewProps {
 binding:UiControlViewBinding
 label:string
 kind:import('../temporal/control').UiTemporalKind
 value:import('../temporal/control').UiTemporalValue
 options:Readonly<import('../temporal/control').UiTemporalOptions>
 presentation?:import('../temporal/presentation').UiTemporalPresentation
 readonly:boolean
 startLabel:string
 endLabel:string
 openLabel:string
 clearLabel:string
 display(value:string):string
 candidate(value:string):string
 eligible(value:string):boolean
 update(value:import('../temporal/control').UiTemporalValue):Promise<void>
 blur():Promise<boolean>
}
```


### UiTemporalEditorViewProps

Backend-private editor integration for one boundary. useUiTemporalEditor preserves unfinished/invalid text, locale formatting and focus. The backend owns the complete input and picker experience, including popup choice, trigger placement, focus and native toolkit composition. The helper does not prescribe a separate disclosure or a concrete DOM tree. Native candidates must call the editor view’s update directly; useUiTemporalEditor.update parses display text and must not parse canonical picker output again. Never silently truncate precision or extended-hour values. Core validates accepted candidates. Current adapters use private leading/trailing slots on their own UiTextInput views; this is not a public UiTextInput slot contract.

```ts
export interface UiTemporalEditorViewProps {
 binding:UiControlViewBinding
 kind:import('../temporal/control').UiTemporalKind
 value:string
 precision:import('../temporal/control').UiTemporalPrecision
 presentation?:import('../temporal/presentation').UiTemporalPresentation
 readonly:boolean
 label:string
 eligible(value:string):boolean
 update(value:string):void
 blur():Promise<boolean>
}
```


### Reviewed component integration helpers

`useUiTooltipView` attaches only an explicit forwarded host marker, preserves descriptions, coordinates hover/focus/click requests and cleans listeners on disposal. `useUiTooltipAnchorVisibility(anchor, requested)` returns a reactive check for at least half of the anchor area within known clipping and paint boundaries while a bubble is requested. Field-failure and supplemental presenters use this check for visual display. `useUiTooltipPlacement` resolves header and footer anchors toward the modal body. `useUiTooltipPosition` supplies viewport-clamped floating geometry and follows the anchor when layout moves it. A native presenter can call `useUiTooltipPositionUpdate(anchor, surface, visible, update)` to refresh its native positioner when the anchor or the surface’s containing block changes geometry. Both helpers batch geometry reads while the bubble is open and release tracking on close or disposal. `useUiSuggestionsView` supplies an editor host binding and keyboard/IME/listbox coordination without rendering. `useUiTemporalEditor` supplies locale text parsing, draft retention and native picker synchronization without owning business validation. These helpers are exported from @uninterface/uninterface/backend and are optional implementation mechanisms, not business authoring APIs.

UiTextInputViewProps.reveal is an optional resolved visibility projection: shown, localized label, toggle and keydown. Render a non-submit named control, preserve the editor node when type changes, and retain live disabled checks. Suggestions host attributes must target the real editor; adapt native attribute handling if it would overwrite required semantics.


### useUiTemporalRange and UiTemporalBoundaryMode

`useUiTemporalRange(props: UiTemporalInputViewProps)` coordinates boundary modes, retained endpoint drafts and canonical candidate updates. `UiTemporalBoundaryMode` is `'bounded' | 'start' | 'end' | 'unrestricted'`. It returns computed `range`, `mode`, `modes` (value/label/symbol), localized `messages`, `nextDay`, `display(side)`, `selectMode(mode)`, `updateEndpoint(side, value)`, `updateRange({ start, end })` and `clear()`. Modes are limited by allowOpenStart/allowOpenEnd/allowUnrestricted. Mutations guard disabled/readonly. Retention belongs to the mounted editing view and clears on external synchronization or Clear. Display projects valid canonical next-day time ends back to ordinary clocks; unsupported values remain visible. Shared parsing owns overnight normalization and the 24-hour bound. Backends own mode widget, native range/scalar selection, formatting and segment-context synchronization. See the [temporal guide](../../guides/temporal-inputs.md).


### Segmented single selection

`UiSegmentedSelect.vue` represents an ordinary field editor (no UiField group), while encapsulating internal radio-group accessibility. Its field label follows ordinary placement and must focus the current/first enabled segment without selecting; supporting backends opt into the choice-view helper fieldLabel integration for external labels. It consumes `UiChoiceGroupViewProps`, emits choose/blur and exposes UiFocusHandle. Declare `input.segmented-select.v1`. Use single-selection radio semantics with a joined segment surface, preserving no-selection, empty keys, disabled/missing selections and source guards. Keep native toolkit control integration, size defaults/query barriers and local theme tokens. Adapt native joined-choice facilities to the radio contract; native mandatory-selection behavior must not force an initial selection. Concrete native mappings belong in backend documentation.

Horizontal segments default to a single locally scrollable strip, vertical segments remain joined vertically. Contain hidden native inputs inside their option; do not let them extend surrounding scrolling. Expose group and option naming, description, required and invalid state on the correct targets; preserve visible native focus. The shared arrow helper resolves horizontal movement against the rendered text direction. Validate actual browser geometry, focus and keyboard behavior separately from DOM wiring.


### Button width strategy

useUiButtonPresentation additionally returns width(): 'content' | 'full' | undefined. It resolves uiButtonWidthQuery at the existing button node and excludes icon-only and parent-input-frame actions. Apply full width to both the containment host and actual control; content width fits content. Undefined preserves native defaults. Use compatible native block facilities or fill the existing containment host. Declare strategy.button-width.v1; do not make an ancestor layout selector stretch unrelated descendants.


### Neutral button treatment

The neutral UiButtonVariant retains neutral resting text/boundary/surface and uses the requested semantic color for hover, keyboard focus or pressed feedback. Preserve native dimensions, focus, disabled/loading restrictions and theme customization. Prefer native default/outlined treatments, adapting native tokens where needed. A native full hover fill is permitted; identical tint opacity across backends is not required. All supported semantic colors remain valid, although author guidance keeps destructive actions visibly danger-colored at rest. No new theme color is introduced. Remove neutral-only token overrides on reactive variant changes. Include neutral in button.variant.v1 and strategy.button-variant.v1 support and verification.



## Collection action content and surface

UiButtonViewProps.collectionAction is an optional core-only projection { iconOnly: boolean; defaultVariant: UiButtonVariant }. It preserves collection-selected content independently of variant(). useUiButtonPresentation(props, defaults?: { collectionActionVariant: UiCollectionActionVariant }) resolves uiCollectionActionVariantQuery at the existing button node. The backend supplies its default collection variant; omitting defaults selects bordered. Bordered preserves collectionAction.defaultVariant per action, including mixed filled/outline treatments; soft/text translate directly. Resolve omission, blocking or disagreement through the backend's default before rendering. Supported surface requests combine with uiButtonVariant by agreement after this per-action translation; either concern's disagreement or differing surfaces restores that backend default. Explicit props.variant remains authoritative. Generic icon does not alter collection content. For collection actions, iconOnly() may be true while variant() is outline/soft/text; do not infer text treatment from icon-only content. Keep hidden accessible labels, hints and native icon geometry independently. Ordinary UiButton behavior is unchanged. Declare strategy.collection-action-variant.v1 and verify the two concerns independently.

