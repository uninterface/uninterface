# Files, uploads and previews

[Backend reference](README.md) · [API reference](../README.md)

Acquisition, workflow presentation, progress and preview view helpers.

### UiFileInputViewProps

Render an input-styled surface containing one native file chooser, the accepted filename as text and an integrated clear action. The descriptor owns the displayed name, independently of the native file list. Placeholder-style presentations show chooseLabel visibly only while empty; the accepted filename replaces that prompt. Native file-input presentations may retain their Browse action while replacing only the empty selection status. Keep the input operable for replacement, and synchronize a displayed native file list to the accepted descriptor after rejection, cancellation and reset. Preserve chooser accessible naming in both states. Clear restores the empty prompt and returns focus to the chooser; focus within the surface remains visible. No preview slot or automatic preview belongs to this binding. Forward label/field associations and expose UiFocusHandle. Report File arrays through select; do not replace the bound descriptor before core acceptance. Pending/rejection are acquisition state. Preserve readonly/disabled restrictions.

```ts
export interface UiFileInputViewProps {
 label:string
 binding:UiControlViewBinding
 file:import('../files/control').UiFileDescriptor<File>|null
 readonly:boolean
 accept?:string
 capture?:'user'|'environment'
 pending:boolean
 rejection:string|null
 chooseLabel:string
 clearLabel:string
 select(files:readonly File[]):Promise<void>
 clear():Promise<void>
}
```


### UiUploadRegionViewProps

