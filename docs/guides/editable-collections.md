# Editable child collections

An invoice owns all its lines. Other collection compositions may filter, page or switch presentation without changing their full draft. A view's visible array is therefore not the parent draft. Use `createUiListValueControl` to keep full membership and keyed record editors in one business session, then contribute its `field` to the parent form.

For ordinary local inline editing, add [collection editor coordination](collection-editors.md). It supplies the projection bridge, stable Add/Remove bindings and borrowing-view focus integration described manually below. The value controls remain the draft/validation authority; the low-level wiring remains available for custom compositions.

## Ownership and ordinary use

A reusable invoice editor accepts typed initial data and a save operation. It constructs fields, codecs, rules, collection coordination and the view projection internally. Initial prop updates leave the active session intact. Use a deliberate keyed remount to start another editing session.

```ts
import {
  createUiFieldControl, createUiFormControl,
  createUiListValueControl, createUiRecordValueControl, type UiCodec,
} from '@uninterface/uninterface'

type Line = { id: string; description: string; quantity: number }
declare const initialLines: readonly Line[]
declare const quantityCodec: UiCodec<number, string>
const lines = createUiListValueControl({
  initialValue: initialLines,
  itemKey: line => line.id,
  createEditor: line => createUiRecordValueControl(line, {
    id: createUiFieldControl(line.id),
    description: createUiFieldControl(line.description),
    quantity: createUiFieldControl(line.quantity, quantityCodec),
  }),
})
const form = createUiFormControl({ lines: lines.field }, { acceptOnSave: true })
// A view borrows lines.editor(key).fields; it never creates/disposes the editor.
// The business owner cleans up in this order:
// form.dispose(); lines.dispose()
```

Here initialLines and quantityCodec are typed business definitions. The record helper is optional: an existing custom record-valued field with its own raw draft and disposer also works. It composes fixed fields, not an authoring schema or nested native form. Do not claim the same scalar field in a parent form as well as in its record editor. Self/indirect cycles and duplicate claims reject.

Factory construction, key extraction and formatting must not mutate active sessions. Each `createEditor` result is fresh and exclusively owned; its disposer is idempotent and nonthrowing. The library disposes accepted and abandoned staged children. A mistakenly returned borrowed field is rejected without disposing its existing owner.

## Drafts, projection and validation

Children retain their raw inputs outside the parent's fixed field inventory. A quantity may contain incomplete text while the parent still owns the same line and baseline. Editing any child invalidates the parent snapshot, including when that line is hidden. Parent validation checks every current child once per pass without normalizing private drafts mid-pass. Read-only projection does not publish child validation feedback.

`lines.state.items` is full order with last successfully parsed values. `stale`, `pending` and `invalidKeys` distinguish those values from a fully current valid draft. Totals can retain their last computable amounts until the next validation boundary; Save must use the validated parent model rather than this projection. Asynchronous projection results are rejected after replacement, removal, reset or disposal.

For custom low-level presentation without the collection editor coordinator, create a local list source reading `lines.state.items` and explicitly refresh that owned list when `lines.state.revision` changes. A synchronous local source returns its result directly; refresh completes in the same turn without interrupting the active editor. Projection updates must not induce blur, rewrite raw text or reset the caret. Real blur or explicit validation retains the field’s normal codec behavior. The list owns filters/sort/paging; the value control owns complete editable membership. Filter/page changes must not destroy editors. Guard stale rendered rows during projection refresh before looking up an already-removed editor. See [list sessions](lists.md).

## Validation boundaries

A collection owner chooses projection timing explicitly. Use the following pair for text editing that checks on blur and submission:

```ts
const timing = { revalidateOn: 'validate' } as const
const lines = createUiListValueControl({
  initialValue: initialLines,
  itemKey: (line: Line) => line.id,
  projection: 'validate',
  createEditor: line => createUiRecordValueControl(line, {
    id: createUiFieldControl(line.id, undefined, [], timing),
    description: createUiFieldControl(line.description, undefined, [], timing),
    quantity: createUiFieldControl(line.quantity, quantityCodec, [], timing),
  }),
})
```

