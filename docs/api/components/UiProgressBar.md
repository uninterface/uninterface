# UiProgressBar

A passive horizontal progress bar for an operation. Both measured and unknown progress use bar format. Import from `@uninterface/uninterface`.

## API

| Prop | Default | Meaning |
| --- | --- | --- |
| `aria-label: string` | Required | Nonempty accessible task name; adds no visible caption. |
| `value?: number \| null` | `null` | Completed work; omission/null means indeterminate progress. |
| `max?: number` | `100` | Finite positive total, in the same units as value. |
| `aria-valuetext?: string` | Omitted | Localized accessible value wording, such as “37 of 120 records”; not a visible caption or announcement request. |
| `color?: UiThemeColor` | `primary` | Semantic theme role; omission selects primary. |
| `zOrder?: UiZOrder` | Shared default | Outward [stacking](../../guides/dynamic-z-order.md). |

No slots, events, exposed methods, two-way binding or task/control factory. Standard root attributes target the backend's semantic progress root. Native toolkit-specific inputs are outside this API.

```vue
<UiProgressBar aria-label="Generating report" :value="42" />
<UiProgressBar aria-label="Importing records" :value="imported" :max="total" />
<UiProgressBar aria-label="Preparing export" />
```

Measured progress requires a finite value in `0..max`; invalid names, totals and values fail explicitly. `value=0` means known zero progress. Null means unknown, including when switching modes on the same mounted component. Values retain fractional precision; presentation formatting may round text. `max=1` accepts fractions, and other positive totals accept business counts or bytes. There is no separate minimum or indeterminate flag.

`value=max` fills the bar and retains it. It does not declare success, emit completion or change color. The producer owns outcomes, cancellation, retry and visibility. A zero total has no meaningful fraction: omit the bar if there is no work, or use null value with a positive/default max while an operation remains active.

## Implementation responsibility

Core validates semantic inputs, validates explicit theme roles and resolves the exact fraction. A dedicated statically imported backend view owns markup, native widget integration, dimensions, formatting, motion and styling. Requires `progress.bar.v1`. The bar fills its offered inline allocation without requiring author CSS. It has no default tab stop, focus movement or live region; unknown progress exposes no numeric current value or percentage. Reduced motion retains a distinguishable unknown-progress bar. Backends preserve original measured range/values even when their native paint input uses percentages.

[`UiUploadProgress`](UiUploadProgress.md) composes the same backend bar implementation while retaining file identity, action/failure presentation and announcement ownership. It treats active unknown/zero totals as indeterminate, and removes the bar on failure, cancellation or completion according to its existing workflow.

See the [progress guide](../../guides/progress.md) for ownership, examples and verification.

## Observable verification

Check standalone and upload-hosted bars for precise values/ranges, known zero, unknown and transitions; a full standalone bar remains mounted. Unknown progress must be a bar with no current amount. Verify localized naming/value wording, no default focus or live region, all supported semantic colors, narrow allocation, light/dark, LTR/RTL and reduced motion. Check upload failure without a bar, one announcement owner and unchanged action/lifetime behavior. DOM evidence, browser paint/geometry, visual acceptance and assistive-technology observations are separate forms of evidence.
