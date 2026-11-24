# Dynamic z-order


## Ownership and scope

Core owns instance identity, relationships, logical order, shared widths, numeric encoding, transactional updates and diagnostics. Backends attach actual rendering surfaces and preserve that order while owning markup, native presentation, geometry and animation. Strategies may submit declarations; they cannot supply another allocator. Native toolkit counters must not override core values.

### Backend stacking rules

- Core is the sole source of ordering between components, allocations, and popup surfaces. Use the shared registration protocol for their actual rendered boundaries. Remove backend-assigned ranks and suppress toolkit defaults, offsets, and runtime writes wherever they could compete with that order, including ranks inherited through a borrowed toolkit class. Use a toolkit opt-out where available. Shared projection may neutralize writes on a registered target. A competing sibling or intermediate wrapper needs its own scoped adaptation.
- A backend may retain local paint order for parts such as an arrow, a sticky cell, or a loading mask when a verified enclosing stacking context contains the entire relationship. Document the containing boundary and the reason for the rank. A small number, a positioned ancestor by itself, or logical descent does not establish containment. Ensure local ranks cannot compete with a managed surface or constrain its required placement.
- Host each owned popup inside its enclosing native top-layer surface when required. Register the popup's actual positioning root. Branches that own no popup must forward the inherited scope. A CSS rank cannot move document content into the browser's top layer. See [CSS Positioned Layout, top layer](https://drafts.csswg.org/css-position-4/#top-layer).
- Keep native positioning, focus, and dismissal behavior where it fulfills the contract. Suppress native stack participation when it grants a local presentation authority over unrelated surfaces, such as a busy indicator taking Escape priority from an open menu. Assess keyboard and pointer dismissal separately from paint order.
- Review imported and generated CSS, inline styles, native counters, and physical hosting when adding or upgrading an adapter. Verify exact target identity and actual overlap in a browser. Exercise Escape, focus return, outside dismissal, and exit where native stack participation changes. Record the scope of verified coverage.

The selected band order is **Surface → Layer → Group → Local**. A later surface dominates all layers/groups/local parts of an earlier surface. Interactive popups attach to Floating in their owning surface or inherit an enclosing popup group. An ordering parent differs from the business owner, anchor and DOM parent. Teleporting does not change logical membership.

Built-in layers are **Background/mask < Content < Floating**. Raised content stays in Content. Named application/plugin extensions declare relationships to existing names. They cannot reverse the built-in order. Core validates extension policy even with no open surface and updates all live surfaces in one transaction. Layer definitions last for the domain lifetime; removing definitions while referenced is not supported.

## Canonical paths and packing

An explicit registration introduces one rank at its declared band. Ordinary components retain passive identities: nesting adds no rank or CSS context until a declaration or reference materializes the participant. Table/list/collection/file-input surfaces establish an outward context to contain native decoration. Slots are ordered first by band significance, then by the count of same-band ordering ancestors. Every participant uses the same slot vector. Omitted slots contain zero. Positive sibling digits start at one; zero represents parent paint or an omitted suffix, so a parent is distinct from its first descendant.

For example, using slots `[Surface0, Layer0, Group0, Group1, Local0]`:

| Participant | Digits | Meaning |
|---|---|---|
| Page | `[1, 0, 0, 0, 0]` | Parent paint |
| Content group | `[1, 2, 1, 0, 0]` | First group inside Content |
| Nested group | `[1, 2, 1, 1, 0]` | First subgroup, preserving the group's prefix |
| Next content group | `[1, 2, 2, 0, 0]` | Above the entire preceding group |
| Owned popup | `[1, 3, 1, 0, 0]` | Floating dominates Content groups |
| Second surface | `[2, 0, 0, 0, 0]` | Dominates the entire page |

The examples show digits, not public CSS numbers. A later-band child cannot restart an earlier band. Surface creation explicitly attaches a new independently ordered scope at the domain root; opening a modal does not require nesting Surface beneath a Group registration.

Encode from left to right using `value = value * 2 ** width + digit`. All arithmetic uses checked ordinary numbers, not signed bitwise shifts. New slots start with at least two bits; growth uses the minimum width that holds the largest positive sibling digit in that slot. Every scope shares that width. Capacity is retained after removal. When retained capacity would exceed 31 bits, discard unused slots and compact live slots to their exact minimum. An explicit domain compaction also discards retained excess. Failure to fit after compaction rejects the transaction and reports required widths. No dense global-rank fallback is used. The ceiling is 2,147,483,647.

The pure resolver rebuilds the snapshot on mutation. It does not promise constant-time subtree updates. A schema change repacks all participants. Snapshot version, slots, digit vectors and entries are immutable and published together.

## Declarations and validation

The author declaration is either a finite ordinal `position` or comparative `above`/`below` relationships. Positions are ordering values, never slots, CSS values or reserved capacity. Explicit ordinal peers constrain each other; participants without an ordinal declaration remain unconstrained by ordinal values. Equal/unconstrained peers use authored allocation sequence, surface opening order or registration sequence. Explicit relationships take precedence over this fallback. Focus/click does not promote a participant.

The same constraint graph also supplies presentation elevation before sequence tie-breaking. Each materialized sibling starts at level one and each strict constraint raises its successor, taking the longest predecessor path. Those levels are encoded through the same band/ancestor slots as paint order and exposed as `elevation` in resolved diagnostics. They do not replace the unique paint ranks or introduce another allocator. Region framing compares these presentation values so equally elevated raised neighbours do not acquire a shadow between them merely because of authored sequence. Equal ordinal positions alone do not override other explicit constraints. Missing references take effect when registered; removal and compaction recompute the presentation result with the rest of the snapshot.

Comparisons require the same domain, band and ordering parent. A request cannot silently promote an ancestor. Unavailable issued references remain pending; resolving them activates validation. A contradiction rejects the newly available registration/update, retaining the previous valid snapshot. Duplicate transaction registrations and duplicate part aliases are rejected, rather than applying a last-wins rule.

Actual removal still takes effect when a simultaneous update is invalid. Removing an ordering parent releases its dependent subtree rather than promoting it. References become unavailable; released handles cannot be reassigned to replacement instances. To retain visible exit motion, the owner must retain the entire ordering ancestry until exit completes, or make an explicitly permitted attachment change first. Surface reopening receives a fresh session handle; live ranks depend on current registrations rather than a cumulative opening counter.

## Layout allocation addressing

`zParts` supports shorthand maps and `{ part, order }` entry lists. Region layouts use `start`, `main`, `end`; unnamed layouts use zero-based canonical integer indices into participating source order. An index is positional. Instance references follow the instance through keyed moves. Numeric object keys normalize to indices; object references are never converted to string keys.

The normalizer accepts the layout's participating allocation sequence; it does not inspect arbitrary DOM descendants. The adapter must supply the existing rules for transparent fragments, omitted comments/empty text/false branches, retained `v-show` allocations, and one allocation for a multi-root component. Grid coordinates, RTL visual order and paint order do not affect indexing.

Resolve name/index/instance aliases before duplicate checks. A live unrelated instance, ambiguous alias, unknown name or out-of-range index is an error. Empty references, known absent named regions and unavailable identities remain pending. The layout integration must normalize again when participants or component refs become available. Layouts normalize reactive declarations and refs after keyed moves and mounting.

A child removed from the participating sequence is unavailable during that render, even before Vue clears its template ref while patching. It must not be misclassified as an unrelated live child. Restoring the keyed item after unmount creates a fresh instance; retained stale handles never identify that replacement.

A part refers to the allocation wrapper; a child's outward participant is a separate identity within that allocation. Raising a child cannot escape the lower allocation. Public `zParts` for cards, tables or modal sections is not established by this contract.

## Application and Vue lifetime

`createUiApplication` owns an initially empty domain and disposes it with application services. The participant helper also acquires an app-local domain for an ordinary Vue app without requiring a wrapper. No process-global allocator or cross-app sharing is introduced.

The helper registers parent-first in `onBeforeMount`; SSR render does not allocate or change previously serialized ancestor output. Dynamic/reference-dependent order before hydration and server-rendered open overlays are not promised. Application/server-request owners must dispose their services. Explicit reparenting preserves identity and recomputes descendants. `v-show` and KeepAlive retain registration identity; actual unmount releases it. Overlay owners use session-specific registrations to close on deactivation while retaining business state.

Registered component identities resolve without `$el` traversal. The helper records ordinary and explicitly exposed public instances, including multi-root components. Every public component consumes the prop. Declaration components project their identity onto their host-owned targets. Failed new registrations must not render a surface; views must gate presentation on a successful resolved registration.

## Browser projection protocol

The shared browser projection accepts an active handle, the actual HTMLElement positioning wrapper, an explicit containing physical host and a mode (`css`, `dialog`, `popover`). It diagnoses intervening unregistered stacking/clipping contexts for CSS targets. It applies the resolved number to the actual target and synchronously repacks targets with each snapshot. A local style observer restores core ownership after competing toolkit writes. Release restores prior inline presentation and disconnects observation. Actual registration removal or projection disposal also dismisses any still-open managed native target, attempting all releases even when one fails.

Physical host declarations remain available for passive views and allocation roots without adding a stacking rank or CSS context. Initial descendant projection waits for the mount batch's parent allocation declarations. Owned popup host validation follows a native wrapper relocated from the document into its dialog, retaining the same logical identity. Relocation does not authorize unknown intermediate contexts or clipping boundaries.

Call `opening` before native `showModal`/`showPopover`; if native opening fails, clear native participation and release the failed registration. Call `closed` after exit motion and native dismissal, then release the target/registration. Numeric repacking does not close/reopen surfaces or move focus. Live top-layer order is validated before committing graph changes. A request to reverse live native top-layer entries is rejected. A later native opening must be above existing native entries in the same domain.

A dialog's native `::backdrop` can realize its Background/mask relationship. A popup must be hosted within its owning native dialog's interaction scope. Geometry, native dismissal, masking, focus and Escape ownership remain existing control/view responsibilities. Numbers cannot overcome clipping or native top-layer paint rules.

Adapters register native positioning wrappers through `useUiZPopup`; ordinary views use `useUiZView`, and allocation roots use `useUiZPart`. The backend never resolves declarations. Explicit host validation diagnoses unsupported boundaries. Application styling that creates a new context must preserve the declared host relationship; arbitrary unregistered third-party overlays are outside the guarantee. Cross-app native coordination, arbitrary live top-layer reordering and shadow-root integration remain outside the initial scope.

When a toolkit retains a popup wrapper after its registration is removed, the helper keeps the unregistered popup hidden. Successful registration of that wrapper restores its prior visibility.

`UiModal` establishes a new Surface for each visible session. Menus/submenus, suggestions, selection choices, paginator size choices and temporal popup surfaces use Floating in that Surface. A tooltip owned directly by a modal uses an internal layer above Content and below its header and footer. Both modal regions paint below Floating. A supplemental tooltip inside an interactive popup retains the popup’s ordering scope, with paint bounded to the available area inside the modal. A field validation hint inside a popup above the modal header and footer uses below-field feedback on backends that support that treatment. Native browser select/date UI remains browser-owned. `UiStrategy` and composing/multi-root components project their outward identity without introducing a wrapper. `UiTab`/`UiBreadcrumb` identities project onto tab/breadcrumb targets; table columns and collection fields project onto their rendered cells/fields. Layouts expose allocation ordering through `zParts`.

`zOrder.layer` selects a named layer in the owning surface; `zOrder.parent` selects an explicit registered handle/reference. They are alternatives. A parent must exist; a comparative ref may be pending. Named extensions are installed through `createUiApplication(App, { zLayers })` or setup-time `useUiStacking().registerLayer`. Definitions last for the application. `useUiZOrder` gives a reusable/native composition one outward identity; `useUiStacking().fromElement` looks up an already registered physical ancestor and never infers arbitrary business relationships.

## Observable acceptance

Pure checks establish packing/order invariants, bounded values, width growth/compaction, pending references, cycles, rollback, removals and app isolation. Vue/DOM checks establish lifetime, SSR nonallocation, reference identity, host wiring and counter suppression. They do not establish painting or modality.

Browser acceptance must prove actual overlap and pointer hits, ordinary page/header coverage, modal mask/panel/popup order, second-modal dominance, focus/identity through repacking, exit retention, scrolling, native counter attempts and repeated opening. The collection select/header-separator case has an automated browser regression, whose execution still requires a working browser. Browser engine support must be recorded separately; a Chromium result alone cannot establish Firefox/WebKit support.

Platform basis: [CSS painting order](https://www.w3.org/TR/CSS2/zindex.html), [top layer](https://www.w3.org/TR/css-position-4/#top-layer), [numeric precision](https://www.w3.org/TR/css-values-4/#numeric-types).

## Floating launchers and docking

UiFloating defaults to its owning Surface's Floating layer through the standard optional zOrder declaration. The backend registers its actual viewport-positioned root as an ordinary CSS target, without arbitrary top-layer promotion or independent ranks. A docked UiDrawer is ordinary content in its UiDrawerLayout allocation; its nested popups retain the enclosing Surface/popup ownership. Panel/docked changes release native popover participation while retaining the content and expansion owner. Existing nested popup groups transfer to the enclosing scope before that release. If opening the retained parent natively would place it above a live higher native surface, it remains an ordinary registered overlay for that presentation; nested content stays mounted and native live order is not reversed. Cleanup tolerates an already removed popover attribute. See [floating panels](../guides/floating-panels.md).
