# UiDrawerLayout

Identifies the main content that yields space to one docked UiDrawer. Import from `@uninterface/uninterface`; requires `drawer.docked.v1`. See [floating panels](../../guides/floating-panels.md).

| Input | Default | Meaning |
| --- | --- | --- |
| `height?: 'content' | 'full'` | `content` | Content height, or consume an already bounded parent height. |
| `minMainExtent?: number` | `96` | Nonnegative pixel allocation retained for main on the drawer's arrangement axis. |
| `zOrder?: UiZOrder` | Shared ordinary ordering | Standard outward stacking declaration. |

Required named slots are `main` and `drawer`; there is no default-slot alias. Place the participating UiDrawer in the drawer allocation. Composition wrappers and Vue Teleport transport are allowed, provided the drawer retains the host's logical context and its docked surface occupies that allocation. Only docked mode registers as an allocation participant; unrelated panel/modal overlays reserve nothing and do not compete for that registration. Its edge chooses the arrangement axis and side. Arbitrary content is allowed; the host does not inspect their DOM or infer content minima. Missing slots, multiple participating drawers, invalid height or negative/nonfinite minMainExtent fail clearly. A docked drawer without a host fails clearly.

An expanded docked drawer receives its resolved extent; main gets the remainder. Collapse releases the entire supporting allocation. Panel/modal overlays reserve nothing. The host owns allocation, while the drawer retains expansion, extent and the only resize operation. No second split/share state is introduced. Main and drawer remain mounted when switching between panel and docked.

KeepAlive deactivation releases a drawer's registration. A cached page can retain
its drawer, expansion preference and adjusted extent while the current page uses
the same host. Reactivation restores participation after the outgoing page
releases it; two concurrently participating docked drawers remain invalid.

The host fills available inline space. With content height, its surrounding layout owns vertical scrolling; for bounded internal scrolling supply a definite parent height and height="full". Top/bottom docking also needs a definite height, so use full in an explicitly bounded parent. The host does not invent a viewport height, a main scrollport or a compact rail. Declare a useful main minimum for your business content; if the available axis is smaller than that minimum, the drawer can resolve to zero. The host never silently changes an explicit docked mode into an overlay. An application may deliberately choose panel mode when space is insufficient.

Core coordinates one logical registration, bounds and strategy role `drawer-layout`. Independent backend markup measures the host and projects adjoining allocations without decorative gaps, insets or independent ordering ranks. Full-height hosts and their ancestors must permit shrinking on the scroll axis. Child content still owns its own scrolling/insets.

The drawer/docking presentation owns its visible border and depth. This layout must permit and preserve that paint while coordinating allocation and motion containment, without supplying a competing border or requiring consumer CSS. See [drawer boundary and depth](../../guides/floating-panels.md#drawer-boundary-and-depth). Verify visible paint in addition to allocated geometry; clipping must not erase the required depth cue.

Verify real main reflow while resizing, allocation release on collapse, all logical edges/RTL, insufficient-space clamping, stable drafts and focus across panel/docked switches and no body-scroll growth in bounded arrangements. Physical geometry requires browser verification.
