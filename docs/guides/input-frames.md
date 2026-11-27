# Shared input frames

Use UiInputFrame when editors, supporting text, icons and actions express one field-owned value and should read as one input surface. It supplies presentation and interaction coordination while the existing field/control retains the draft, parsing, validation, baseline and lifetime. Initialize the application with createUiApplication; import business APIs from `@uninterface/uninterface`.

## A single string

```vue
<script setup lang="ts">
import { createUiFieldControl, UiField, UiInputFrame, UiTextInput, UiIcon } from '@uninterface/uninterface'
const keyword = createUiFieldControl('')
</script>
<template>
  <UiField :field="keyword" label="Keyword">
    <UiInputFrame>
      <UiIcon name="search" />
      <UiTextInput type="search" placeholder="Search records" />
    </UiInputFrame>
  </UiField>
</template>
```

The editor automatically consumes the whole string draft. The field label names it even when a label strategy hides the visible label. `type="search"` preserves native search semantics; a magnifier is supplied explicitly above. Search type does not select live querying or submission policy. Compatible suggestions are available; password reveal and multiline are incompatible with search.

## Named projections

```ts
import { createUiFieldControl, createUiInputProjection } from '@uninterface/uninterface'
const range = createUiFieldControl({ minimum: '', maximum: '' })
const minimum = createUiInputProjection(range, 'minimum', { label: 'Minimum price (USD)' })
const maximum = createUiInputProjection(range, 'maximum', { label: 'Maximum price (USD)' })
```

```vue
<UiField :field="range" label="Price range" group>
  <UiInputFrame>
    <UiTextInput :projection="minimum" inputmode="decimal" />
    <span aria-hidden="true">to</span>
    <UiTextInput :projection="maximum" inputmode="decimal" />
  </UiInputFrame>
</UiField>
```

This minimal example retains strings; a reusable business component supplies the actual codec, rules and operations. Define projections once inside that component. Consumers supply business data/operations, not reconstructed editor internals. Each projection updates one string property using the current whole draft, so rapid changes preserve siblings. Incomplete/malformed text remains editable. Existing field.set owns synchronous draft acceptance and asynchronous checked-field feedback; there is no deferred projection-commit protocol. Disabled/readonly user requests are rejected before writes. Validation never accepts a new baseline by itself.

A projection's optional `invalid()` attributes the existing field failure for focus; it does not create or validate an independent field. Names can be reactive getters. Keys identify business properties, never mount positions. One active editor per target is allowed in a frame. Changing target/owner requires a keyed remount; removing an editor preserves the owner draft.

## Bounded editors and remaining space

Editors ordinarily grow to share the available row. To keep a compound range compact, cap each editor's display capacity and place a spacer after its currency suffix:

```vue
<UiInputFrame>
  <UiTextInput :projection="minimum" inputmode="decimal" :max-width-characters="11" />
  <span aria-hidden="true">to</span>
  <UiTextInput :projection="maximum" inputmode="decimal" :max-width-characters="11" />
  <span aria-hidden="true">USD</span>
  <UiSpacer />
  <UiButton @click="clear">Clear</UiButton>
</UiInputFrame>
```

Import UiSpacer from `@uninterface/uninterface`. The grouped UiField and projections follow the example above. Eleven character cells allow roughly ten digits plus a decimal separator; this is a display cap, not a length/precision constraint. Editors grow up to the cap, can shrink at narrow widths, and retain native horizontal scrolling for longer drafts. The spacer receives remaining space after editor growth, so USD stays close to the second editor and Clear sits at the logical end. It is invisible, non-focusable and has no value. Without capped editors there may be no space left for it. Physical arrangement and typography remain backend responsibilities; no business CSS or empty text segment is needed.

## Actions and editing lifetime

```vue
<UiButton @click="clear">Clear</UiButton>
<UiButton allow-when-readonly @click="copy">Copy</UiButton>
```

