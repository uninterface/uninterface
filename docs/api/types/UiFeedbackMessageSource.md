# UiFeedbackMessageSource

Import this type from `@uninterface/uninterface`.

`UiFeedbackMessage | (() => UiFeedbackMessage)`. A pure reactive getter keeps translated content and availability live without a new delivery. A plain object is a snapshot unless its property reads are reactive. Getter evaluation may occur during layout or rendering; do not send feedback or change business state from it. Core resolves the source, and the backend presents normalized content. Verify changing locale updates an active message and never revives one dismissed earlier.

See [feedback routing](../../guides/feedback-routing.md) for ownership, complete examples and observable acceptance.
