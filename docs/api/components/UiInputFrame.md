# UiInputFrame

Composes one field-owned value into a coherent input surface containing ordinary editors, icons, text and actions. The existing field owns the draft, codec, validation and reset baseline. The frame coordinates participation and interaction; it creates no second value owner.

Import from `@uninterface/uninterface`, inside UiField and an application initialized with createUiApplication. Requires backend `input.frame.v1`, `input.frame.cooperation.v1` and `control.focus.v1`. Use an ordinary UiField for a single string editor and `group` for several named projections. See the [usage and extension guide](../../guides/input-frames.md).

| Prop | Type | Default | Meaning |
|---|---|---|---|
| disabled | boolean | false | Tightens field availability for admitted editors and actions |
| readonly | boolean | false | Blocks editing and actions unless an action explicitly permits readonly activation |
| zOrder | UiZOrder | omitted | Outward stacking identity; see [stacking](../../guides/dynamic-z-order.md) |

Default content may interleave the supported children. Optional leading/trailing slots are conveniences in logical reading order. All three slots receive `{ disabled, readonly, focus }`. There is no frame-level modelValue: the frame obtains its owner through UiField.

## Supported composition

| Child | Contract |
|---|---|
| Single-line UiTextInput | Implicit whole-string draft, or explicit `projection`; inherits restrictions, naming, feedback and shared surface |
| UiButton | Keeps native action/form semantics and visible action focus; blocked under frame readonly unless `allowWhenReadonly`; reset remains blocked |
| [UiSpacer](UiSpacer.md) | Invisible content participant; receives spare inline space after capped editors grow; no value or tab stop |
| UiIcon | Passive square artwork, preserving its existing optional accessible name |
| Text and passive native wrappers | No value binding or extra focus stop; supported wrappers are listed in the guide |
| UiPopover | Cooperating forwarder: host/reference participates; popup content starts outside frame field/surface scope; engagement remains coordinated |
| Custom declared participant | Must fulfill the public declaration/runtime contract and explicitly forward selected children |

Unknown components are errors, including an unaware wrapper around a supported editor. Component names do not establish support. Native inputs/buttons, checkbox, select, multiline, arbitrary third-party controls, and direct nested UiInputFrame are outside this automatic contract. Async component wrappers, Teleport, Transition, Suspense and KeepAlive are not directly admitted; their integration belongs inside a declared participant. A component declaration establishes obligations, not certification of arbitrary code.

The frame examines its supplied VNodes until a component boundary. A declared forwarding component uses the same discovery implementation for its selected children. Vue injection and DOM ancestry alone never authorize participation. Passive wrappers cannot conceal unsupported children. Missing/incompatible declarations, unauthorized forwarding, duplicate editing targets, wrong-owner projections and unsupported multiline editors produce actionable errors. Exact malformed render output can fail earlier in Vue; runtime diagnostics do not prove custom implementation correctness.

## Values, names and lifecycle

A whole-string editor uses the field label, retaining an accessible name under a hidden-label strategy. Named projections provide their own labels and distinct IDs; the grouped field names the compound value. Do not duplicate whole-value editors in one frame or supply a projection from another field. Projection identities are explicit and never inferred from child order. Changing an editor's target/owner requires a keyed remount. Conditional removal preserves the field's draft and baseline.

Typed projection updates preserve live siblings, retain incomplete strings and synchronously invalidate obsolete validation. Existing checked-field revalidation still applies. No independent projection validation result is created. Programmatic field changes are reflected by editors; the business owns control lifetime and disposal.

Emits focus once on entering the interaction and blur on departure when no owned popup retains engagement. Movement among editors/actions or an owned suggestion popup does not validate. Suggestion acceptance updates the draft without requesting whole-field validation; departure and Save/Apply use the existing owning policy. Pending validation is busy state, not an edit lock.

The exposed `focus(): Promise<boolean | null>` prefers an attributed invalid editor, then an available registered editor. Empty-surface clicks follow the same route; actions retain activation/focus. Disabled targets are skipped. Disposed/deactivated participants release registration and popup engagement. See [common focus results](../../guides/controls.md#focus).

Disabling the frame removes its own focus target as well as disabling its editors/actions. It releases focus held inside the surface and clears focused/engaged presentation. Clicking or directly focusing a disabled surface cannot reactivate it. Readonly text remains focusable for inspection and selection.

## Implementation and verification

Core owns value coordination, admission, restrictions and validation timing. Backend views own native markup, one outer surface, local spacing/wrapping, labels, state paint, action focus and real target attributes. They retain each editor's semantic invalid state while suppressing competing inner highlights. Business authors supply no borderless flags or backend styling.

In horizontal `UiLayout align="baseline"` rows, the frame exports its first editable text baseline through the field/form composition. Leading icons, spacers and actions must not replace that reference. Above-labelled fields still expose their label row. See [field alignment](../../guides/field-alignment.md#selectable-peer-baseline-alignment).

Verify scalar and projection updates, malformed text, unique names/IDs, readonly opt-in precedence, native submit/reset association, conditional identity, popup engagement/isolation and cleanup. Inspect sizes, narrow widths, RTL, themes, native search clearing, selection and IME in real browsers. DOM and SSR checks do not establish visual or assistive-technology acceptance.
