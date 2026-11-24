# UiFilePreview

Descriptor-based file preview. Import from `@uninterface/uninterface` in an application initialized by createUiApplication.

Place this component where the business composition needs an independent preview, for example beside UiFileInput. [UiUploadRegion](../../contracts/upload-region.md) also supports optional internal preview through its preview prop; its backend owns that arrangement, with no content slots. An external preview owns its own URL lifetime and never controls acquisition locks.

## API

Required `file: UiFileDescriptor`, optional `alt?: string` (defaults to file name), `presentation?: 'tile' | 'row'` (defaults to `tile`), and `thumbnail?: boolean` (defaults to `false`). No public slots, events or exposed handles. Without thumbnail mode, image media types delegate to the image-only UiImagePreview (including its broken-image fallback), without a caption; other files show a file icon, filename and size. No Open file action or implicit click-to-open behavior is included.

```vue
<!-- Tile is the default. -->
<UiFilePreview :file="attachment" />
<UiFilePreview :file="attachment" presentation="row" />
```

Tile centers a large icon above the filename and size. Row puts a smaller icon at the logical start with filename and size stacked beside it; the filename is more prominent. The selection stays fixed as space changes. Both fit the allocated width, truncate long filenames visually with ellipsis, and preserve the full name in the DOM and title. The current truncation is at the end; the extension is not separately reserved. Unknown sizes are omitted; zero is `0 B`. Finite nonnegative sizes use 1024-based B/KiB/MiB/GiB/TiB with at most one decimal above bytes and locale-aware number formatting (for example `12.4 KiB`, `3.2 MiB`). Values beyond TiB remain expressed in TiB. Invalid negative/nonfinite sizes are omitted.

Icons are decorative and never introduce extra visible type labels or actions. A previewUrl does not change the original file's media type or imply a document-thumbnail contract.

Use inside [UiPreviewRegion](UiPreviewRegion.md) when a read-only field frame is needed. The renderer adds no border. Without thumbnail mode, images retain the existing image-only branch; presentation applies only to non-image content. Upload-region previews use Tile by default too, without ancestor-specific rearrangement. Collection design remains a separate concern.

## Thumbnail summaries

Enable `thumbnail` for a unified summary of mixed files. Tile/Row then applies to images too: an image replaces the icon while filename and size remain in their usual positions.

```vue
<UiFilePreview :file="attachment" thumbnail />
<UiFilePreview :file="attachment" thumbnail presentation="row" />
```

The backend owns the square visual bounds for each presentation. Images preserve their aspect ratio within those bounds, without cropping, borders or avatar treatment. Loading, success and failure retain the same allocation. A missing or failed image uses the file's MIME-family icon (the generic family for images), including application artwork overrides. The thumbnail is decorative alongside the filename; `alt` continues to name the separate image-only presentation. No captions, loading text or recovery actions are added.

Currently, only image media types supply thumbnails, using the existing previewUrl/contentUrl/local Blob URL resolution. Other files keep their icons even if they have a previewUrl; an image-thumbnail descriptor for non-image documents is not defined. UiImagePreview remains image-only and keeps its own broken-image fallback.

The Files demo's Retained attachments opts into thumbnail Tiles as media fields in UiCollectionView’s card grid, with a separate top-end Remove action. It remains saved results from the dummy server; this option adds no acquisition workflow or collection API.

## Supported icon families

The MIME-to-family mapping is shared across supporting backends. Backends choose the artwork for each family; a family does not guarantee a particular glyph or distinct artwork from every other family. Image files use the image-preview branch by default; thumbnail summaries use a generic file icon when the image is unavailable.

For file-family selection, MIME parameters are removed, surrounding whitespace is trimmed, and letter case is normalized. Filename extensions do not participate. The following table lists all supported matches, in selection order; `*` means any subtype.

| Family | MIME types | Optional catalogue key |
| --- | --- | --- |
| PDF | `application/pdf` | `file.pdf` |
| Audio | `audio/*` | `file.audio` |
| Video | `video/*` | `file.video` |
| Archive | `application/zip`, `application/x-zip-compressed`, `application/gzip`, `application/x-gzip`, `application/x-tar`, `application/x-7z-compressed`, `application/vnd.rar`, `application/x-rar-compressed` | `file.archive` |
| Spreadsheet | `text/csv`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/vnd.oasis.opendocument.spreadsheet` | `file.spreadsheet` |
| Presentation | `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`, `application/vnd.oasis.opendocument.presentation` | `file.presentation` |
| Code | `application/json`, `application/ld+json`, `application/xml`, `text/xml`, `text/html`, `text/css`, `text/javascript`, `application/javascript` | `file.code` |
| Document | Remaining `text/*`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.oasis.opendocument.text`, `application/rtf` | `file.document` |
| Generic file | All other types, including missing or unknown MIME | `file.file` |

Specific text types take precedence over the general Document match: CSV selects Spreadsheet, while HTML, XML, CSS and JavaScript select Code. Unlisted MIME types are not inferred from suffixes; for example, `application/vendor+json` selects Generic file.

Artwork selection first uses an explicit application `file.<family>` override, then an explicit application `file` override, then a backend catalogue `file.<family>` entry if supplied, then the backend's own MIME-family artwork. The common default `file` entry serves name-only UiIcon requests and never masks file-preview family artwork. `file.file` overrides only the generic family; `file` supplies a fallback for every family without its own override. Family entries remain optional; `file` is a required common name. Explicit override intent is retained per application, even when its component matches a default. Overrides change artwork, not MIME classification.

File glyphs use backend-owned scalable artwork appropriate to the file family. No icon service or whole icon-library import is needed; provenance belongs in backend documentation.

## Ownership and implementation

Core resolves previewUrl, contentUrl or a local Blob object URL. Only URLs created by this mounted preview are revoked, on replacement/removal. Core supplies the MIME type and presentation request. Shared view mechanics classify supported MIME families and format sizes using the application formatting locale; backends own layout and artwork. Backends supply image/file presentation and accessible naming; business URLs remain business-owned.

See the [descriptor-based file preview guide](../../guides/files.md) for setup and composition.

## Observable verification

DOM checks cover both presentations, default Tile, MIME families/fallback, byte-unit boundaries, missing/zero/invalid sizes, formatting locale, custom artwork, full filename preservation, image-only delegation, thumbnail metadata and fallback in both layouts, replacement after failure, stale image errors and retained upload previews. File-input/upload tests retain URL lifetime and state checks. Browser scenarios check square icons, tile/row placement, allocated bounds and ellipsis; browser execution is a separate acceptance step.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
