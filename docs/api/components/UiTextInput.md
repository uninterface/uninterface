# UiTextInput

Edits a text representation of a field value. Codecs determine what that text means; a decimal keyboard hint does not define numeric parsing or validation.

UiTextInput is an [input-styled control](../../contracts/input-styled-controls.md): its ordinary mode uses one input row, fills the allocated field-control width and aligns to the logical start. `multiline` is the explicit textarea adaptation of the same style. The backend supplies the coherent input surface and focus/state treatment; business authors do not add presentation CSS.

```vue
<UiField :field="amount" label="Amount"><UiTextInput inputmode="decimal" /></UiField>
```

Import from `@uninterface/uninterface`. Must be inside [UiField](UiField.md), in an application initialized with `createUiApplication`. Use a field whose editing representation is a string, such as a string field or an amount field with a string codec.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `type` | `'text' \| 'password' \| 'search'` | `'text'` | Ordinary or masked single-line text; password mode does not encrypt or otherwise protect stored values |
| `minWidthCharacters` | positive integer | Omitted | Minimum editor allocation in character cells inside UiInputFrame; does not limit input length |
| `maxWidthCharacters` | positive integer | Omitted | Approximate maximum display width in character cells for a single-line editor inside UiInputFrame; does not limit input length |
| `projection` | UiInputProjection | Omitted | Named string target inside UiInputFrame; omission selects its whole string draft |
| `multiline` | `boolean` | `false` | Edit text with line breaks using a native textarea or toolkit equivalent |
| `readonly` | `boolean` | `false` | Prevent user edits while allowing focus, selection and copying; preserves validation/submission participation |
| `disabled` | `boolean` | `false` | Additional editing restriction; see [common control API](../../guides/controls.md) |
| `inputmode` | `'text' \| 'decimal'` | `'text'` | Input-method hint |
| `autocomplete` | `string` | `'off'` | Browser autocomplete purpose/token |

The implemented API has no slots or component-specific public emitted events. Standard input-target attributes/listeners, including `@keydown.enter.prevent`, are forwarded. Do not override the field's generated `id`, value, disabled state, or ARIA associations. A template ref exposes `focus(): Promise<boolean | null>`. See the [common control API](../../guides/controls.md#focus) for results, timing, errors and disabled behavior. This handle works even if the backend adds wrapper elements.

Core writes reported text via `field.set`. On blur it awaits `field.validate()`, applying codec parse-and-format before publishing validation feedback. Automatic checks of an already checked field update feedback while preserving the text as typed. Malformed input stays available for correction; formatting a parseable draft does not establish a new baseline. The backend receives a value and accessibility/availability binding, displays the text without coercing it, and reports edits/blur. It owns the native input or equivalent component, DOM event translation, naming/description wiring, visible focus, and the focus handle. It must not parse business values or start a competing validation engine.

Use the same field/codec model for all text modes:

```vue
<UiField :field="password" label="Password">
  <UiTextInput type="password" autocomplete="new-password" />
</UiField>
<UiField :field="notes" label="Notes"><UiTextInput multiline /></UiField>
<UiField :field="reference" label="Reference"><UiTextInput readonly /></UiField>
```

