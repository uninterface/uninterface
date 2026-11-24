# UiProgressBarProps

Inputs for passive observation of operation progress. Import from `@uninterface/uninterface`.

## API

```ts
interface UiProgressBarProps {
  'aria-label': string
  value?: number | null
  max?: number
  'aria-valuetext'?: string
  color?: UiThemeColor
  zOrder?: UiZOrder
}
```

`aria-label` is required and nonempty. Max defaults to 100 and must be positive/finite. Null/omitted value selects an indeterminate horizontal bar; a numeric value must be finite and within `0..max`. Optional localized value text changes accessible wording only. Explicit color selects a supported theme role; omission selects `primary`. See [`UiProgressBar`](../components/UiProgressBar.md) for defaults and complete behavior.

## Ownership and implementation

The producer supplies progress, units, meaningful localized naming and operation lifetime. The component observes props without owning a task, cancellation, retry, success or announcements. Backends own paint/native integration; core preserves precise numeric meaning. See the [progress guide](../../guides/progress.md).

## Observable verification

Verify valid ranges/fractions, explicit rejection of invalid inputs, unknown versus zero progress, original accessible range, mode changes, and no completion event/automatic hiding at max.
