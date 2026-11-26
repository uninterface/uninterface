# Files and uploads

File acquisition, upload, preview and collection membership have separate owners. UiFileInput edits one local File descriptor without implicit upload. UiUploadRegion uses a workflow binding to acquire one file and optionally upload it, then retain the result in a field or hand it to a collection/service. The backend arranges its optional internal progress, preview and actions; business authors supply no child layout or CSS for those functions.

## Choose the component by responsibility

| Component | Responsibility | Consumer supplies |
|---|---|---|
| UiFileInput | Select, replace or clear one local file | A field or file model and optional candidate validation |
| UiUploadRegion | One acquisition/upload workflow and its complete internal presentation | A workflow binding, optional progress/preview/action participation, and a supported allocation |
| UiUploadProgress | Present transfer activity/Cancel and failure/Cancel/Retry | A progress binding and an external host when used independently |
| UiImagePreview | Image-only rendering with contain/stretch | A descriptor, meaningful alternative text and bounds |
| UiFilePreview | File Tile/Row summary or image rendering; optional image thumbnail within the summary | A descriptor and presentation/thumbnail choice |
| UiPreviewRegion | A visibly framed read-only field control | UiField context and read-only preview content |

Native backends own markup, appearance and internal spacing. Business authors provide data, operations, semantics and outer composition. Keep state cues concise; do not add repeated uploading captions, association explanations or diagnostic paragraphs. See the [presentation standard](design-principles.md#bounded-upload-and-preview-controls).

## Retained-file workflow

Create the field and workflow inside a reusable business component. Consumers provide business values/operations; they do not reconstruct control wiring. The initial value may be an existing remote descriptor. Import these APIs from `@uninterface/uninterface` and Vue lifecycle functions from `vue`.

```ts
const attachment = createUiFieldControl<UiFileDescriptor<string> | null>(initialValue)
const uploads = createUiUploadController<string>({
  async transport(file, { signal }) {
    const body = new FormData()
    body.append('file', file.value, file.name)
    const response = await fetch('/api/files', { method: 'POST', body, signal })
    if (!response.ok) throw new Error('Upload failed')
    const result = await response.json() as { id: string; url: string }
    return { key: result.id, value: result.id, name: file.name,
      mediaType: file.mediaType, contentUrl: result.url }
  },
})
const upload = createUiUploadRegionControl({
  uploadController: uploads,
  destination: { field: attachment },
  retry: true,
  validateFile: file => (file.size ?? 0) > 5_000_000 ? 'Choose a file under 5 MB.' : null,
})
onScopeDispose(() => { upload.dispose(); uploads.dispose() })
```

```vue
<UiField :field="attachment" label="Attachment">
  <UiUploadRegion :binding="upload.bindings.region" accept="image/*" />
</UiField>
```

The endpoint/response are application examples, not a built-in service. Fetch does not report upload-byte progress; use a transport with measured `reportProgress({ loaded, total })` when available. Unknown total is null. The uploaded result has the field's handle type; a temporary local File never occupies that handle field.

Defaults include internal progress for upload-enabled workflows, associated-file preview for retained destinations and supported actions. Use `progress=false`, `preview=false` or an `actions` participation set to alter inclusion. These flags never grant permission, unlock an associated region or cancel a task. The backend chooses action order, native widgets, compact preview placement and responsive arrangement. It switches the visible controls with the workflow phase, without default instructional paragraphs or duplicate progress captions. There are no content slots. Remove uses a localized trash affordance, releases only the field association and preserves its accepted baseline; server deletion is a separate business operation.

A retained region cannot acquire while associated, including when preview is hidden, loading or failed. Uploading/queued state also locks chooser and drops. Failure/cancellation returns to ready. Retry, when configured, revalidates the previous candidate; accepting a new one invalidates old recovery. UiFileInput retains its separate replace/clear policy.

## Service handoff

```ts
const upload = createUiUploadRegionControl({
  uploadController: uploads,
  destination: {
    receive(file) {
      if (!photos.value.some(item => item.key === file.key)) photos.value.push(file)
    },
  },
})
```

```vue
<UiUploadRegion :binding="upload.bindings.region"
  aria-label="Add photo" accept="image/*" extent="compact" />
```

The service role shows upload progress but no retained preview by default. Successful synchronous delivery finishes before the region returns to ready; the application owns subsequent result presentation/removal. The array update above illustrates a destination, not a prescribed file/image collection UI. `receive` returns undefined, not a promise. Receivers must be atomic or idempotent; a stable deliveryId is available as its second argument. If delivery fails, the successful result remains available and acquisition stays locked. Retry delivery repeats only destination delivery; `releaseResult()` explicitly relinquishes the pending result without deleting remotely. Ordinary success requires no acknowledgment.

Omit uploadController for selection-only acquisition; the destination then receives a File descriptor. No dummy field is necessary for a service destination. Each workflow has one acquisition region; other progress observers may exist.

## External or omitted presentation

```vue
<UiUploadRegion :binding="upload.bindings.region" aria-label="Add photo"
  :progress="false" :preview="false" :actions="['retry', 'retryDelivery']" />
<!-- In the application's existing associated host: -->
<UiUploadProgress :binding="upload.bindings.progress" announcement="polite" />
```

This moves the activity indicator and Cancel to the chosen host without moving state or locks. Transfer feedback remains essential in the region; choose one Retry host explicitly (for example, omit retry from the region action set or set retry=false on the external progress view). Multiple observers do not acquire workflow ownership. Omit both optional visuals when that role needs neither. Essential identity, availability and feedback remain. Select one announcing progress host: internal progress handles its announcement automatically; standalone progress defaults to off. UiUploadProgress can also observe an independently started task via createUiUploadProgressBinding, including after UiFileInput selection. No notification service is introduced.

## Form, lifetime and allocation

The workflow's destination-field adapter contributes unfinished-work validation and dirty state, and invalidates cached form results. Submission cannot succeed while validation/upload/delivery remains unfinished. Reset, baseline adoption or external edits invalidate current work, including same-key changes. A check never uploads or edits the checked field. Dispose the workflow at the business session boundary; a view unmount alone does not cancel it. Fields have no disposal method. A form/shared upload controller retains its own owner.

The region has explicit allocation presets and backend minimum sizes, with no internal scrolling; see [UiUploadRegion](../api/components/UiUploadRegion.md). It does not reserve mandatory empty progress/preview bands. Fixed allocation stays stable through ordinary states. Unsupported unbounded fill hosts fail. Hosts must honor the declared minima; insufficient space is not permission for the backend to scroll or clip essential actions. Retained preview content stays centered with an independent end-aligned trash action.

Keyboard users reach the available chooser and actions directly; the named region adds no separate Tab stop. When there is no available action, the focus handle can target the region for inspection or recovery. A disabled region rejects focus. The backend owns focus presentation: an area-style chooser can highlight the full surface, while recovery buttons retain individual indicators. Verify forward/reverse Tab, Enter/Space acquisition, action changes and disabled transitions without adding business-side focus styling.

UiFileInput remains an input-styled surface: chooser, filename and integrated Clear. It supports field ownership or v-model:file, not both; validateFile and field validation inspect a candidate before replacement. It has no automatic preview. Compose UiFilePreview separately for that compact editor. Accept/capture are browser hints; multiple files/directories are unsupported.

Descriptors require a nonempty unique key, name and typed value. Preview prefers previewUrl, then contentUrl, then an object URL for local Blob content. Each mounted internal/external preview releases only URLs it created; omitted preview creates none. File collection preserves application order; removal changes membership, not remote storage. Previews show content/metadata without an Open file action or implicit navigation. Supply meaningful previewAlt when a filename is insufficient. Do not infer arbitrary handle-class copy support from a generic type; fields retain their documented data-copy boundaries.

## Preview beside a form input

Use UiPreviewRegion as a read-only field control. UiField owns the label, help and feedback, and the region supplies a clearly framed preview surface matching ordinary controls in the selected backend:

```vue
<UiField :field="attachment" label="Attachment">
  <UiFileInput />
</UiField>
<UiStrategy :block="uiValidationFailureQuery" :use="uiValidationFailure('none')">
  <UiField :field="attachment" label="Preview" group>
    <UiPreviewRegion>
      <UiFilePreview v-if="attachment.state.input" :file="attachment.state.input" />
    </UiPreviewRegion>
  </UiField>
</UiStrategy>
```

Both views observe one attachment control; rendering the preview does not add form participation or copy the value. The grouped field provides semantics suitable for arbitrary read-only preview content. The preview inherits naming, descriptions and disabled/invalid state, without acquisition, removal, value writes or validation triggers. Field presentation strategies own the label and feedback. In this companion-preview composition, import UiStrategy, uiValidationFailure and uiValidationFailureQuery from @uninterface/uninterface: the strategy boundary suppresses duplicate error styling/messages on the preview while the acquisition field shows the required-file error. It retains semantic invalidity and submission blocking; it does not create another control or remove validation. Blocking incoming failure strategies makes this local presentation choice explicit. Clearing the field leaves the empty preview frame allocated.

The regular area and native field boundary remain when empty, without empty-state prose. Framing follows the backend’s ordinary input surface, with integrated labels where supported; a group role does not require a group-box outline. Compact and large are optional allocation presets. The backend centers and clips content; images retain contain/stretch behavior and have no border of their own. UiUploadRegion still arranges its internal preview. See [UiPreviewRegion](../api/components/UiPreviewRegion.md).

## File summary presentations

UiFilePreview shows non-image files as a Tile by default: centered file icon, filename and size. Use `presentation="row"` for a smaller icon beside stacked name/size. Put either inside UiPreviewRegion when field framing is required; no additional border is added by the renderer.

```vue
<UiFilePreview :file="document" />
<UiFilePreview :file="document" presentation="row" />
```

Supported MIME families select file-type artwork; unknown types retain a generic file icon. See [supported icon families](../api/components/UiFilePreview.md#supported-icon-families) for the exact MIME mapping shared across backends and optional application catalogue entries that replace backend artwork. Filename text remains complete for accessibility while visually ellipsizing to fit. Size uses localized 1024-based units, such as 12.4 KiB or 3.2 MiB; missing size is omitted and zero is 0 B. These presentations add no Open file action, implicit navigation or metadata paragraphs. Image files show only their image unless thumbnail mode is enabled. Upload-region non-image previews also default to Tile, and retain their separate remove action.

For a mixed-file summary, use `thumbnail`: images replace the icon within the same bounds while filename and size remain visible. Missing/failed images fall back to the MIME-family icon. Non-image files retain their icons. The backend owns thumbnail sizing and fitting; consumers select Tile or Row without arranging its internals.

```vue
<UiFileCollection v-model:files="files" removable>
  <template #default="{ file }">
    <UiFilePreview :file="file" thumbnail presentation="row" />
  </template>
</UiFileCollection>
```

To display saved attachments, borrow a list binding in a UiCollectionView card grid. Render a thumbnail Tile as a media field and supply a separate, accessible Remove action through the item context. Update the list with the canonical descriptor returned by a successful save. A selected local file can have a different key from an earlier selection of the same file. Use the persisted identity to decide which item a save replaces. Keep saved results independent of form and upload drafts so removing a saved attachment leaves the form’s reset baseline intact. Thumbnail mode uses image-file sources only. See [thumbnail summaries](../api/components/UiFilePreview.md#thumbnail-summaries) for source, fallback and accessibility responsibilities.

## Image-only preview

UiImagePreview shows only the image: no filename/caption, border, avatar shape or actions. Its default `fit="contain"` keeps the whole image centered with its aspect ratio; `fit="stretch"` fills the final bounds with possible distortion. The parent supplies allocation, or use width/height (numeric pixels or CSS lengths). One explicit dimension derives the other from the loaded aspect ratio; auto dimensions can use intrinsic size. Supply a definite height when the image must fit a fixed vertical area. Missing/failed images use a broken-image glyph without text, preserving known bounds. See [UiImagePreview](../api/components/UiImagePreview.md) for examples, limits and verification.

## Present upload progress and failure

UiUploadProgress keeps file identity above one context/action area in both activity and failure. The backend owns the arrangement: progress or a danger/error-colored message at logical start, with available native actions at logical end. There is no context-slot API or business-side styling obligation. Standalone failure messages wrap completely, including long unbroken text; actions remain at the start of that content area and continue below when the allocation is too narrow. Multiline feedback may intentionally increase the standalone presentation height. UiUploadRegion keeps its fixed allocation and concise, ellipsized summary with full DOM text, hover title and accessible feedback association. Authors supply short, actionable errors and respect the chosen backend's region minima; detailed diagnostics belong outside the acquisition control.

Acceptance checks compare both states at wide/narrow widths and in light/dark and RTL contexts. Verify visible error color and text, full standalone wrapping, bounded-region action fitting without scrolling, and keyboard position through an immediate repeated failure. Starting a background upload or publishing its feedback must not take focus from another control. These are implemented patterns; real-browser evidence and human visual acceptance remain distinct.

An indeterminate indicator omits `aria-valuenow`. Its animated segment shows activity without reporting a measured percentage.

## Observable verification

Unit tests cover atomic admission, cancellation/stale completions, reset, form participation, retry and typed delivery. All-backend DOM checks cover internal/external optional functions, preview cleanup, one Cancel, service handoff, focus and view remount. Browser checks measure full region/neighbor geometry across states and widths; execution is distinct from authored coverage. Native presentation mappings and limitations are in the [contract](../contracts/upload-region.md#backend-fulfillment).

Verify retained and service transitions, cancellation/retry, delivery failure, optional progress/preview and permission locks. At each backend's minimum and ordinary allocations, inspect the complete upload frame and its actions for stable size, no scrolling and no clipping. Check image contain/stretch and broken-image behavior, file Tile/Row and thumbnail fallback, full accessible names and bounded ellipsis. Companion preview rendering must not edit, validate or duplicate form participation. Repeat with relevant locale, theme, viewport and zoom settings; DOM checks establish wiring, not rendered geometry.
