# Awaitable modal interactions

Use [UiModal](../api/components/UiModal.md) to host a named blocking interaction. Create its [control](../api/functions/createUiModalControl.md) in the owning business component, declare the modal in its template, and await one run at a time. The component may expose a typed business method such as `run(customer)`; callers do not reconstruct its fields or backend lifecycle.

```ts
const modal = createUiModalControl<Customer>()

async function run(customer: Customer) {
  return modal.run({
    setup(session) {
      // The business component prepares its target and owns its resources.
      // It may load a record, initialize a new item, or resume retained data.
    },
    async beforeClose(request, session) {
      // Return true to allow or false to retain the interaction.
      // This may await another declared modal's confirmation result.
      return true
    },
    teardown(session, result) {
      // Release resources acquired for this run, including partial setup.
    },
  })
}
```

```vue
<UiModal :control="modal" title="Choose customer">
  <template #default="{ session }">
    <!-- Business content supplies a value explicitly. -->
    <UiButton @click="session.complete(selectedCustomer)">Use customer</UiButton>
    <UiButton @click="session.cancel()">Cancel</UiButton>
  </template>
</UiModal>
```

Await `run()` and handle its discriminated result: `completed` carries `value`, `cancelled` carries `reason`, and `error` carries the caught `error`. Cancellation does not reserve a business value such as null or false. Missing views, disposed controls and competing concurrent calls return an error outcome. A concurrent call never replaces the active run. After a run returns, another call starts a new session with a new identity.

For create/edit tasks, follow the [form-integrated modal pattern](form-modals.md): one footer for Save and Cancel, native form association, draft ownership and save/dismissal behavior.

## Ownership and hooks

Core owns run identity, transitions, close-policy evaluation and exactly-once outcome delivery. The backend owns markup, blocking, focus, scroll locking, presentation and owned popup placement. The business owns hosted data, operations and resource lifetime. Modal imports no form control and does not infer completion from a save, dispose an externally owned form, or inspect dirty state.

`setup(session)` completes before presentation. `opened(session)` runs after content is mounted and modality established; use it for a deliberate field focus request. `teardown(session, result)` runs after presentation cleanup, including on partial setup failure. It completes before the result is delivered. Business hooks must terminate and cooperate with `session.signal` when doing cancellable asynchronous work. Disposal aborts the signal and waits for setup to settle before releasing its resources; it cannot safely interrupt arbitrary noncooperative JavaScript. Do not await the run's own result or call `dispose()` from its hooks. Setup cannot complete/cancel an interaction that has not opened; throw or use synchronous `session.fail(error)` for setup failure.

`opened` may start asynchronous work, but terminal cleanup does not wait for that hook: otherwise a hook awaiting session.complete() would deadlock its own completion. Use the supplied session signal and check it after awaits before changing business state. A failure before closure starts requests an error outcome; a late failure after the terminal transition is consumed and cannot replace an already chosen result or affect a later session. Use setup for prerequisites that must complete before presentation and teardown for required cleanup.

`session.complete(value)` and `session.cancel(reason?)` await the close policy and return whether closure was accepted and cleaned up. Requests are accepted once setup has settled, including during opening motion; accepted closure waits for presentation startup before cleanup. Repeated requests while a decision/closure is pending return false. `session.fail(error)` synchronously requests terminal failure and returns whether that request was accepted; the run promise supplies the final outcome after cleanup. Captured failures from setup, opened, close policy, backend presentation and teardown become error outcomes. Descendant Vue errors captured by UiModal are relayed too. Detached promises must be caught and explicitly relayed; no global rejection handler is installed. Content may handle a recoverable error itself and remain open.

Callbacks belong to the session that created them. Retain that session in asynchronous work rather than retrieving the latest session after an await. Late callbacks from an earlier run return false. Teardown failures turn completion/cancellation into an error; combined failures preserve the primary error and cleanup diagnostics through AggregateError.

The owner calls `dispose()` when its control lifetime ends. Unmounting, deactivating or replacing the attached UiModal view interrupts its run with `view-removed` and releases presentation resources. A disposed control cannot run again; an ordinary completed/cancelled/error run does not dispose the control. Only one UiModal may attach to a control at once.

## Closing and hosted policies

`closeOn` defaults to `['close-button', 'escape']`. A supplied array replaces that set; order and duplicates have no effect. Add `'backdrop'` explicitly to enable backdrop dismissal. `:close-on="[]"` hides the built-in close button and disables Escape/backdrop dismissal while preserving explicit `session.complete()` and `session.cancel()` operations. Provide appropriate business actions for the interaction. Pending close decisions temporarily disable the close button without changing the configured triggers. Changes to the prop take effect during the current run. Every enabled user route and explicit complete/cancel request consults `beforeClose`; completion requests carry their proposed result. Return false to preserve the open content. Terminal failure and forced owner/view teardown bypass that policy because the interaction cannot remain available.

A business form composition can inspect its dirty state and await a child confirmation modal before returning a decision. It may deny cancellation during a dispatched save. These are application policies, not modal defaults. Saving and closing cannot imply rollback of a dispatched operation. For an information dialog without a form, use a named modal and an action such as Close that ends its session.