`revalidateOn` suppresses automatic checks while typing into an already checked scalar field. `projection` suppresses the collection's independent change-time row inspection, including initial inspection. Both are needed; hiding feedback alone still permits expensive rules to run. Defaults retain checked-field change feedback and change-time row projection for compositions that need them.

Initial typed values seed the projection without proving validation success. Draft edits immediately invalidate parent results, update dirty state and mark `lines.state.stale`; no parser/rule/check is requested by those edits. Values and totals remain at their last successful projection. Waiting for blur is stale, not pending validation. Ordinary blur confirmation needs no extra notice or provisional marker. Preserve action positions as checks finish so native pointer activation remains reliable.

A text editor's blur explicitly validates/formats that field, then the record helper propagates the boundary so the collection inspects the whole row. This row inspection can evaluate parsers/rules/checks, including the edited field again; its purpose is to produce a consistent row rather than publish sibling errors. Successful inspection updates the row and clears its staleness; failure retains the previous typed row and marks it invalid. Custom record-valued editors can use their aggregate field's `validate()` as the boundary. No consumer needs to wire backend blur events.

Submission and explicit parent validation always check all raw children, including hidden and unblurred drafts, in a coordinated pass without adding boundary-triggered projection reads. Those results update the projection. Canonical acceptance/reset restores projection state. Edits, replacement, removal and disposal invalidate pending projections, so late results cannot replace newer values. Explicit `field.read()` still performs a fresh check on request.

