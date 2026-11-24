# UiUploadRegion

A visibly framed single-file acquisition region with backend-owned internal presentation. Import from `@uninterface/uninterface`. Business authors select optional functions; they supply no internal component layout or content slots.

```vue
<UiField :field="attachment" label="Profile image">
  <UiUploadRegion :binding="upload.bindings.region" accept="image/*" />
</UiField>
```

## API

| Prop | Default | Meaning |
|---|---|---|
| `binding: UiUploadRegionBinding` | Required | Acquisition/association owner; no v-model:file or upload-controller combination |
| `progress?: boolean` | Upload support | Include the activity indicator; false leaves transfer feedback, selected Retry, busy state and locks intact |
| `preview?: boolean` | Retained destination | Include associated-file preview; false does not release association |
| `previewAlt?: string` | File name | Alternative text for internal preview |
| `actions?: readonly UiUploadRegionAction[]` | Supported actions | Participation set: cancel, retry, retryDelivery, remove. Not order or permission; [] omits optional actions |
| `accept?: string`, `capture?: user or environment` | Omitted | Browser acquisition hints, not validation |
| `disabled?: boolean`, `readonly?: boolean` | False | Local interaction restrictions; readonly permits an otherwise available Cancel |
| `extent?: compact or regular or large or fill` | regular | Stable requested allocation, distinct from control density |

No public slots or workflow events. Exposes the existing `focus(): Promise<boolean | null>` handle. UiField supplies label/feedback integration; standalone usage supplies an accessible name through aria-label/aria-labelledby. A non-group UiField must match the factory binding's destination. Custom producers must preserve the same ownership contract. Multiple-file/directory acquisition and legacy model/controller props fail explicitly.

Tab reaches available chooser/actions directly, without an extra stop on the named group. The group remains a programmatic fallback when no action can accept focus. Backends may show ordinary area-chooser focus on the complete upload surface; separate recovery actions retain their own indicators. Enter and Space activate the chooser once.

A disabled region and its acquisition/actions cannot receive focus through Tab, pointer interaction or its focus handle (which returns false). Disabling a focused region releases its internal focus; recovery cannot restore focus there. Its whole surface visibly reflects disabled state using the backend's control treatment. Readonly remains distinct: available inspection/fallback focus and permitted Cancel remain possible. Blocked drops still prevent browser navigation.

Preset dimensions are backend-owned; current regular defaults are 8–12rem with no shared minimum. The full rectangle is named and never scrolls internally. Content must fit its allocation; hosts honor the [backend minimum sizes](../../contracts/upload-region.md#backend-minimum-allocation). Long names/error summaries may ellipsize while retaining full DOM text and title; essential actions must remain visible and operable. Optional functions create no reserved blank rows. `fill` requires a definite local Uninterface height offer; unsupported/unbounded hosts fail explicitly. Parent layout supplies width.

Presentation follows the workflow phase: ready shows the native chooser; active transfer shows file/progress/actions; retained success shows file/preview/removal. The chooser is absent while busy or occupied. Failure returns to a chooser plus one concise error and optional Retry. Service success returns to ready after handoff. There are no default instruction/status paragraphs. The preview owns its displayed filename, and progress has accessible naming/announcements without a repeated visible caption. See the [state table](../../contracts/upload-region.md#state-presentation).

## Ownership and implementation

[createUiUploadRegionControl](../functions/createUiUploadRegionControl.md) owns candidate/task/delivery coordination; the destination owns business value. [UiUploadRegionBinding](../types/UiUploadRegionBinding.md) includes associated descriptor, role, progress and guarded named actions. The region resolves those into backend data/callbacks; it never imports a backend-independent DOM tree.

Transfer failure and Retry reuse UiUploadProgress presentation inside the region; candidate rejection and delivery recovery remain separate. Backends own compatible native field/drop-area appearance, optional progress/preview/action arrangement, trash removal, focus transitions and full-boundary dropping. Chooser activation is separate from independent actions. Uploading and association block both browse and drops, even when progress/preview are elsewhere. Blocked drops prevent browser navigation. Internal preview creates/releases only its own object URLs; hidden preview creates none. Task/controller lifetime survives view unmount. See the [file guide](../../guides/files.md) and [native fulfillment](../../contracts/upload-region.md#backend-fulfillment).

## Observable verification

Exercise retained and service workflows, optional functions independently, multi-file rejection, stale chooser results, failed preview locks, recovery and full-region dropping. Verify focus remains meaningful when actions disappear and descriptions point to existing IDs. Compare complete-region and neighboring geometry across states, sizes, locales and narrow allocations. Unit/DOM evidence does not certify browser geometry or native visual acceptance.

The retained preview is centered relative to the complete region. Removal uses a separately aligned icon-only trash button at the logical end (right in LTR), with a localized accessible name and hover title. The action must not shift the preview's center or overlap its content; removal remains keyboard operable and the preview remains accessibly named within the same region. With preview omitted, the filename occupies the centered content position.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
