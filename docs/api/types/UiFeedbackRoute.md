# UiFeedbackRoute

Import this type from `@uninterface/uninterface`.

Factory-created object connected to one target. `send(source: UiFeedbackMessageSource): UiFeedbackHandle` replaces the target's current delivery. `reset(): void` clears only the current delivery owned by this route. `dispose(): void` performs that cleanup and rejects future sends. Reset/dispose are stable context-free callbacks, safe to register with an application event distributor; neither affects another route's current item. Target disposal also rejects sends. Core owns routing; backend rendering is through the target binding. Producers own stale asynchronous guards. Verify shared target isolation, individual handles, pre-mount sends and disposal.

See [feedback routing](../../guides/feedback-routing.md) for ownership, complete examples and observable acceptance.
