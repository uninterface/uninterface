# UiBadge

A passive text label for a status, category or count. Import from `@uninterface/uninterface`.

`color?: UiThemeColor` defaults to secondary. The default slot supplies its visible text; include the meaning in words, not color alone. Attributes target the badge root. No events, methods, dismissal, click action, automatic live role or overlay positioning are provided. Counts should include context in the surrounding text or label. Use UiButton for an action.

Core validates the theme color and registers strategy target badge. Backend owns the inline label, typography and toolkit color mapping. Requires badge.v1. Verify all declared theme colors, long labels, dynamic text updates and absence from the keyboard tab sequence. See [feedback and details](../../guides/feedback-and-details.md).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
