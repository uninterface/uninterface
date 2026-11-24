# createUiNotificationTarget

Import from `@uninterface/uninterface`.

`createUiNotificationTarget(options?: UiFeedbackTargetOptions): UiFloatingFeedbackTarget` creates a notification destination in the current application during component setup. The creating component scope owns its lifetime. Connect createUiFeedbackRoute and send ordinary messages or per-delivery rich content. There is no required host/provider component. The creation scope captures logical providers (including modal portal/theme/i18n), and automatically disposes the target on teardown; application disposal also cleans up SSR request state. Explicit dispose is idempotent. Creation outside component setup/createUiApplication is rejected.

Options configure default duration, visible/pending capacity, overflow, placement and hover/focus/document pause. Core owns queue identity and the one expiry clock; the backend owns native surfaces, transitions and layout. Queued deliveries do not mount content or consume display time. Verify isolation, pre-presentation delivery, custom content identity, capacity/exit coordination, expiry and teardown. See [toasts and notifications](../../guides/toasts-and-notifications.md) for defaults, full examples, limitations and observable acceptance.

Ordinarily create the target in a page- or application-lifetime owner and share routes with business operations. A modal initiating an operation does not imply modal ownership of its feedback. Creating a target inside modal content is an explicit local-lifetime choice; it is not automatically promoted to page ownership.