`password` or `search` with `multiline` throws and renders no editing surface. Password masking is a display mechanism, not secure storage; consumers own secret handling and choose the appropriate autocomplete purpose. Optional [Password reveal](#password-reveal) is implemented as an integrated input action. Multiline preserves line breaks and ordinary Enter editing; business keyboard listeners must not accidentally turn Enter into submission. Initial textarea height and resizing follow backend defaults; standard textarea attributes such as `rows` are forwarded.

Readonly is local to this editor and does not mutate the field control or imply disabled. Core rejects reported user edits, including before rerender; business `set`, `accept`, reset and validation remain available under their own control restrictions. Blur still requests validation. Backend views must apply native readonly behavior and retain the same label/description relationships. Removing readonly restores editing without losing the draft or focus. UiField has no readonly prop.

Changing single-line/password type retains the native input where supported. Switching between single-line and multiline may replace the editing target; the field draft remains intact, and the exposed focus handle addresses the current target. Shared frames use the participation rules below; native IME behavior remains backend/browser-owned.

Acceptance: typed text survives parse failure, blur publishes feedback, disabled fields resist edits, keyboard listeners reach the target, and imperative focus reaches it.

The backend exposes pending validation through accessible busy state, independently of editing availability. Current validation failures to complete propagate through Vue error handling; they are not turned into field issues.

Requires backend `control.focus.v1` for the shared focus handle. Explicit readonly, password and multiline requests require `input.text.readonly.v1`, `input.text.password.v1` and `input.text.multiline.v1` respectively. Verify masking, line-break retention, native target listeners, readonly focus/copy behavior, disabled precedence and programmatic field updates in each mode.

## Shared-frame participation and search

Inside UiInputFrame, single-line editors automatically delegate their surface, inherit restrictions and coordinate focus/feedback through the declared contract. Use projection for named bounds of a structured field; do not supply a different field or duplicate a target. Standalone editors do not accept projection. Unknown wrappers must explicitly declare and forward participation. See [input frames](../../guides/input-frames.md).

`minWidthCharacters` establishes a minimum editor allocation in the current font's zero-glyph cells (`ch`). It is useful for a search editor in a content-sized row: `<UiTextInput type="search" :min-width-characters="20" />`. Frame padding, prefixes and actions add their own space. The minimum is a display constraint, not minlength or a required query length. It requires a single-line editor inside UiInputFrame and `input.frame.min-width.v1`; omitted values retain backend defaults. Values must be positive safe integers. If both bounds are supplied, minimum must not exceed maximum; equal bounds are valid. Changing either bound retains the editor and draft.

An explicit minimum takes precedence over shrinking to a smaller host or a percentage-based maximum. Authors must supply enough space for the editor or choose a smaller minimum for their responsive policy; frame actions and neighbouring layout items may wrap independently. This is a true minimum, not a preferred width that silently shrinks. The built-in search-filter presentation uses 20 cells for labelled rows and 10 for its compact hidden-label treatment; the Shared input frame keyword example uses 20. UiTextInput itself retains its ordinary sizing default.

`maxWidthCharacters` caps the editor allocation using the current font's zero-glyph width (`ch`). It is approximate visible capacity, not maxlength, numeric precision or validation. Invalid/nonpositive/noninteger values and use outside a frame throw. Editors retain normal growth when omitted. Capped editors can shrink with the frame allocation; longer text remains editable through native horizontal scrolling. Backends apply the cap to the actual toolkit wrapper, keeping the native input filling its allocation, and preserve focus/identity when it changes. Requires `input.frame.sizing.v1`.

For ten numeric digits plus a decimal separator, use `:max-width-characters="11"`. Additional prefixes, signs, grouping separators and integrated actions consume their own space; applications choose an appropriate capacity. Combine with [UiInputFrameSpacer](UiInputFrameSpacer.md) after a currency suffix to leave spare space there. No input length constraint is installed.

Framed editors do not validate on individual blur or suggestion acceptance. Updates synchronously invalidate obsolete results; checked-field feedback policy remains active, and whole-interaction departure requests validation. Names/IDs and descriptions are supplied by the field/projection. Native copy/selection and password reveal remain available under readonly; disabled still blocks relevant actions.

Search is a single-line native input type, compatible with suggestions and ordinary hints. It requires input.text.search.v1, excludes password reveal/multiline, and does not itself choose query execution or supply a magnifier. Backends preserve native search clearing without adding duplicate clear actions.

## Password reveal

Reveal changes presentation only; the field value, dirty state, codec and submission ownership remain unchanged.

| Template property | Type | Meaning |
|---|---|---|
| password-reveal | boolean | Enables locally owned visibility; explicit false suppresses all reveal mechanisms |
| password-revealed / v-model:password-revealed | boolean | Controlled visibility; presence also enables reveal unless explicitly suppressed |
| password-reveal-shortcut | string or null | Exact key/modifier combination; presence of a string enables reveal, null disables the shortcut only |

```vue
<UiTextInput type="password" password-reveal />
<UiTextInput type="password" v-model:password-revealed="passwordVisible" />
<UiTextInput type="password" :password-reveal-shortcut="revealShortcut" />
```

These editors belong inside UiField. Local visibility starts hidden. Controlled visibility renders the supplied boolean and emits update:passwordRevealed on interaction; the owner decides whether to commit. A bound false means masked, not disabled. A one-way true prop keeps the editor shown while enabled until the owner changes it. Explicit password-reveal=false masks and hides the action without overwriting the owner's boolean.

No shortcut is selected by default. A shortcut is optional modifiers Alt, Control/Ctrl, Shift or Meta followed by one KeyboardEvent.key, separated by +. Modifiers must match exactly; repeated keys and IME composition do not toggle. The application chooses a combination appropriate to its operating environments. Null alone does not enable reveal. Reveal options require password mode; password multiline remains invalid.

Disabling always masks the rendered editor; local visibility resets on disable, deactivation or feature removal. An external visibility value remains owner-supplied. Re-enabling a controlled true value shows it again. Backends render a localized, named non-submit toggle, preserve editor identity and retain native focus behavior. Verification covers stable value/dirty state, pointer/shortcut toggling, controlled transitions and disabled masking.

## Suggestions

`suggestions?: UiTextSuggestionsBinding` integrates single-line text completion. It is incompatible with password or multiline mode. Accepted candidates project text into the field; standalone editors request validation, while framed editors leave explicit validation to whole-interaction departure or the owning operation; programmatic synchronization does not search. See the [search guide](../../guides/search.md).

The search control's text-input binding omits candidates whose insertion text exactly equals the draft. The optional `#suggestion` slot customizes option content using the [UiSuggestions slot contract](UiSuggestions.md#api).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
