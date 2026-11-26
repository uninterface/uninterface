# Feedback and record details

Business state decides what happened and what can be done next. UiNotice displays that message, UiBadge identifies a status, and UiKeyValueList/UiKeyValueItem present read-only properties. None owns requests, record loading, retry or data formatting. UiNotice supplies optional dismissal interaction; business code owns acceptance and visibility.

```vue
<UiNotice kind="error" title="Could not load the customer" announcement="polite">
  Your current selection is retained.
  <template #actions><UiButton @click="retry">Retry</UiButton></template>
</UiNotice>
<UiKeyValueList aria-label="Customer details">
  <UiKeyValueItem label="Name">{{ customer.name }}</UiKeyValueItem>
  <UiKeyValueItem label="Status"><UiBadge color="success">Active</UiBadge></UiKeyValueItem>
  <UiKeyValueItem label="Notes">{{ customer.notes || 'Not provided' }}</UiKeyValueItem>
</UiKeyValueList>
```

Localize messages and format dates/numbers with the application's Intl configuration. Distinguish absent, zero, false and redacted values deliberately. For protected properties, omit data before rendering; a presentation component is not access control.

An empty result, loading message and completed operation are compositions of notice, ordinary content and actions. Keep business requests owned and cancelled or ignored after disposal. Pending actions use UiButton loading. A modal returning error and a failed form submission can each supply a notice, but the notice never catches or interprets their errors automatically. Render safe localized messages rather than raw server errors.

A static warning or error does not automatically interrupt a screen reader. Choose announcement independently and leave a live region mounted before its text changes. Polite is usually appropriate for a user-requested outcome. Assertive is for an urgent interruption. Avoid duplicate live regions when existing form/source components already announce the same outcome. Notices never take focus. If dismissing a focused action removes it, the business composition must return focus to a meaningful destination.

Badges are passive, do not imply click behavior or dismissal, and use words as well as color. Definition-list children must be items (or components rendering items); rich layouts belong inside values. Backend defaults arrange each label/value pair in two columns and stack on narrow screens, with logical properties for RTL. No author CSS is required. Specialized layout strategies and attached count bubbles are outside this implemented scope. Managed toast queues and rich notifications are covered in [toasts and notifications](toasts-and-notifications.md).

Observable checks: recover after a failed request; distinguish empty from failure; retain an opaque rich value across status updates; inspect definition-list semantics and accessible links; ensure static errors have no alert role; update polite and assertive messages; verify long text and narrow/RTL layouts. DOM checks cover semantics and identity, while visual and assistive-technology announcement acceptance require a browser.

## Controlled dismissal

Use `dismissible` for a conventional close affordance. The backend renders its own close control; `dismiss` requests a decision without changing visibility. Do not reconstruct ordinary dismissal as an action button. Acknowledging a business decision remains a separate action.

```vue
<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { UiButton, UiNotice } from '@uninterface/uninterface'

const showWarning = ref(true)
const nextAction = ref<InstanceType<typeof UiButton>>()
async function dismissWarning() {
  showWarning.value = false
  await nextTick()
  await nextAction.value?.focus()
}
function review() { /* Start the application's review operation. */ }
</script>

<template>
  <UiNotice v-if="showWarning" kind="warning" dismissible @dismiss="dismissWarning">
    Changes have not been published.
  </UiNotice>
  <UiButton ref="nextAction" @click="review">Review changes</UiButton>
</template>
```

No handler, or a handler that leaves the notice mounted, declines dismissal. A handler may await a business decision; while it waits the notice stays usable and additional requests remain possible. The owner coordinates any pending decision. Removing a notice does not resolve its underlying business condition; remembering dismissal across navigation or showing it again is application policy. If visibility changes programmatically while focus is elsewhere, preserve that focus rather than always moving it.

