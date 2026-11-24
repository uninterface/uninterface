# Navigation menus and shared location

A navigation driver observes the application's confirmed location and executes requests. The navigation controller coordinates menus, links and breadcrumbs; the entry control owns the hierarchy and asynchronous collection caches. Each view owns its expansion/focus/visibility session. No component installs a router or assigns current from the last click.

```ts
const current = ref('overview')
const entries = createUiEntryControl(travelEntries)
const navigation = createUiNavigationControl(entries, {
  driver: {
    current,
    async navigate(key, { signal }) {
      if (!(await mayLeave()) || signal.aborted) return { status: 'blocked' }
      current.value = key
      return { status: 'completed' }
    },
  },
})
onUnmounted(() => { navigation.dispose(); entries.dispose() })
```

```vue
<UiNavMenu :binding="navigation.bindings.navMenu"
  presentation="vertical-tree" aria-label="Travel navigation" />
<UiBreadcrumbs :binding="navigation.bindings.breadcrumbs" />
```

Controls are factory-created objects. The navigation controller borrows entries and does not dispose them or the driver. Own their lifetimes where retention/coordination requires it. Removing one view does not remove shared current state. Bound and manual current/request ownership cannot be mixed.

## Presentation

| Presentation | Behavior |
| --- | --- |
| horizontal | Labelled row; floating descendants |
| vertical-tree | In-flow independent disclosures, revealing confirmed current ancestry |
| vertical-popup | Labelled vertical roots; lateral floating descendants |
| icon-popup | Root icon rail; labelled descendants; neutral menu-item fallback artwork if a root destination has no icon |

`entry` and `icon` slots work recursively. Navigation ignores shortcut and selection/check metadata without modifying shared command entries. Current, ancestor indication, focus and expansion are distinct. Ancestors use native active treatment; only the exact destination receives aria-current. Trees reveal current ancestry without forcing closed flyouts open. A manually collapsed tree stays collapsed until the next reveal event.

Vertical roots share one leading slot across tree, flyout and rail modes. Persistent hierarchies retain that column at every level, even without artwork, so child text cannot move backwards when icons disappear. Groups remain at their surrounding depth. Native indentation and optional branch guides identify parent/child relationships without shrinking typography. Root row density and icon centers remain consistent within a backend; different backends retain their own native dimensions.

Floating submenu surfaces and command menus still establish independent columns when any sibling, including grouped siblings, has an icon. Icon-free floating surfaces omit that column. Horizontal roots keep per-item spacing. Authors supply meaningful artwork only, never placeholder icons or CSS spacing.

Rail roots without icons use the catalogue's neutral menu-item glyph; source entries remain unchanged. Explicit invalid icon names still fail. Hover/focus reveals the destination label, Escape hides the hint; opening a branch dismisses its hint, which stays hidden while that branch is open. Submenu surfaces remain labelled. Group headings retain their accessible text without widening the rail. Repeated generic glyphs are usable fallbacks, not substitutes for meaningful artwork when available.

Tree expansion is remembered separately from transient popups. Switching modes closes floating sessions and retains current state and manual tree collapse. Backends animate compatible allocation changes with reduced-motion support, preserve focused entries or their surviving ancestor, and clean up interrupted transitions. Mounting a new menu instance starts a new view session.

Optional `v-model:expandedKeys` controls persistent expansion. Share a binding among views to synchronize current/breadcrumbs while keeping view sessions independent. Choose presentation using the application's responsive policy; UiNavbar has no automatic collapse behavior.

Drawer-based navigation combines a trigger, a drawer container and a vertical hierarchy menu. It is not a UiNavMenu presentation. [createUiNavigationDrawerControl](drawer-navigation.md) coordinates navigation outcomes and an owned modal drawer using the existing views. UiNavMenu supplies no competing drawer visibility model or host slot.

## Navigation boundaries and top bars

A drawer body supplies its surrounding frame boundary to matching root navigation (vertical in a start/end drawer, horizontal in a top/bottom drawer). Its host trigger does not inherit this acknowledgement. The frame retains its own border/depth; the menu omits its standalone outer edge. Explicit nested navigation regions and nested menus establish their own scope.

Root navigation must be distinguishable from adjacent content: logical inline-end for a start-side vertical menu, block-end for a horizontal menu. The backend supplies a themed separator by default. An eligible owner can supply the actual adjoining boundary instead; selected-item underlines do not replace region separation.

Designate a whole supporting region as navigation with `navigation-region="start"` or `"end"` on an ordinary UiRegionLayout. This requests native region separators by default and allows matching menus to relinquish their local edge. The layout knows the direction and adjoining side, including RTL. A framed region can instead use existing uiLayoutFraming elevation. Explicit `separators: 'none'` suppresses the ordinary region boundary while retaining layout ownership; the menu must not restore a local edge. Visible region separation always spans the full allocation boundary, even when the menu or navbar is shorter. A nested UiRegionLayout establishes a new ownership scope; arbitrary wrappers and unrelated borders do not claim separation. This designation cannot be combined with grouped scrollPolicy.

