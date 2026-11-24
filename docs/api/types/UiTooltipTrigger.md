# UiTooltipTrigger

Supplemental descriptions: `UiTooltipTrigger` is exported from `@uninterface/uninterface`.

## API

```ts
export type UiTooltipTrigger = 'hover' | 'focus' | 'click'
```

## Ownership and implementation

The tooltip supplies supplemental noninteractive information. Its host slot forwards trigger attributes to one real target. The backend owns placement and native surface behavior; core owns requested visibility. Essential instructions must remain available independently.

See the [supplemental descriptions guide](../../guides/navigation-and-tooltips.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify focus/hover activation, Escape dismissal, existing descriptions, and no blocked host action.