Inside a readonly frame, Clear is blocked by default; Copy explicitly opts into activation. Disabled/loading still blocks both. Authors are responsible for selecting appropriate callbacks; the opt-in does not unlock value editing. Reset actions remain blocked under readonly. Bound submit/reset buttons preserve their native form event routes. Form ownership and session lifetime are unchanged.

Internal focus movement does not finish a compound edit. Leaving the whole interaction requests validation. Suggestion acceptance changes the draft without requesting whole-field validation inside a frame; the owner's checked-field revalidation still applies. Standalone text editors retain their ordinary blur and suggestion-validation behavior. Owned popups report engagement and release it on close/deactivation/disposal. Focus prefers the currently attributed invalid editor, then an available editor. Empty-surface clicks cannot steal action activation.

Use `disabled` to remove the whole frame from interaction: its wrapper cannot receive focus, its editors/actions are disabled, and focus already inside the surface is released. Use `readonly` when the value should remain available for focus, selection and inspection without editing. Business authors supply these restrictions; backend views own the matching state paint and native focus mechanics. Verify live toggling, clicks on empty surface areas, Tab traversal and focus-handle results alongside editor/action restrictions.

## Supported children and boundaries

UiTextInput (single-line), UiButton, UiIcon, UiSpacer and UiPopover declare participation internally. Unknown components are rejected even if they contain one of these components. UiLayout and UiStrategy are not automatic forwarders: place them around the frame, or implement a declared composition which forwards only its designated children. A custom component must declare and implement the contract below. This avoids accidental whole-field writes and styling changes through unrelated Vue wrappers.

Text/comments and Vue fragments are structural content. Compiler-hoisted static native markup is checked against the same passive-content rules. Passive native wrappers are span, div, p, strong, em, b, i, small, s, u, sub, sup, abbr, bdi, bdo, code, kbd, samp, time, br and wbr. They are traversed without granting a value binding. Focusable/editable wrappers and native event handlers require a cooperating component. Native controls and direct nested frames are not supported children. Direct async wrappers and Vue Teleport/Transition/Suspense/KeepAlive are not automatically transparent; encapsulate their behavior in a declared participant. HTML/third-party content remains available elsewhere in applications.

UiPopover forwards only its host slot through discovery. Its content/header/actions/footer render outside automatic frame ownership. An editor there needs its own UiField or an explicit operation on the owning participant. Physical teleporting does not create this boundary. An independent UiField inside that outside content may host a separate frame; it is not a nested owner of the original surface.

## Implementing a custom participant

The declaration is static Vue component metadata, discoverable before setup. For a composition which forwards selected children:

```ts
import { defineComponent, h } from 'vue'
import { UiTextInput, defineUiInputFrameContract, useUiInputFrameParticipant, renderUiInputFrameChildren } from '@uninterface/uninterface'
export default defineComponent({
  name: 'NamedEditorComposition',
  uiInputFrame: defineUiInputFrameContract({ role: 'composition', forwards: true }),
  setup() {
    const participation = useUiInputFrameParticipant()
    if (!participation) throw new Error('NamedEditorComposition requires UiInputFrame.')
    return () => renderUiInputFrameChildren([h(UiTextInput)], participation)
  },
})
```

In a script-setup SFC, put the same `uiInputFrame` option in defineOptions using the imported declaration helper. Built-ins need no consumer annotations. `forwards: true` permits use of the shared forwarding helper; it does not automatically authorize descendants. Forwarders retain the same field owner and propagate tightened restrictions.

An editor-role extension uses useUiInputFrameParticipant with its focus handle and optional projection/restrictions. Render its `value`, `label`, `binding`, `descriptionBinding`, `readonly` and backend `frame`; report text through `update`. Its implementation must adapt a real editor to the selected backend's shared surface. The runtime helper handles value coordination and focus registration, not native DOM styling. Backend-neutral behavior does not certify universal rendering compatibility. Opaque third-party editors require an integration implementation.

