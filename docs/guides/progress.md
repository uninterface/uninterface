# Presenting operation progress

Use [`UiProgressBar`](../api/components/UiProgressBar.md) to describe completed work or ongoing work with an unknown total. Both modes render a horizontal bar. Use a meter or another business presentation for measurements such as disk usage that do not describe task progress.

## Ownership and consumer obligations

The producer owns the operation, precise progress, total units, failure, cancellation, retry and outcome. The bar observes props and owns no task. Supply a meaningful localized `aria-label`, and update value/max together in consistent units. Core validates the range and derives the exact fraction; backend presentation supplies layout, native widgets, optional numeric text, motion and theme values.

```vue
<!-- completed/total can be record counts or byte counts. -->
<UiProgressBar
  aria-label="Importing customer records"
  :value="total === null ? null : completed"
  :max="total ?? 100"
/>
<!-- A task whose extent is unknown still has a bar. -->
<UiProgressBar aria-label="Preparing report" />
```

The measured example requires a positive known total. If total is zero, omit the bar when there is no work; while waiting for an operation outcome use null value and a positive/default max. Never fabricate a measured percentage for unknown work. Known zero (`value=0`) is distinct from unknown (`value=null`). Report fractional precision; the backend can round visible percentage text without rounding the underlying value or fill.

The bar has no automatic live region and never moves focus. A surrounding composition owns announcements and any loading-region `aria-busy` relationship. Provide localized `aria-valuetext` when business units are more useful than the default percentage, such as “37 of 120 records.” This text is not a visible caption. Put any visible task title/status in surrounding content and keep it consistent with the accessible name. A full bar does not establish success: transferring all bytes may precede server confirmation. The owner decides when to replace it with an outcome or hide it.

## Upload composition

[`UiUploadProgress`](../api/components/UiUploadProgress.md) and its use inside `UiUploadRegion` compose the same backend bar view. Keep using their existing upload bindings; ordinary consumers do not reconstruct progress internals. The upload owner retains file identity, cancellation, retry, errors, task lifetime and announcement policy. Unknown and zero totals during activity use an indeterminate bar. Failure replaces the bar with feedback/recovery; successful completion hides its upload presentation. `progress=false` in a region omits activity without omitting required failure feedback/actions.

## Presentation

The bar fills the offered inline allocation, follows the writing direction and respects the user's reduced-motion preference. The backend owns thickness, motion and visual treatment. The `color` prop accepts supported theme roles and defaults to `primary`. The producer supplies explicit success or failure feedback when needed. No progress-specific strategy is required. Consult your backend's progress guide for its native mapping and supported theme roles.

## Observable acceptance

1. Render a standalone bar without uploads. Check measured zero, a precise fraction, full progress, unknown work and mode transitions. Original values/ranges remain accurate; full progress stays visible.
2. Reject invalid ranges instead of silently changing business data. Unknown mode exposes no numeric current value or invented percentage and remains a bar.
3. Exercise upload unknown/known/zero totals, failure/cancel/retry and completion. Verify one filename/announcement owner and producer-owned lifetime after view unmount.
4. Inspect narrow/wide, LTR/RTL, light/dark and reduced motion in browsers. Confirm a visible unknown segment, contained paint, meaningful screen-reader name/value, and absence of unnecessary focus stops. Record actual environments; DOM assertions alone do not establish paint or assistive-technology acceptance.
