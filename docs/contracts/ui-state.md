# UI state contract

Controls maintain interaction state independently of the views that borrow them. The application chooses each control’s owner and lifetime, including whether a draft survives hiding or removing a view. The concrete APIs below define their own state and transitions; there is no universal state-handle API.

## Principle

Uninterface manages the mechanics of an interaction and exposes its state through the concepts the author uses: a modal lifecycle, a form editing session, or a field. The application supplies business data, rules, and decisions. An actuator presents the interaction and reports user intent through the same contract.

Uninterface's control layer is authoritative for UI flow and usage logic. Backends supply presentation and the interaction mechanics needed to realize it; their own form or workflow systems must not become competing control layers. Business rules and control lifetime remain application-owned.

An adapter may bypass, disable, or use only part of a backend's higher-level behavior when it conflicts with Uninterface's control contracts. Reusing a backend's visuals or lower-level primitives is sufficient if the assembled implementation fulfills the required capabilities. Backend-native form management is not a requirement in itself.

For example, the application can ask whether a dialog is open, request its closure, or inspect whether a form has validation problems without knowing a vendor's component instance, event names, or DOM structure.

## Control and view boundary

A control is responsible for maintaining the interaction state assigned to it by its concept's contract. A view presents that state and reports interaction intent. Here, “control” refers to the managing role, such as list control or form control; it need not be a visible input widget or a particular class.

The list control owns filters and selection when selection is enabled. Desktop tables and mobile cards present that control's state, so changing between those views retains filters and selection. Views may maintain presentation-specific details, but must not become competing owners of the control's state.

When two forms edit the same customer, the application decides whether changes are shared or independent through its bindings and business policy. Uninterface must not infer synchronization or isolation from the customer identifier or the existence of two views. Sharing a business value also does not by itself settle whether validation, focus, or other interaction state is shared; each control's contract must describe that boundary.

State continuity is specified through control responsibilities and view relationships. It does not require a universal rule that every logical node retains the same state after every kind of change. The business decides control lifetime, including creation, retention, reset, reuse, and disposal. Each control documents the meaning and effects of those operations.

## Business ownership of control lifetime

The business decides how long a control and its maintained state live. Hiding, closing, replacing, or removing a view does not by itself determine whether its control is retained, reset, or disposed of. A business composition can explicitly connect those events to a lifetime decision and encapsulate that policy for its consumers.

For example, a business record editor can own one editing session per mounted component and dispose it on unmount, while its consumer supplies only typed data and persistence. This is an explicit business policy, not a backend lifecycle decision. A session that must survive view removal instead needs an owner whose scope outlives that view. The [business component guide](../guides/business-components.md) explains both patterns and their consumer contracts.

For example, closing an order modal can retain its form control so reopening resumes the draft, or end that control so reopening starts a fresh editing session. Both are valid business policies. The implementation fulfills the selected policy and documents the effects of reset and disposal, including how pending work and resources are handled. UiModal provides an implemented run/session lifecycle described in the [modal guide](../guides/modals.md); broader lifecycle coordination beyond each documented control remains open.

## Responsibility boundary

| Concern | Business responsibility | UI responsibility |
|---|---|---|
| Form model | Define its meaning, supply/bind the record, and decide persistence | Manage the model association and current editing session |
| Field order and rules | Declare meaningful ordering, codecs, and validation conditions | Maintain the fields, evaluate supplied rules, and track their current results |
| Editing availability | Supply restrictions and business conditions | Derive and expose effective UI availability, applying relevant interaction restrictions |
| Modal closure | Supply conditions such as whether unsaved work may be discarded | Coordinate requests, pending decisions, accepted closure, and presentation cleanup |
| Submission | Execute the business operation and report its outcome | Prepare inputs, validate, manage pending state, and present the returned result |
| List interaction | Supply items/sources, filter meaning, selection and editing rules, and bindings | Own loading/refreshing, filters, selection when enabled, and optional pagination state; coordinate item updates |

Executing a validation rule does not make Uninterface the owner of that rule. Tracking a form's model does not make it the owner of the underlying business record. Whether changes are copied into an editing model or propagated through a live binding must be explicit in the integration contract; neither implies persistence.

## Concrete controls and observations

| Concern | Authority | Observable behavior |
|---|---|---|
| Field drafts and validation | [UiFieldControl](../api/types/UiFieldControl.md) | Raw draft, parsed/validated value, dirty baseline and current issue have distinct meanings. Editing invalidates previous validation. |
| Form sessions | [UiFormControl](../api/types/UiFormControl.md) | A stable explicit field set coordinates validation, reset and submission; hidden fields remain participants. |
| Collection sessions | [UiListControl](../api/types/UiListControl.md) | Requested and accepted queries remain distinct, stale reads cannot replace current data, and view mounting does not issue reads. |
| Modal runs | [UiModalControl](../api/types/UiModalControl.md) | Awaitable outcomes, close guards and cleanup belong to the run; a close request is not an accepted closure. |
| Panel expansion | [UiExpansionControl](../api/types/UiExpansionControl.md) | Shared expansion bindings coordinate views without owning their business data. |

Use a [business component](../guides/business-components.md) to encapsulate the complete editing workflow. An externally owned session is appropriate when its lifetime must outlive a borrowing view. [Editable collections](../guides/editable-collections.md) define participation of keyed child drafts in a parent value; this is explicit coordination, not automatic sharing between arbitrary controls.

## Consumer and implementation responsibilities

The business owner creates controls, supplies operations and disposes resources at the end of the session. Hiding a view does not by itself reset or dispose its control. A deliberate keyed remount can create a fresh session when that is the business component’s documented policy. Fields have no public dispose method; form, list and other session controls document their own cleanup.

Core publishes current state and guarded operations. Backends render that state and report user intent without holding a competing business model or deciding persistence policy. Pending work is not successful validation, a request is not an accepted transition, and failures must retain the documented draft and baseline. Late asynchronous work cannot publish into a disposed or superseded session. Exact cancellation and error behavior belongs to each control’s reference.

## Observable verification

- Hide and restore a borrowing view: the session retains its draft, baseline and accepted query, and no new source request is caused by mounting alone.
- Start a new owned session deliberately: prior asynchronous work cannot change its values, feedback or availability.
- Edit during validation: obsolete results cannot publish success or overwrite current issues.
- Fail or decline an operation: the documented draft, accepted state and focus recovery remain usable for retry.
- Dispose the business owner: listeners, effects and temporary coordination are released according to that control’s API; view removal alone does not dispose an external owner.

## Limits

Controls expose concept-specific APIs. A universal state store, automatic dependency scheduling, arbitrary cross-control sharing and a common lifecycle/transition handle are not provided. Use the existing form, entry, collection and modal contracts for their supported coordination; domain state management remains application-owned.

## Collection editing coordination

The implemented [collection editor coordinator](../guides/collection-editors.md) borrows an editable collection value and owns its local presentation projection and immediate draft actions. The value/form controls retain raw drafts, complete validation and baseline authority. The borrowing Vue attachment owns view-local registrations and recovery cancellation; the backend owns actual focus/visibility mechanics. One row-removal recovery protocol joins these responsibilities. Business code supplies new-item defaults/identity, field order, query projection/reveal when needed and persistence. No schema, second draft or automatic per-row persistence is introduced.
