# UiNoticeBinding

Import this type from `@uninterface/uninterface`.

Producer-independent notice projection: `readonly target: 'notice'`, `readonly current: UiFeedbackMessage | undefined`, and `dismiss(): void`. The target supplies it as `target.bindings.notice`. Undefined current content makes a bound UiNotice inactive. Its close control calls dismiss and emits the view's dismiss event; programmatic binding dismissal emits no view event. Core handles visibility and action composition; backend notice.binding.v1 renders normalized text/details. View removal does not dispose the target. Verify inferred visibility, remount retention, dismissal and direct layout allocation release.

See [feedback routing](../../guides/feedback-routing.md) for ownership, complete examples and observable acceptance.

`current` retains the delivery's text sources. UiNotice resolves title, message, each detail and action label before passing content to backend views or notice slots. See [text sources](../../guides/text-sources.md).
