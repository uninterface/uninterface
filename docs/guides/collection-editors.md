# Coordinating collection editing

Use createUiCollectionEditorControl when an editable child collection needs a list/table projection, immediate Add/Remove actions and coherent focus recovery. It composes the existing editable-value controls: the collection editor never becomes another draft, validation or baseline owner.

Require core capability collection.editor.v1 and backend capability collection.editor-focus.v1 for the coordinated view behavior. The latter is checked when a matching collection mounts; unsupported backends fail rather than silently skipping editing recovery.

## Ownership and setup

A business component owns its fields/codecs, UiListValueControl, parent form and collection editor. Its ordinary consumer supplies typed initial data and persistence. A borrowing view owns only its attachment and focus registrations. Backend views own markup, native focus/visibility and presentation.

```ts
import {
  createUiCollectionEditorControl, useUiCollectionEditor,
} from '@uninterface/uninterface'

// lines is an existing UiListValueControl and form includes lines.field.
const editor = createUiCollectionEditorControl({
  value: lines,
  createItem: createEmptyLine,
  disabled: () => form.state.pending,
})
const editingView = useUiCollectionEditor(editor, {
  fields: row => [
    row.fields.description,
    row.fields.quantity,
    row.fields.amount,
  ],
})
// Owning component cleanup: editor.dispose(); form.dispose(); lines.dispose().
```

The business factory supplies stable keys and initial field values. It runs only when Add is accepted, never to preview a row. Omit it for a composition without Add. The controller borrows lines and owns its local UiListControl projection and subscriptions. Use editor.list for query/pagination operations and editor.bindings.list for presentation. They expose the same stable binding. No refresh watcher is required. Initial prop changes do not replace an existing editing session; use the business component's documented new-session policy.

The [editable-value guide](editable-collections.md) remains authoritative for codec timing, staged acceptance, baseline/reset and complete hidden-child validation. For blur-time projection, retain both revalidateOn: validate on scalar fields and projection: validate on the value control. The editor coordinator does not choose validation timing or run extra checks. Parent Save submits the validated complete model, not the last-valid view projection.

## Declaring the view

```vue
<UiForm :control="form" :save="save" :focus-invalid="editingView.focusInvalid"
        label="Invoice">
  <UiTable :binding="editor.bindings.list"
           :add-row="editor.bindings.addButton" add-row-label="New line"
           :summary-source="editor.summarySource" aria-label="Lines">
    <UiTableColumn :binding="descriptionColumn">
      <template #default="{ item }">
        <UiField v-if="editor.row(item.id).editor"
                 :field="editor.row(item.id).editor!.fields.description"
                 label="Description" required>
          <UiTextInput />
        </UiField>
      </template>
    </UiTableColumn>
    <UiTableColumn :binding="actionsColumn">
      <template #default="{ item }">
        <UiButton :binding="editor.row(item.id).bindings.removeButton">
          Remove
        </UiButton>
      </template>
    </UiTableColumn>
  </UiTable>
</UiForm>
```

Column bindings use editor.bindings.list and normal column definitions. Labels, columns, codecs, totals and persistence stay with the business component. Summary metadata is available without reconstructing completeness/staleness rules; business code still calculates totals and formats money.

Uninterface's field-context editors automatically register their public focus handles in this borrowing scope. A custom editor can use editingView.register(field, handle), retaining and calling its unregister function on removal. The controller never inspects slot internals or backend DOM. No editor-reference map, button wrapper or document-ancestry check belongs in the business component.

## Actions and recovery

Add immediately inserts one draft into complete membership, refreshes the local projection and focuses its first available participating editor after rendering. Remove abandons a draft, without a child save. Both respect live value/form/business restrictions and duplicate activation guards. An asynchronous creation factory is abandoned if the raw draft changes while waiting, a restriction appears or the owner ends. Failures retain existing membership and are available as editor.state.error; choose localized feedback without exposing exception text.

A descendant UiButton activation captures its originating attachment. Programmatic editor.add does not choose a view or move focus. For removal, the backend detects whether a removed row held focus and requests one shared recovery decision: try the following visible row, preceding visible rows, then the table creation action. If none can focus, retain the backend's native collection fallback. An unrelated surviving focus target is preserved. Ordinary Tab order is unchanged; this is not a spreadsheet navigation contract.

UiForm can call editingView.focusInvalid. The value control selects the first invalid full-order row; the attachment reveals it and focuses its first participating invalid field. For filtered/paged local views, configure presentation.project on the controller and reveal on the attachment. Projection callbacks filter/order/page supplied records without editing or copying their values. Reveal clears restrictive filters/selects the page without modifying the draft. It receives reason add or invalid and must complete presentation changes before resolving.

Each simultaneous borrowing view needs its own attachment in a separate component setup. Registrations/focus work are view-local while the draft remains shared. Removing or deactivating one borrower releases its handles and cancels its focus work, without resetting the session. Newer recovery, membership/draft changes, moved focus and ended owners reject obsolete work. SSR mounting registers no DOM focus or source-read side effect.

## Observable acceptance

- Type unfinished text, Add/Remove another row and change a query: retained editor identity, raw draft, caret and baseline survive. Projection updates do not render a transient loading mask or run validation.
- Add twice before rerender: one factory/insertion. Pending Save and independent business restrictions deny conflicting actions; ending one restriction does not remove another.
- Focus a removed row: recover through following/preceding visible rows, then New line when empty. Remove elsewhere: preserve the user's focus. Real pointer activation must survive blur feedback.
- Filter out an invalid row and submit: validate every child, reveal before focus, and focus in the requested borrower. Totals/summary membership remain based on the complete editable collection.
- Present one session twice: Add in one borrower focuses only that borrower. Unmount/remount retains drafts. Move focus elsewhere while creation waits: completion must not steal it.
- Force duplicate keys/formatter failure or dispose during creation: no partial insertion or late mutation. Old Remove bindings cannot remove a replacement editor reusing the same key.
- Save canonical values, fail Save and Reset through the parent: retain existing form/value guarantees. Dispose editor, form and value once their owner ends.

Unit/DOM checks establish state and wiring. Browser pointer, focus, caret and scrolling checks remain necessary for backend geometry and native interaction; they do not establish assistive-technology conformance. Remote persistence/query orchestration, staged confirmation and automatic blank-row workflows are outside this controller's immediate local-editing contract.