For a backend-specific extension, the implementation can use the selected backend's ordinary text view. This example requires a frame and exposes native focus; business consumers use only the extension component. Backend selection/assembly belongs to application setup.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { defineUiInputFrameContract, useUiInputFrameParticipant } from '@uninterface/uninterface'
import type { UiFocusHandle } from '@uninterface/uninterface/backend'
import TextView from '@uninterface/backend/UiTextInput.vue'
defineOptions({ uiInputFrame: defineUiInputFrameContract({ role: 'editor' }) })
const view = ref<UiFocusHandle>()
const participation = useUiInputFrameParticipant({
  focus: () => view.value?.focus() ?? Promise.resolve(null),
})
if (!participation) throw new Error('ReferenceEditor requires UiInputFrame.')
const input = participation
</script>
<template>
  <TextView
    ref="view"
    :binding="input.binding.value"
    :description-binding="input.descriptionBinding.value"
    :frame="input.frame"
    :value="input.value.value"
    :aria-label="input.label.value"
    :readonly="input.readonly.value"
    type="text"
    inputmode="text"
    autocomplete="off"
    @update="input.update"
  />
</template>
```

A multi-editor wrapper declares `composition`, then forwards ordinary editors with distinct projections. It must not also register itself as a whole-value editor. A component which renders its own native editor declares `editor` and registers exactly that target, as above. Both may declare forwarding when they additionally own a cooperating action or popup. Passive content implementations need no value access; the declaration alone promises their passive behavior.

A custom popup forwarder calls renderUiInputFrameChildren for its reference and renderUiInputFrameOutside for outside content. It reports its actual open interaction through setEngaged and coordinates dismissal/focus return. Outside content receives neither implicit field access nor the parent's surface owner. Arbitrary callbacks can still explicitly reference business controls; no runtime protocol can prove that a custom author respects every obligation.

Outside a frame, useUiInputFrameParticipant returns undefined. Each custom component must either implement standalone behavior or fail explicitly as above. Ordinary built-in controls retain their documented standalone use. Registration is released on disposal and excluded on deactivation; late update/engagement callbacks cannot change a disposed participant. Keep focus callbacks honest about hidden/detached/disabled targets.

## Editor width bounds

For a search editor that must remain comfortably editable in a content-sized row, use `<UiTextInput type="search" :min-width-characters="20" />` inside UiInputFrame. The minimum covers the editor allocation; the frame's padding and actions add space. Backend fonts determine the width of each `ch` cell. The enclosing layout allocates the complete compound control; no business CSS is needed.

Use `maxWidthCharacters` when an editor should stop growing, such as a short amount. Both bounds are positive integers; minimum must not exceed maximum. Neither changes allowed input length. An explicit minimum is strict: a host narrower than that minimum can overflow, so choose appropriate bounds for the available space. Supported backends declare `input.frame.min-width.v1` for the minimum and `input.frame.sizing.v1` for the maximum/spacer facility. The Shared input frame keyword example and Collections built-in search presentation use a 20-cell minimum; other editors retain their defaults.

## Verification and backend obligations

Exercise a scalar editor, two named projections and an actual custom editor with an owned popup. Check draft/accepted values separately, zero versus empty, sibling preservation, clear versus reset, live restrictions, native form association, field-error attribution, labels and feedback. Reject unknown/unforwarded children and duplicate/wrong-owner targets. Hide/show a participant without losing the field draft; unmount it during popup engagement.

Backends declare input.frame.cooperation.v1 and own contextual editor/action appearance. Native differences remain documented in each backend's presentation guide. Browser checks must cover geometry, selection, IME, search clearing, narrow widths, supported sizes, custom themes, hidden labels, RTL and dark mode. Automated contrast gates are backend/application policy; support declarations and DOM passes are not a universal visual acceptance claim.

See [UiInputFrame](../api/components/UiInputFrame.md), [UiTextInput](../api/components/UiTextInput.md), and the lower-level [backend surface protocol](control-frames.md).
