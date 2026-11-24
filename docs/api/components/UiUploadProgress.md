# UiUploadProgress

Reusable presentation of an upload attempt, including activity and transfer-failure recovery, independent of a region or popup. Import from `@uninterface/uninterface`. Backends own progress, failure feedback and Cancel/Retry presentation.

```vue
<UiUploadProgress :binding="upload.bindings.progress" announcement="polite" />
```

## API

Required `binding: UiUploadProgressBinding`; optional `cancel?: boolean` and `retry?: boolean` default true and `announcement?: off | polite` defaults off. No slots, events or exposed methods. Renders the progress indicator for queued/uploading only. Transfer failure replaces it with concise feedback and available Cancel and Retry actions; a failed upload has no progress indicator. Unknown or zero total uses an indeterminate horizontal UiProgressBar; a positive known total uses the precise reported loaded/total. Reaching the reported byte total does not mark a task complete. Completion hides the presentation. Cancellation has no error message; an optional producer-supplied Retry can remain, otherwise the presentation hides.

Activity and failure share a top/bottom arrangement: filename above, then a context area (progress or failure message) and available action buttons beside it. The context area receives the remaining space and actions stay content-sized at the logical end. Without actions, context uses the full allocation. The context area is private backend composition, not an author slot. This arrangement does not depend on a demo/card ancestor or measured versus indeterminate progress.

Failure feedback uses the backend theme's danger/error foreground as well as visible error text. In a standalone presentation, the complete message wraps within the context area, including unbroken text; actions stay aligned with the start of that area. If the content area and actions cannot fit side by side, actions continue below at the logical end. This is deliberate feedback reflow: a multiline standalone message can increase presentation height. Do not clip the message or compress button labels to retain one row. Inside the fixed allocation of UiUploadRegion, its concise single-line summary rule applies instead: ellipsis retains full DOM text, title and Retry's feedback association. Business error messages should remain concise and actionable.

Cancel appears only when requested and available. Its localized visible label is “Cancel”; its accessible name is “Cancel upload”, preserving context for independent control navigation. The upload-region Cancel action uses the same labels. Cancel invokes its supplied guarded binding. In failure, it abandons recovery through the producer; the workflow clears the failed attempt and Retry option without changing a retained destination. It does not retry or merely hide the error. Retry likewise invokes the producer-supplied retry binding, which rechecks permission and starts a new attempt; the view never creates tasks or deletes files. Use `createUiUploadProgressBinding(task)` for an independently created task; workflow bindings already follow the current task.

## Ownership and implementation

The host chooses placement/visibility and one announcing instance; the component never owns task lifetime. UiUploadRegion reuses this presentation internally without author slots. Its progress flag controls the activity indicator; essential transfer feedback and selected Retry remain available when that indicator is omitted. Its actions selection controls the single Cancel, hosted alongside Retry in transfer recovery. External hosts can reuse this component without copying progress state. See [files](../../guides/files.md).

Byte progress is described by [UiUploadProgressValue](../types/UiUploadProgressValue.md). This component composes [UiProgressBar](UiProgressBar.md), requires `progress.bar.v1`, uses `upload.progress.v1` and has an independently imported backend view.

The supplied fileName is visible within the component during activity and recovery and also names the presentation group. Long names may ellipsize while retaining the full text in the DOM and title. UiUploadRegion omits its separate filename when this presentation supplies it; the component does not become a new file owner. Retry describes its associated failure through aria-describedby. Candidate rejection and delivery failure are not transfer errors and must not be presented as a request to retransmit bytes.

Numeric percentage formatting belongs to the backend; authors should report precise loaded/total values. A rounded visible percentage must not round the underlying progress or bar value. The indicator communicates progress visually; its label names it for assistive technology. A requested polite announcement is off-screen, locally contained and shown once. No extra visible “Uploading” caption is required.

## Observable verification

Verify visible file identity above progress or failure in separate progress and failure cases and cancellation with Retry, one filename when composed in UiUploadRegion, failure without a progressbar, one error/Retry per presentation, native danger/error color in both modes, complete multiline/unbroken standalone feedback and deliberate narrow wrapping. Check bounded summary/action fitting separately at the region's declared minima. Verify producer-gated retry following the new attempt, keyboard context through pending and immediately failing retries, no focus theft from another control, safe localized error text, unknown/known/zero-total reporting, action permissions, terminal hiding, external progress while acquisition stays locked, and no duplicate internal Cancel or announcements. Unmounting this view must not cancel its task.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
