# UiDrawer

An edge-attached content surface with two explicit ownership contracts and three modes. Import from `@uninterface/uninterface`; requires `drawer.v1`. Docking additionally requires `drawer.docked.v1`; resizing requires `drawer.resize.v1`. See [drawers and popovers](../../guides/drawers-and-popovers.md) and [floating panels](../../guides/floating-panels.md).

| Input | Meaning |
| --- | --- |
| `mode: UiDrawerMode` | Required: modal, panel or docked. Panel/docked changes preserve content; crossing modal ownership requires keyed remount. |
| `control?: UiOverlayControl<T>` | Required in modal mode; owns run lifecycle and results. |
| `expanded?: boolean` | Panel/docked-only controlled expansion, via `v-model:expanded`. |
| `binding?: UiDrawerBinding` | Panel/docked-only alternative to the boolean model; never combine them or their update listeners. |
| `disabled?: boolean` | Panel/docked-only restriction on user requests, combined with binding availability. Owner changes remain effective. |
| `lazy?: boolean` | Panel/docked-only; default false. True defers first mount until expansion, then retains content. |
| `title?: string` | Visible heading and accessible name. Without it, supply nonempty `aria-label`. |
| `edge?: UiDrawerEdge` | Default end; start/end follow writing direction, top/bottom attach to those viewport edges. |
| `closeOn?: readonly UiOverlayCloseTrigger[]` | Modal defaults: close-button, escape, outside, drag. Panel defaults: close-button, escape, trigger, drag. Drag applies where the backend supplies native dragging. An explicit array replaces defaults; empty disables user dismissal. |
| `zOrder?: UiZOrder` | Core-owned stacking declaration; modal runs expose a session Surface; panel host compositions participate in ordinary ordering with an owned Floating popup. |

Modal mode rejects expansion, binding, disabled and lazy inputs. Panel/docked mode rejects a run control and requires one expansion owner. Disabling a panel does not prohibit programmatic owner changes. A controlled owner may deny collapse by retaining expanded state. Closing a panel does not invoke a modal close guard, produce a result, dispose controls or suspend business work.

Default, header-extra, actions and footer slots contain arbitrary Vue content. Actions and footer are alternatives, with the same declaration-order semantics as UiModal. Modal content slots receive `{ session }`; panel slots receive `{ expanded, close }`, where close requests collapse through the owner. Title is optional for a panel that needs only an accessible name; no redundant visible heading is synthesized.

Optional host slot receives `{ buttonTrigger, anchor }`. Apply buttonTrigger to one real button (UiButton or native type=button). In panel/docked mode it toggles expansion; in modal mode the caller's click handler starts the encapsulated async business operation. While an interaction is presented, repeated activation is consumed and routes to trigger dismissal if enabled. The binding supplies expanded/control associations. Anchor is meaningful to popovers, not drawer placement. No mandatory trigger component is added.

Modal and panel modes overlay the viewport. Docked mode requires [UiDrawerLayout](UiDrawerLayout.md), reserves its resolved extent and lets main content reflow. Panel and docked modes keep background content usable without scroll locks or Tab trapping. Panel ↔ docked updates preserve expansion, mounted content and meaningful focus, including existing nested popup ownership. A retained parent stays below already-live higher native surfaces without reversing native order. Compact rails, snap points and gesture-tuning APIs remain outside this API.

Native drag dismissal is available only where the selected backend documents gesture support. A drag requests cancellation with reason `drag`; it respects modal close guards, panel ownership, disabled state and pending decisions. Explicit `closeOn` arrays must include `drag` to enable it. Other backends do not gain gestures from the route alone. Verify accepted, denied and pending dragging without losing content identity; keep an operable keyboard dismissal path.

Overlay drawers meet their selected viewport edge without an outer gap. Start/end drawers span the viewport height; top/bottom drawers span its width. Safe-area protection is inside the surface. Backend-owned entry/exit motion slides from/to that edge, including RTL start/end, and respects reduced motion. Accepted modal closure keeps its surface, modality and scroll locks through exit, then unmounts content and runs teardown. Panel collapse keeps retained content inert during exit; rapid expansion changes settle to the latest owner state.

Core owns ownership validation, guarded modal requests and retention. Independent backend views supply surface markup, native theme integration, close affordances, scrolling, focus and logical edge placement. Header/footer stay outside the bounded body scrollport. Closing returns focus if necessary; keep the invoking target available. On KeepAlive deactivation a modal run ends; a panel's physical presentation closes while its external expansion and mounted draft persist for reactivation. Unmounting destroys locally owned content; it does not dispose an external expansion owner.

Drawer/docking presentation also owns the visible border and depth relative to the content it overlays or pushes. The layout must allow that treatment to remain visible while preserving allocation, scrolling and motion containment; it does not paint a competing drawer border. Ordinary consumers need no border CSS or strategy selection. Matching root navigation in the body shares the drawer frame’s outward boundary and omits its standalone edge. The host trigger stays outside that ownership scope; nested menus and explicit navigation regions retain their own scope. See [drawer boundary and depth](../../guides/floating-panels.md#drawer-boundary-and-depth) for ownership and observable checks.

Verify both ownership paths, invalid combinations, denied requests, disabled versus owner-driven collapse, retention/lazy mount, all four edges, RTL, nested popup ownership and focused-content hiding. Shared DOM tests cover state/wiring across supporting backends; real browser geometry, top-layer interaction and assistive-technology acceptance remain separate.

## Sizing and resizing

All three modes accept [UiDrawerSizingProps](../types/UiDrawerSizingProps.md): preferredExtent (default 24rem), minExtent, maxExtent, resizable (default false) and resizeLabel (required when resizable). Extents are positive pixels, px/rem/em lengths or percentages up to 100%. Width applies at start/end; height at top/bottom. Available space is the hard bound, with docked minMainExtent reserved first. Header/footer remain reachable around the bounded body scrollport.

Overlay and docked adjusted extents are remembered separately for the mount, including KeepAlive. A deactivated docked drawer releases its layout registration so the active page can use the host; returning restores registration without replacing its extent or external expansion state. Modal extent also persists across runs of that mounted drawer. Changing edge/preferredExtent resets memory; temporary bounds and constraint changes only clamp presentation. Pointer/touch movement and arrow/Home/End keys resize the boundary without requesting dismissal. See the sizing reference for precise steps and ownership.

Verify collapse/reopen, viewport clamp/restore, panel/docked draft and focus identity, named separator values, actual main reflow and all-mode resizing without changing modal guards or native form association.
