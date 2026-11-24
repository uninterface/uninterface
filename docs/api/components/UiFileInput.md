# UiFileInput

Single local file acquisition. Import from `@uninterface/uninterface` in an application initialized by createUiApplication.

UiFileInput is an [input-styled control](../../contracts/input-styled-controls.md): chooser trigger, selected filename as text, and clear action share one input surface. It normally fills the field-control allocation, aligns to logical start, and keeps meaningful visible focus across its interactive parts. It does not render a preview or accept a preview slot. Compose [UiFilePreview](UiFilePreview.md) separately when wanted.

## API

Optional `file?: UiFileDescriptor<File> | null` with `update:file` supports v-model:file. Inside UiField, the field is the sole owner instead; do not supply file too. `disabled`, `readonly` default false; `accept?: string` and `capture?: "user" | "environment"` are chooser hints. `validateFile` returns string|null or a promise. Emits reject(issue). No public slots. Exposes the common asynchronous focus handle. Multiple and directory acquisition are rejected.

```vue
<UiField :field="attachment" label="Attachment"><UiFileInput accept="image/*" /></UiField>
```

## Ownership and implementation

Core validates a candidate before replacement, preserving the previous file on rejection. The backend owns chooser markup, integrated clearing, input styling and focus. Display the accepted descriptor’s name even when the native file list is reset for same-file reselection. Custom placeholder-style presentations replace their empty chooser prompt with the accepted filename and integrated Clear action. Native file inputs may keep a Browse button beside the filename; only their empty selection status is replaced. The input remains operable for replacement, and Clear restores the empty state and returns focus to the chooser. Filename display is selected-value text, not a preview. File type hints are not security validation; the application and server validate content. Reset restores the descriptor baseline; adapters that display a native file list synchronize it to that accepted descriptor.

Backends may use a visible native file input or an adapted chooser. Browser-owned wording follows browser localization; application-owned labels follow application localization. Accepted values, reset, replacement, rejection/cancellation and same-file reselection must remain synchronized without assigning a local path. The [HTML file-list API](https://html.spec.whatwg.org/multipage/input.html#dom-input-files) supports native coordination. Concrete chooser integration belongs in backend documentation; physical chooser behavior requires browser verification.

See the [single local file acquisition guide](../../guides/files.md) for setup and composition.

## Observable verification

Verify rejected replacement preserves the previous descriptor, readonly cannot clear, same-file reselection works, native chooser names/help/errors are associated, the accepted filename replaces the empty selection status, survives native-list clearing/rejected replacements/form reset, clearing restores the prompt, and selecting a file creates no preview or object URL. Compare field width, logical alignment, focus and states with ordinary inputs in the same backend.

Clear is an integrated input action. Backends preserve compatible native clear slots or compact input-action treatment, including the selected input size; a standalone button must not enlarge the frame when a file appears. Compare empty, selected and cleared states at supported sizes in a real browser. Native readonly/disabled presentation may hide Clear instead of showing it disabled.

## Stacking

`zOrder?: UiZOrder` describes outward stacking. It establishes a stable outward context containing native local decoration; its view attaches the actual rendered roots without an additional wrapper. See [dynamic stacking](../../guides/dynamic-z-order.md) for scope, lifetime, pending refs and observable overlap checks. Core owns order; the backend owns rendering targets.
