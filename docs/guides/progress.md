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

## Backend adaptations

| Backend | Mapping and limits |
| --- | --- |
| Plain | Own reference track/fill with one semantic progress root. Unknown mode moves a segment; reduced motion retains a static partial segment. Theme roles set the fill. |
| Bootstrap | Native `.progress`/`.progress-bar`, native default tokens and semantic theme roles (primary by default). Unknown mode adds a moving segment because the native structure has no indeterminate mode; reduced motion fixes that segment in place. |
| Element Plus | Native line `ElProgress`. Known percentage text is localized; ARIA retains original value/max. The native unknown segment width is private paint, never a measurement. Unknown mode suppresses percentage text. |
| Nuxt UI | Native horizontal `UProgress` for paint. A semantic host exposes the original range/name, with native visual markup hidden from assistive technology to avoid an unnamed duplicate. Adapter CSS preserves exact fill because the native component rounds paint to integer percentages. |
| Vuetify | Native `VProgressLinear` receives original value/max and native indeterminate mode. No clickable or completion behavior is enabled. |

Each backend fills the offered inline allocation, supports logical direction, and respects reduced motion. Appearance and thickness are implementation-owned. The `color` prop accepts supported theme roles (`primary`, `success`, `danger`, `warning`, `info`, `secondary` and declared extensions), defaulting to `primary`. It does not encode success/failure automatically. No progress-specific strategy is required for ordinary use. All five expose `progress.bar.v1`; capability declarations alone are not browser or assistive-technology acceptance.

## Observable acceptance

1. Render a standalone bar without uploads. Check measured zero, a precise fraction, full progress, unknown work and mode transitions. Original values/ranges remain accurate; full progress stays visible.
2. Reject invalid ranges instead of silently changing business data. Unknown mode exposes no numeric current value or invented percentage and remains a bar.
3. Exercise upload unknown/known/zero totals, failure/cancel/retry and completion. Verify one filename/announcement owner and producer-owned lifetime after view unmount.
4. Inspect narrow/wide, LTR/RTL, light/dark and reduced motion in browsers. Confirm a visible unknown segment, contained paint, meaningful screen-reader name/value, and absence of unnecessary focus stops. Record actual environments; DOM assertions alone do not establish paint or assistive-technology acceptance.