Timing is an execution requirement of the owning control composition, independent of feedback presentation strategies. See [validation timing](validation.md#validation-timing) and [options](../api/types/UiListValueOptions.md).

## Membership and accepted baselines

Use keyed `insert(item, { before? })`, `remove(key)`, `replace(key, item, { discardDraft? })` and `move(key, { before? })`. They operate on full order, not visible indices. Moving preserves editor identity and invalid raw text. Replacing preserves the key and requires explicit discard when that editor is dirty. A whole `field.set()` replacement rejects a dirty collection. Deliberate acceptance or a new session is an explicit baseline decision, not automatic merging.

New editors and scalar formatting are prepared before membership or baseline publication. If construction/formatting fails, accepted membership/baselines remain intact and staged candidates are cleaned up. Parent reset likewise stages its fields before committing, then restores accepted order, values and nested feedback. Removed children are disposed once; retained keys keep their editor instances.

Save is one parent operation. It does not independently persist every child. To adopt canonical server data, use `form.submit(save, { accept: result => result.invoice })` or UiForm.accept. Same-key records reuse editors. Changed temporary keys are removal plus creation with a clean accepted editor. Use stable local keys separate from server IDs when UI identity must survive server ID assignment. A failed/obsolete save does not replace baselines; persistence already dispatched is not undone.

Parent locks propagate as additional child locks; business-disabled flags remain independent. A private record helper releases its supplied field claims on disposal, while the collection disposes each editor it owns. Dispose local list projections too.

## Immediate insertion

A business composition can implement New line by appending a uniquely keyed draft through `lines.insert(item)`. Await successful insertion, refresh the owned list projection, await rendering and focus the new Description editor through its public focus handle. The line immediately belongs to the parent draft; incomplete fields participate in the parent's validation. No child save or confirmation step is required. Only the parent Save operation persists it.

Remove abandons that draft line through the existing keyed removal operation. If the removed line held focus, recover to the next surviving line, otherwise the preceding line, and to New line when the table becomes empty. Preserve backend focus recovery when it already reaches a surviving control. Ordinary Tab order progresses through Description, Quantity and Unit amount; it does not insert another row automatically.

The business owner chooses initial field values and insertion position. The collection editor coordinator supplies pending locks, duplicate guards and view-local recovery; custom low-level compositions must implement that coordination themselves. It cancels obsolete focus work on disposal or newer membership actions and does not steal focus after the user moves elsewhere. Existing row editors and unfinished raw inputs must survive insertion/removal. A separate staged or permanent blank row is a different workflow, not implied by `insert`. Keep pointer targets stable when leaving an incomplete editor triggers feedback; a supported tooltip failure strategy can avoid row growth during a Remove click. Verify this with real pointer and keyboard interactions.

## Revealing an invalid child

`lines.revealInvalid(reveal, focus)` chooses the first invalid full-order key. In reveal, clear restrictive filters, select its page and await Vue rendering. In focus, use that editor view's public focus handle. Membership/draft changes, a newer recovery or disposal cancel obsolete recovery.

Pass this operation through `UiForm.focusInvalid: () => Promise<boolean>`. Return true when composed recovery handled focus; false permits the normal first-invalid-field/form fallback if the same validation failure remains current. A business reveal callback changes presentation, not the validated draft. Neither the library value control nor the model function owns DOM selectors or browser focus mechanics.

## Observable checks

- In a single-line table with hidden repeated labels and tooltip failures, editors, calculated values and row-action icons share a vertical center. Check the actual content, not only cell bounds, before and after blur validation and insertion/removal. Backends own the cell/field integration; business authors need no offsets or backend CSS.
- Enter invalid raw text, request modal dismissal and choose Keep editing: the raw draft survives and Save still fails. In a composition that permits filtering, hiding its row must also retain that invalid draft.
- Save failure reveals the hidden line before focusing its invalid input; changed/removed targets cancel recovery.
- Type a decimal amount one character at a time, including a trailing decimal point and extra precision: raw text and caret survive projection updates. Leaving the field applies codec formatting; correcting a checked invalid input does not format it on each keystroke. For validation-triggered projection, totals retain the previous value while typing, then update after blur; submission checks the latest raw values regardless of blur.
- Add to an empty table and focus Description; remove the last line and focus New line. Add/remove beside an unfinished quantity without replacing its raw draft. Pending save blocks membership changes.
- Add/remove/reorder, then Reset: accepted membership/order/values/feedback return, retained keys keep editors and removed keys are disposed once.
- Submit all lines from a filtered/paged view; save once and retain locks until completion. Canonical values become the reset baseline.
- Force construction or formatter failure: no partial membership or baseline acceptance, and no leaked staged editor.
- Dispose during parsing/validation/save: obsolete callbacks cannot publish into the ended session.

For an invoice editor, use separate Description, Quantity, Unit amount, read-only Line amount and Actions columns. If row checks should run on blur and Save, use `revalidateOn: 'validate'` on fields and `projection: 'validate'` for the collection. Save still validates the complete draft. A summary can align its amount with Line amount and show the count of all draft lines, including newly inserted incomplete rows. Scope the label strategy to the line table to hide repeated visual labels while retaining accessible names and required/error associations. Keep the invoice reference label visible. Where the backend supports tooltip validation, it can keep feedback from moving the next row action during activation.

Put Save and Cancel in the modal footer and associate Save with the owned form using its ID and submit binding. Let the modal complete only after canonical acceptance and publish the result to the outer list once. Preserve the draft on failure, ask before discarding a dirty draft and deny ordinary dismissal while save is pending. Reopening starts from saved data. Forced teardown ends the run and late callbacks cannot publish into the list. See [editing in modals](form-modals.md) for ownership and browser checks, including short viewports.

## A creation affordance that follows the columns

Use UiTable's `addRow` action binding and localized `addRowLabel` when adding belongs to an editable table's line workflow. The table supplies tinted column content areas inside native cell insets and an overlaid text-variant action from its existing columns. The owner supplies typed creation, insertion, availability and first-editor focus. Do not manufacture a sample record or mount a second editor session to illustrate the next line. This avoids accidental validation, identity allocation and data consumption before the user acts. The preview does not count as a draft.

For immediate insertion, the binding's `activate` constructs a keyed draft, inserts it into the complete child collection, awaits the view refresh/render, and focuses Description. The application chooses when to persist a newly inserted line or ask for confirmation. After removing the final real row, call the table's `focusAddRow()` method.

Column definitions provide geometry and arbitrary cell templates; they do not identify editor types. The tinted areas convey the line’s content allocation after native cell insets without interpreting business slots. Paint remains backend-owned. The creation row follows the last data row and scrolls with the records, including in full-height tables. A pinned summary is independent. Short offers may release header pinning to preserve access. Verify that keyboard/pointer targets and the new editor stay unobscured. See [UiTable](../api/components/UiTable.md#add-row) for the complete API and checks.