The actions slot accepts ordinary UiButton siblings in source order. These buttons automatically default to text presentation: authors need no repeated variant prop, strategy declaration, or CSS to obtain integrated notice actions. Text treatment keeps the message prominent while preserving a real button target and interaction feedback. Use an explicit variant when a particular action needs another treatment; an agreed regional uiButtonVariant strategy also takes precedence over the notice default. The default covers directly supplied buttons, including fragment/conditional/list output and native HTML wrappers. Custom components remain opaque and own their internal button presentation; buttons in the notice body and outside it are unaffected. Size and semantic color remain independent, and notice severity does not make an action destructive. Backends supply spacing and wrapping below the message, without business-side CSS. Keep action labels concise and localizable. Custom nested compositions and third-party content must fit their available space. Severity icons follow backend defaults; icon presence is not portable, so the message itself must communicate the condition.

Acceptance: verify ordinary actions receive text treatment, explicit variants and regional preferences remain effective, and changing presentation retains action identity, focus, loading and disabled behavior. Check text-action readability on the selected notice surface, including filled notices; the default does not imply automatic foreground inheritance. Decline a close request and confirm that content, draft and focus survive; accept it and verify removal and focus handoff; toggle dismissibility and language; activate close with Enter/Space inside a form without submission; check several actions and long text in narrow LTR/RTL hosts. Automated DOM checks establish ownership and semantics. Real focus paint, geometry and assistive-technology announcements require browser/AT verification.

## Notice kind, color, icons and variants

Choose a standard kind for information, success, warning or error. It supplies both the semantic color and a default icon. Use `kind="custom"` when the message has no predefined severity; optional `color` selects a supported theme role, and omission is neutral. Color belongs only to custom notices. Announcement remains independently off, polite or assertive.

```vue
<UiNotice kind="custom" color="primary" title="Scheduled maintenance">
  Service will resume at 18:00.
</UiNotice>
<UiNotice kind="info" variant="outline" title="Export available">
  <template #icon><UiIcon name="download" /></template>
  Your report is ready to download.
</UiNotice>
```

The icon slot always takes precedence, including for standard kinds. Without a slot, kind chooses the icon; custom chooses none. An intentionally empty slot suppresses the default. Icon content is decorative and noninteractive; backends hide it from assistive technology and constrain it to their icon space. Authors retain meaningful text and place actions in the actions slot. This avoids duplicate icon announcements while preserving the message's meaning.

Ordinary usage needs no variant. Explicit `filled` requests a strong color surface, `outline` a border without tinted fill, and `soft` a low-emphasis tint; soft leaves border treatment to the backend. These requests do not change severity, announcement, dismissal, content lifetime or focus. Backends use the installed theme's values:

Concrete native variant mappings are documented by each backend.

Custom notices without a color use a neutral treatment without leaking inherited semantic colors. Rich content remains ordinary block content. Exact icon artwork and native variant fulfillment belong in backend documentation.

Observable acceptance: swap kind/color/variant and slot presence without remounting content or losing focus; ensure custom color creates no automatic icon; ensure a supplied or empty slot replaces standard icons; reject color on standard kinds and unsupported theme roles. Check all treatments in light/dark, narrow/RTL and long-text contexts, including readable close controls and operable actions. Physical paint, geometry and assistive-technology acceptance require browser evidence.


Text action content aligns with the message column through backend-owned presentation. Backends coordinate native insets and interaction feedback while retaining control height and visible keyboard focus. Ordinary business code supplies UiButton actions without styling this arrangement. Custom action compositions own their internal alignment. See the [UiNotice reference](../api/components/UiNotice.md) for alignment guarantees; verify narrow/wide LTR and RTL, wrapping, sizes and hover/focus in a browser.

For operation feedback with controllable delivery lifetime, use [feedback routing](feedback-routing.md) and a bound UiNotice. Direct declarative notices remain supported; the owner-accepted dismissal examples above describe unbound notices.

For measured or unknown operation progress, use [UiProgressBar](progress.md). Its bar observes the producer without owning operation lifetime or announcements.