Resolved optional composition for `upload.region.v2`. Core owns the workflow binding, permissions, localized text and preview URL lifetime. The backend owns the complete region, native chooser, optional preview/progress/actions and their arrangement. No public content slots are forwarded. Preserve compatible native upload artwork, surfaces and controls; see the [fulfillment table](../../contracts/upload-region.md#backend-fulfillment).

The complete visible rectangle is the drop boundary and must not become a scrollport. Prevent navigation for blocked drops, reject batches atomically, and isolate chooser activation from preview/actions. Preserve a fixed requested allocation through ordinary state changes while making overflowing content keyboard reachable. Optional functions need no reserved rows. `allocatedHeight` supplies a definite local fill offer; presets use backend CSS. Use phase to switch state presentation: acquisition only while ready, file/progress/actions while working, retained file/preview/removal after success. Do not keep a disabled chooser/artwork above every state or render explanatory state paragraphs. Preview displays the filename once. Core supplies progress with cancellation disabled internally because the region action set owns its single Cancel. A removed/disabled focused action transfers focus to an available chooser/action or the named region. Preview failure never releases association.

```ts
export interface UiUploadRegionViewProps {
  phase: import('../files/region-types').UiUploadRegionPhase
  binding: UiControlViewBinding
  label: string
  readonly: boolean
  canAcquire: boolean
  busy: boolean
  occupied: boolean
  revision: number
  fileName: string | null
  issue: string | null
  requiredLabel: string | null
  chooseLabel: string
  accept?: string
  capture?: 'user' | 'environment'
  extent: 'compact' | 'regular' | 'large' | 'fill'
  allocatedHeight?: number
  preview: UiFilePreviewViewProps | null
  progress: UiUploadProgressViewProps | null
  actions: readonly {
    name: import('../files/region-types').UiUploadRegionAction
    label: string
    accessibleLabel?: string
    disabled: boolean
    invoke(): Promise<void>
  }[]
  select(files: readonly File[], revision: number): Promise<void>
}
```


### UiUploadProgressViewProps

Reusable presentation for `upload.progress.v1`; no task ownership. Render activity while active, or recovery when issue/canRetry is present. Never render a progressbar for failed/cancelled recovery; hide when no activity or recovery remains. Unknown or zero total uses an indeterminate horizontal bar; known positive total reflects loaded/total. Compose the same backend UiProgressBar.vue with the resolved `bar: UiProgressBarViewProps`; do not retain separate indicator markup. Requires progress.bar.v1 as well as upload.progress.v1. Respect `canCancel` and route requests through `cancel()`. Render cancelLabel (“Cancel”) visibly and cancelAccessibleLabel (“Cancel upload”) as the accessible name. Region actions similarly supply optional accessibleLabel independently of their visible label. `announcement` selects one polite status host; other visual hosts remain silent. Show the indicator without a duplicate visible status caption. A polite announcement, when requested, is visually hidden and contained by the progress host. Native progress markup, dimensions and animation remain backend-owned.

```ts
export interface UiUploadProgressViewProps{
  bar: UiProgressBarViewProps
  active: boolean
  fileName: string | null
  issue: string | null
  issueId?: string
  retryLabel: string
  canRetry: boolean
  retryDisabled: boolean
  retry(): Promise<void>
  label: string
  loaded: number
  total: number | null
  cancelLabel: string
  cancelAccessibleLabel: string
  canCancel: boolean
  announcement: 'off' | 'polite'
  cancel(): Promise<void>
}
```

Display fileName within the transfer presentation when available, in both activity and recovery, and use it to name the group. Preserve the full text in DOM/title when abbreviating visually. UiUploadRegion must not repeat the filename when its composed progress view displays it; retain the region fallback when no progress presentation is rendered. Render issue once, with the supplied issueId and accessible status semantics; associate Retry with that description. Render available Cancel and Retry as separate actions in failure. Cancel invokes cancel() to abandon recovery; Retry honors retryDisabled and calls retry(), never the underlying task. UiUploadRegion passes the same presentation for transfer recovery; its own issue retains invalid state and references but must not be painted again when progress.issue already supplies the text. Acquisition/delivery feedback stays region-owned. Recovery layout must account for Retry without an error after optional cancellation recovery.


### useUiUploadProgressView

Optional backend helper returning a root ref for the actual progress/recovery group. Attach root and tabindex=-1 to that group. It preserves keyboard context when Retry is replaced by the next attempt's actions, including the validation interval and the brief rendering gap before immediate failure feedback, without overriding focus moved elsewhere. Terminal hiding releases retained context after the current event-loop turn; unmount cancels deferred cleanup. Inside a region, the region helper owns focus across chooser and hosted actions. It does not own task lifetime, error markup or styles.


### useUiUploadRegionView

Optional shared interaction helper: `useUiUploadRegionView(props: UiUploadRegionViewProps)`. Returns `root` and `input` refs, `dragging`, chooser `labelled` attributes, `choose`, `rememberChooser`, `changed`, `dragover`, `dragleave`, `drop` and asynchronous `focus`. Attach refs to the actual region and native file input. Use `choose` for a separate trigger or `rememberChooser` on a visible native input. Bind drag/drop handlers to the full region; suppress competing native upload handlers where necessary. Chooser generations and core callbacks guard stale results. The helper anchors no markup and supplies no styles; adapters still own native integration, hidden-description containment and focusable region markup.


### UiPreviewRegionViewProps

Read-only field control presentation for `preview.region.v1`, with a default preview slot:

```ts
export interface UiPreviewRegionViewProps {
  binding: UiControlViewBinding
  label: string
  extent: 'compact' | 'regular' | 'large'
}
```

The binding and label come from UiField, never from a public region label prop. Provide a clearly defined field-control surface using native frame facilities/theming, consistent with ordinary controls in the backend. A full outline is not required for a native filled surface with a bottom border; group semantics do not dictate a visual group box. Keep the viewport bounded, center content and clip overflow. The image renderer remains borderless. Preserve the frame and allocation when empty/loading/failed, and preserve child identity on field-label/extent updates. Reflect disabled and semantic invalid/busy state; use existing field strategy helpers for visible failure styling and live description associations. Field views own visible labels/help/errors; native integrated label presentation may consume their backend context.

Use named group semantics for arbitrary preview content. Do not put unsupported aria-readonly/aria-required on a group, manufacture a textbox, create a tab stop, edit data, trigger validation or add actions/status prose. UiField supplies group-level required descriptions and existing invalid-feedback focus behavior. Single-line input widgets cannot host arbitrary preview children; adapting frame facilities preserves toolkit styling without creating a fake input.


### UiImagePreviewViewProps

Image-only presentation for `image.preview.v1`. Fit the whole image centered using contain by default; stretch fills the final bounds without preserving aspect ratio. Use explicit dimensions or the containing allocation; preserve intrinsic aspect ratio for an unspecified dimension. Remove native avatar framing, captions, textual placeholders and extra actions. The parent owns clipping. Failure/missing content uses a recognizable broken-image glyph inside the supplied bounds, with the alternative text available to assistive technology. No filename/metadata is passed to this binding.

```ts
export interface UiImagePreviewViewProps {
  url?: string
  alt: string
  fit?: 'contain' | 'stretch'
  width?: number | string
  height?: number | string
}
```


### useUiImagePreviewView

`useUiImagePreviewView(props: UiImagePreviewViewProps)` supplies reactive failed/natural state, computed dimension/fit style, loaded/error handlers and an isCurrentSource predicate. It owns no markup or URL lifetime. Bind the style to the sizing host, use the CSS fit value on the actual image, and render a backend-owned accessible broken-image glyph on failure. Native toolkit adapters may report natural dimensions through their supported load APIs. Source guards compare relative/absolute URLs consistently; stale events cannot change current state. Explicit-only width/height leaves the other dimension auto; both omitted use the containing allocation. Core rejects unsupported fits and invalid numeric dimensions.


### UiFilePreviewViewProps

Render image-only content for image=true unless thumbnail=true; otherwise render file icon, filename and formatted size. With thumbnail=true, image files use a contained thumbnail in the icon allocation, preserving filename/size and dimensions through loading/failure. Missing/failed thumbnails use the MIME-family icon, including catalogue overrides. Keep the thumbnail decorative alongside the filename; alt names the separate image-only presentation. Non-image URLs must not be loaded as thumbnails. Tile is the default (centered large icon above name/size); Row places a smaller icon at logical start beside stacked name/size, with a more prominent name. Preserve the full filename in DOM/title while ellipsizing visually. Do not add borders or change presentation because an upload-region ancestor exists. Previews do not include an Open file link or implicit navigation. Preserve alternate text. Core supplies the URL and owns any local object URL lifetime; the backend must not revoke application URLs.

```ts
export interface UiFilePreviewViewProps {
 thumbnail?: boolean
 presentation?: 'tile' | 'row'
 mediaType?: string
 name:string
 size?:number
 url?:string
 image:boolean
 alt:string
}
```


### useUiFilePreviewView

The canonical [supported icon families](../components/UiFilePreview.md#supported-icon-families) table defines shared MIME classification, precedence and application artwork overrides for every backend.

`useUiFilePreviewView(props: UiFilePreviewViewProps)` returns computed `kind`, `sizeLabel` and optional application `icon` artwork. It classifies normalized MIME types, falls back to file, and formats valid nonnegative byte sizes using the current formatting locale and B/KiB/MiB/GiB/TiB (at most one decimal above bytes). It also supplies computed `thumbnailImage`: either undefined (render the icon) or a source object with `url` and `error`. Bind that source object’s error handler directly without a cached wrapper that resolves the latest source; late events must stay associated with their original source. Source or mode changes reset failure, while stale errors are ignored. It supplies no markup, CSS or default artwork. `icon` resolves an explicit application `file.<kind>` override, then an explicit application `file` override, then a backend `file.<kind>` entry if supplied; otherwise the backend supplies its own family glyph. The required common default `file` does not override MIME-family artwork. The filename remains the descriptor's full string. Keep icons square and decorative; content and controls remain backend-owned.


### UiFileCollectionViewProps

Render stable keyed items using the scoped default slot. Name remove actions with the supplied localized label and descriptor name. Removal reports a key and respects disabled/removable.

```ts
export interface UiFileCollectionViewProps {
 files:readonly import('../files/control').UiFileDescriptor[]
 removable:boolean
 disabled:boolean
 removeLabel:string
 remove(key:string):void
}
```

