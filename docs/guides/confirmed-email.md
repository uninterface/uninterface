# Compose a confirmed email editor

A confirmed email editor keeps a private draft, a confirmed business value and an explicitly owned session. It uses existing Uninterface fields, forms, layouts and buttons with the selected backend. `EmailChangeForm` is an application example, not a core export.

## Consumer interface

```vue
<EmailChangeForm :initial-value="savedEmail" :save="saveEmail" />
```

```ts
interface EmailChangeFormProps {
  initialValue: string
  save: (email: string) => Promise<void>
  visible?: boolean // Defaults to true; hides only the borrowing form view.
}
```

The consumer provides the last accepted address and persistence. It receives one string, with no confirmation object or field internals. A session starts once per mount. Initial-value prop changes preserve the active draft; a deliberate keyed remount starts over. The initial address appears in both inputs because it is already the accepted baseline. Empty initial input is supported but cannot be saved until both entries are valid and equal.

The optional `visible` prop lets an application coordinate view visibility while
the business component keeps owning its session. Passing false removes the
borrowing form/fields and their Save/Reset actions; the component stays mounted
and retains its draft, validation and pending operations. An ordinary consumer
can omit it. Removing `EmailChangeForm` itself ends the session.

This example accepts one simple address with nonempty text around `@`, a dot in the domain, and no whitespace. It preserves case, rejects leading/trailing spaces and compares the two entries exactly. It does not verify mailbox ownership or delivery, normalize addresses, support address lists, or accept object/array/null values. Applications choose their own address policy.

## One confirmed value, two editing roles

| Part | Responsibility |
|---|---|
| Proposed address | Private draft control, edited through the first UiTextInput |
| Confirmed address | Submitted field, edited through the second UiTextInput |
| Business session | Own both controls, register comparison/check/dirty behavior, coordinate reset, save and disposal |
| Borrowing field view | Present labels and editors; report interaction without owning cleanup |
| Consumer | Route persistence results and choose the session boundary |

The form's explicit collection contains only the confirmed field, under `email`. Its extra check validates the private proposal and requires an exact match. Private draft validation publishes its own feedback through its own control. A failed proposal therefore has a correction target in the first input; a mismatch has one in the confirmation input. No native or toolkit validation manager competes with core.

Changing the private proposal synchronously calls:

```ts
confirmed.notifyDraftChanged({ origin: 'user', parts: ['proposedAddress'] })
```

The private input is edited only by its view in this example; session reset/adoption use separate synchronized paths. Ordinary confirmation edits call `confirmed.set()` through UiTextInput and already notify. Extra checks do not write the confirmed draft or baseline. The proposal's identity codec does not normalize during validation, so delegating its validation cannot change the draft during the parent check.

The confirmed field's dirty tracker includes the proposal's dirty state. A changed or unfinished proposal therefore invalidates whole-form validity and contributes unsaved changes even when the confirmation input is unchanged. All changes invalidate the complete confirmed-value snapshot; parts metadata does not narrow the checks. The public [field contract](../api/types/UiFieldControl.md#internal-draft-changes) defines this behavior.

## Session transitions

- **Save:** validate syntax and equality, lock both inputs and reset, and call the consumer once with the confirmed string. The private proposal follows the confirmed field's effective disabled state through a synchronous owner-managed binding. A user event before rerender cannot bypass the private control's disabled guard.
- **Failure:** retain both drafts and the previous accepted baselines; present the form's error and allow retry.
- **Success:** accept the submitted confirmed value and synchronize the private proposal's baseline. The session becomes clean. This coordinated adoption does not emit a new draft notification.
- **Reset:** restore the confirmed baseline through the form and restore the private proposal on `resetRevision`. Both were accepted together. Baseline synchronization suppresses redundant notification because the form has already invalidated the old pass.
- **Hide/show:** change `visible` to unmount/remount the borrowing form/field views while the owning component stays mounted. Drafts, checks, dirty state, validation and pending operations survive. Save/reset actions are unavailable while the form is hidden.
- **Start over:** change the business component's key to dispose the old session and open the last saved address. Reject saved-display updates from an obsolete session. Dispatched persistence can continue after disposal.

The session factory owns a detached effect scope for its private synchronization watchers. Its idempotent disposal stops those effects, disposes the form, and unregisters its check and dirty tracker. The component immediately registers disposal with `onScopeDispose`. A borrowing view does none of this cleanup. These private controls are owned by this business session and are not transferred to another session.

Keep the editor mounted when closing an optional settings panel. Bind the panel to application actions for hiding the form or starting a new session. Keep these choices separate from persistence and from the editor’s own feedback.

## Observable checks

1. Change only the proposal: unsaved state appears and a previously successful form result becomes unchecked.
2. Save mismatched values: persistence is not called, confirmation is invalid, and focus reaches its input. An invalid proposal with valid confirmation focuses the proposal instead.
3. Change the proposal again: the old confirmation issue clears; explicit validation evaluates the new pair.
4. Hide/show while editing and while saving: drafts and pending restrictions survive the view remount.
5. Simulate failure, retry and reset: failure preserves the baseline; success establishes the new baseline for both inputs.
6. Start over while saving. Verify that obsolete completion cannot alter the replacement session or its saved-value display.
7. Change language. Labels and existing issues update without replacing either input or its draft.
8. If the application retains editor pages, navigate away and back at desktop and mobile widths. Check draft retention and focus recovery.
9. If the editor uses a settings panel, open, close and resize it and check that both drafts and the accepted value survive.

Use rendered-component tests to exercise the consumer interface and browser checks for layout, visible focus and keyboard behavior.
