# UiFeedbackSendOptions

Import from `@uninterface/uninterface`.

Optional second argument of a floating route's send: `duration?: number | null` overrides target default; `content?: (context: UiFeedbackContentContext) => VNodeChild` supplies that delivery's Vue slot. No content means default message/details. Custom content replaces the body but retains title, summary announcement and declared standard actions. Content must be a function, not an HTML string or cached global VNode. Inline notice routes do not accept these options. Core validates lifetime and mounts stable keyed deliveries; backend owns presentation. Verify default/custom mixing, deferred mounting, metadata updates and per-item persistence.

See [toasts and notifications](../../guides/toasts-and-notifications.md) for complete examples, consumer obligations and acceptance.
