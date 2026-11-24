# Route feedback to a placed notice

Feedback routing connects an operation to a business-chosen inline destination. Create a virtual target, connect a route to it, and place a bound [UiNotice](../api/components/UiNotice.md) above fields, a table or modal content. No feedback-area component or required provider is involved. This page covers UiNotice targets; [toasts and notifications](toasts-and-notifications.md) supply additional automatically presented destinations.

```vue
<script setup lang="ts">
import { onScopeDispose, ref } from 'vue'
import {
  UiNotice, UiButton,
  createUiFeedbackTarget, createUiFeedbackRoute,
} from '@uninterface/uninterface'

const messages = createUiFeedbackTarget()
const feedback = createUiFeedbackRoute({ target: messages })
const saveButton = ref<InstanceType<typeof UiButton>>()
function save() {
  // Deliver after your operation has established its current outcome.
  const item = feedback.send({
    kind: 'success', message: 'Saved',
    dismissible: true, announcement: 'polite',
  })
  // item.update({ message: 'Saved and synchronized' })
  // item.dismiss()
}
onScopeDispose(() => {
  feedback.dispose()
  messages.dispose()
})
</script>
<template>
  <UiNotice
    :binding="messages.bindings.notice"
    @dismiss="saveButton?.focus()"
  />
  <UiButton ref="saveButton" @click="save">Save</UiButton>
</template>
```

The target retains one current delivery. Sending again replaces it; replaced, dismissed, reset and disposed handles are inactive. Their updates/dismissals are harmless and cannot affect a successor. `item.active` is reactive. `item.update(patch)` merges content; `item.update(getter)` replaces the content source. Sending the same text again is a new delivery. The inline target uses replacement. Floating targets have independently configured admission/queue policies.

A bound notice infers visibility from the binding. With no delivery it renders no view. Direct children of UiLayout/UiFlowLayout/UiGridLayout and supporting UiRegionLayout slots release their allocation; these layouts observe an explicit core-component participation predicate. Arbitrary business wrappers remain opaque and must manage their own conditional allocation. No parent template is rewritten. Removing a borrowing notice view does not dismiss feedback or dispose its route: it can be placed again against the same target. Create the target at the lifetime that should own the feedback, for example in an editor's owning session, or outside a dialog for feedback that must survive dialog removal.

## Content, translations and actions

`send` accepts [UiFeedbackMessage](../api/types/UiFeedbackMessage.md) or a pure getter returning one. Use per-property `UiTextSource` functions for translated text, or a whole-message getter when other reactive content or structure changes, so updates do not create another occurrence or revive dismissed feedback:

```ts
const item = feedback.send(() => ({
  kind: 'error',
  message: t('save.failed'),
  details: form.state.issues.map(i18n.text),
  actions: [
    { key: 'retry', label: t('retry'), binding: retryButton, color: 'primary' },
    { key: 'details', label: t('details'), color: 'secondary', onClick: showDetails },
  ],
}))
```

Here `t`, `i18n`, `form`, `retryButton` and `showDetails` are application-owned dependencies. The source getter must be side-effect free; it can be evaluated during layout and presentation. Plain object values are snapshots unless their reads are reactive. Message/details/title/labels are text, never interpreted as HTML. Backends own body and list markup.

Actions use ordinary UiButtons, including notice text-variant defaults, semantic color, explicit variant, tightening local disabled state, and native form association. Keys must be stable and unique within the message. A binding owns activation, loading and type; do not combine it with `onClick`, `loading` or `type`. An unbound action supports manual `onClick`, loading and type. Native submit/reset bindings still require their matching UiForm; an external action supplies `form` with that form's ID. The router does not emulate submission or infer loading from a returned promise. Use the `actions` slot for icons, rich labels, extra attributes, exposed focus handles or arbitrary business compositions.

The notice's default slot replaces the generated message and details; the actions slot replaces generated actions. Both receive `{ feedback }`. The icon slot retains its existing meaning. Explicit notice props override corresponding delivered presentation values, so a destination may consistently choose its announcement policy. Unbound UiNotice behavior is unchanged.

## Reset and lifecycle

Both reset functions are stable, context-free callbacks:

```ts
feedback.reset() // clear only this route's current delivery
messages.reset() // clear the target, regardless of which route sent it

// Optional application integration: subscribe to accepted form resets.
const unsubscribe = form.onReset(feedback.reset)
onScopeDispose(unsubscribe)
```

The form's native Reset button still uses `form.bindings.resetButton`. Its existing reset event path resets the form and then notifies subscribers. Pending or failed resets do not notify. A custom business reset action can call `feedback.reset()` directly. There is no watched reset-signal option or second button-click path. See [UiFormControl](../api/types/UiFormControl.md) for subscription cleanup and listener exceptions.

`route.dispose()` clears only its own current delivery and rejects future sends. `target.dispose()` clears every delivery and rejects sends from every connected route. Both are idempotent. Reset after disposal and operations on inactive item handles are harmless. A route cannot determine whether a later asynchronous `send` belongs to an obsolete operation: producers must retain their generation/session/cancellation guards.

Dismissal changes delivery state only. It does not resolve validation errors, change form drafts/baselines, retry operations or choose a persistence outcome. A bound close button dismisses the current item and emits `dismiss`; programmatic dismiss/reset/disposal do not emit a view event. The business composition handles focus after removing a focused close/action control. Do not move focus when unrelated background feedback clears.

Announcement urgency remains independent of severity. Arrival never moves focus. Existing notice live-region behavior applies: initial insertion/remount announcements depend on browser and assistive technology; a bound notice is not a persistent hidden announcer. Avoid rendering one binding at several simultaneous announcing destinations. See [feedback and details](feedback-and-details.md) for announcement and focus guidance.

## Observable checks

Verify replacement and stale-handle isolation, route-scoped versus target-wide reset, accepted native form reset, pending-reset rejection, disposal and pre-mount delivery. Change language without reviving dismissed content; hide/remount the borrowing view without losing or recreating the delivery. Exercise bound/manual actions, loading/disabled guards, slots, focus handoff and empty layout allocation. DOM tests verify state and semantic wiring across supporting backends; real announcement behavior, keyboard focus paint and narrow/RTL geometry require browser/assistive-technology checks.

For fixed message structure, prefer `feedback.send({ message: () => t("save.failed"), actions: [{ key: "retry", label: () => t("retry"), onClick: retry }] })`. Individual title/message/detail/action-label functions are resolved by UiNotice; its default/actions slots receive resolved feedback text. Binding.current retains source definitions. See [text sources](text-sources.md) for lifecycle, consumer obligations and observable checks.