```vue
<UiRegionLayout direction="horizontal" navigation-region="start" height="full">
  <template #start>
    <UiContent inset="none" height="full" scroll="both" aria-label="Navigation">
      <UiNavMenu :binding="navigation.bindings.navMenu"
        presentation="vertical-tree" aria-label="Destinations" />
    </UiContent>
  </template>
  <template #main><Workspace /></template>
</UiRegionLayout>
```

The host supplies bounded height. The region boundary stays outside the scrollport. Here inset none lets the menu meet that boundary without an extra content gutter; the main content can retain default insets. Only designate a region when its entire purpose is navigation; do not use it to suppress unrelated menus within mixed content.

For a top bar, compose a native header (when banner semantics are appropriate), UiNavbar, and a horizontal UiNavMenu. UiNavbar aligns branding, navigation and actions, owns the lower boundary, and lets native active indicators align with the bar. If the entire header is an adopted region, the region owns that edge instead. UiNavbar still wraps and keeps controls visible; sticky/fixed/overlay positioning and hamburger composition are separate concerns.

For side navigation, UiNavbar in a designated supporting region of a horizontal UiRegionLayout stacks branding, ordinary links and actions vertically. This follows placement, even when the region is wide enough for a row. Choose a vertical UiNavMenu presentation explicitly when supplying a menu; the navbar does not rewrite a child menu's presentation. A vertical navbar adopts vertical menu boundaries, while a top/bottom navbar adopts horizontal menu boundaries. See [backend navbar guidance](../api/backend/navigation.md#uinavbar-implementation-guidance).

## Lazy paths and breadcrumbs

A child loader supplies a known branch's children. It cannot locate an unknown destination in an unloaded hierarchy. Supply an optional path resolver when deep links need that information:

```ts
const navigation = createUiNavigationControl(entries, {
  driver,
  resolvePath: (key, { signal }) => service.menuPath(key, { signal }),
  // e.g. ['destinations', 'asia', 'singapore']; groups are transparent.
})
```

The controller loads only the root and required path collections through the shared entry control, validates the path and ignores stale completions. It never cancels a shared entry load simply because its own resolver becomes obsolete. Observed current is available while metadata loads. Bindings expose idle/loading/ready/missing/error and retry. Breadcrumbs show localized feedback rather than displaying an old endpoint as current.

Default breadcrumbs use submenu labels as text-only ancestors and the destination as current text. `resolveBreadcrumbs(key, { signal })` may return unique `{ key, label, destination? }` records for a location hierarchy that differs from menu grouping. The caller must describe the confirmed location. Actual navigable ancestors use destination bindings; no URL is fabricated for a submenu heading. Key-only ancestors render buttons and href destinations render links. The final crumb is always non-navigable current text.

## Optional Vue Router integration

Install Vue Router (^4.6.4) and import only the optional entry point:

```ts
import { createVueRouterNavigationDriver } from '@uninterface/uninterface/vue-router'
const driver = createVueRouterNavigationDriver(router)
const navigation = createUiNavigationControl(entries, { driver })
```

String route names are keys by default. Use `current(route)` and `target(key)` callbacks for parameterized, symbol or unnamed routes. The application starts/owns the router; route-record nesting need not match the menu hierarchy. The adapter observes router.currentRoute, resolves hrefs and awaits readiness before pushing. Aborted guards, cancellation and duplicates map to blocked/cancelled/unchanged. Redirect success is completed, with the actual destination read from the route. AbortSignal invalidates work but cannot roll back an issued Vue Router push.

Hrefs must describe the same destination as the driver. Ordinary clicks are synchronously intercepted; modified clicks and supported native link operations retain browser behavior. The manual `control` + `modelValue` + `activate` API remains available and retains key-only activation semantics. Manual href consumers coordinate routing themselves.

## Observable acceptance

Verify three-level navigation, icons at every depth, ignored checks/shortcuts, synchronous link interception and modified-click preservation. Select Singapore in one view: every view reflects current ancestry, breadcrumbs end in Singapore, trees reveal ancestry, and closed flyouts stay closed. Decline a request: current stays unchanged. Enter a lazy deep link before mounting any menu: only its path loads; failure gives Retry; obsolete results cannot overwrite a newer location. Disposal disables stale bindings without disposing borrowed entries.

Focused controller tests exercise real Vue Router guards/history and asynchronous races. Shared DOM checks exercise all four presentations across adapters. Browser geometry, transitions, mobile/RTL placement, focus handling and assistive-technology behavior require browser acceptance in addition to DOM checks; do not infer them from class assertions. Backend-specific implementation details and verification limits belong in each backend's navigation guide.

For dynamic text in reusable definitions, use [UiTextSource and the text-source practice](text-sources.md). Keep stable identities independent of labels; ordinary component text props continue to use Vue bindings.