## Layout, focus and environment

UiModal integrates the [header/main/footer reference arrangement](../contracts/layout.md#example-modalbodylayout), conceptually called ModalBodyLayout. It is not an exported component or an additional wrapper required from consumers. The same inner-layout responsibilities apply to drawer and popover frames; their placement, modality and lifecycle remain separate.

The supporting adapters use the browser dialog top layer for background blocking, with backend-owned surfaces and theme values. Their presentation helper supplements native focus traversal with Tab/Shift+Tab wrapping at the dialog boundaries; native modality alone can allow focus to move into browser chrome. The title is the initial reading/focus point. UiModal has no description prop or dedicated description slot. The title identifies the interaction; add body text only when it helps the user make a decision or complete a task. Avoid repeating the title, labels or obvious control behavior as introductory explanation. No accessible description is generated automatically. `header-extra` supplements the title and close button; it does not replace them. Use it only for additional content that belongs outside the body scrollport. The named, keyboard-focusable body scrolls when content exceeds the available viewport; header/footer remain outside that scrollport. Use document-flow layouts inside the default body. Choose `bodyScroll="content"` explicitly to pass a shrinking viewport-capped allocation to a full-height layout/form and let a nested collection scroll its rows. Short content remains naturally sized and the named body keeps an overflow fallback. A default content-sized body does not supply that allocation; no descendant-dependent height measurement is implied. See [content-owned scrolling](../api/components/UiModal.md#content-owned-scrolling). It also does not add bounded-height support to UiCard or establish arbitrary frame nesting.

Native select/menu popups must remain within their owning modal interaction. Backends redirect portal targets into the dialog or use an owned top-layer popup preserving the same interaction boundary. Native nested dialogs establish topmost modality. Closing restores the invoking target where it remains available. Keep that target mounted and enabled through presentation cleanup: disabling it until the awaited run returns prevents restoration, because cleanup precedes result delivery. Native modality already blocks background activation; a synchronous business guard can reject duplicate setup requests without disabling the invoking target. These mechanics require real-browser verification; DOM shims do not prove containment, geometry, zoom behavior or native focus return.

The declared component preserves its Vue ancestry, strategies, application locale and native setup. No global component registry or dynamic mounting service is required. Use the backend's ordinary stylesheet and application assembly. Consumer CSS and numeric stacking values are unnecessary.

## Verification

Check all three outcomes, denial then acceptance, sequential reuse, competing calls, stale callbacks, setup/teardown failure and removal during a pending decision. Verify a non-form target as well as any editor composition. In a browser, check long content, narrow screens, visible focus, Tab containment, Escape ownership for nested popups and modals, background blocking and meaningful return focus. Ensure changing language or mode updates the mounted interaction without replacing its business session. Consult your backend's modal documentation for its supported configurations and native limitations.

## Standard actions or a custom footer

Use `#actions` with ordinary UiButton children for standard modal action placement. Declare actions in the desired sequence; the selected backend supplies alignment and placement direction, including mirroring for RTL. For example, declare OK followed by Cancel even when the backend starts the sequence at the right edge in LTR. Declaration order is also DOM/Tab order; no sorting or importance metadata is involved. Native presentation can wrap long labels while retaining all actions. Text retains its own inherited direction.

Use `#footer` instead when composing other footer content yourself. The two slots are mutually exclusive. No required action wrapper or action-object schema is introduced. Wrapping buttons in a business component makes that component one layout item; the layout does not inspect opaque descendants. Omit the slot when no footer region is wanted.

The action area owns arrangement, not operations. Call session methods explicitly, and use UiButton bindings only where their association requirements are met. For a form in the body, supply UiForm `:id="formId"` and each submit/reset button in `#actions` with `:form="formId"` and its existing binding. Use a document-unique ID, for example from Vue `useId()`. This preserves native validation/submission focus, reset and pending behavior; do not replace the binding with a manual click-to-submit callback. See the [external action example](control-bindings.md#external-form-actions). Verify conditional buttons, localized labels, declaration/Tab order, focus retention on updates, RTL mirroring and narrow-screen wrapping on the selected backend.

## Responsive width

UiModal accepts width (auto/available), preferredWidth, minWidth and maxWidth. Auto uses a shared 32rem fallback; an explicit preference can use positive px numbers, px/rem/em lengths or a percentage of the available viewport. Available uses all allowed width, subject to maxWidth. The viewport after safe-area insets and backend clearance always caps the result, even when a requested minimum is larger. These are outer widths; backend insets reduce the body allocation. See [the width contract](../contracts/modal-sizing.md) for validation and examples, including a 52rem desktop preference and available width on mobile. Props update without replacing editors. Automatic content-driven preference reporting is not implemented.

When an editor puts Save and Cancel in the modal footer, the reusable form can expose its form ID and submit-button binding while retaining ownership of its session. Footer Save follows native form submission, preserving validation, pending locks and duplicate-submit protection.
