# UiNavMenu

Navigation from an entry collection, with confirmed current state. Import from `@uninterface/uninterface`; requires `navigation.menu.v1` and a nonempty `aria-label`.

```vue
<UiNavMenu :binding="navigation.bindings.navMenu"
  presentation="vertical-tree" width="full" aria-label="Travel navigation" />
```

| Input | Contract |
| --- | --- |
| `binding?: UiNavMenuBinding` | Coordinated source/current/path/requests |
| `control?: UiEntryControl`, `modelValue?: string` | Manual alternative; cannot be mixed with binding |
| `presentation?: UiNavMenuPresentation` | horizontal (default), vertical-tree, vertical-popup, icon-popup |
| `width?: 'full' \| 'content'` | Fill the parent's offered width or size the menu to its content within that offer. Omission uses the backend's default for the selected presentation. |
| `expandedKeys?: readonly string[]` | Optional external expansion for vertical-tree; emits update:expandedKeys |
| `aria-label: string` | Navigation accessible name |

`activate(key)` belongs to manual mode only. Bound mode rejects a competing activation handler. Requests never assign current optimistically. Activation closes floating submenu sessions; persistent hierarchy expansion remains view-owned.

Persistent hierarchies reveal resolved current ancestry, preserving manual collapse between reveal events. Flyouts stay closed on external current changes. Each mounted view owns independent expansion unless its model is supplied externally. Components borrow controls/bindings.

`entry({entry})` and `icon({entry, icon})` slots apply at every depth. Root icon omissions receive neutral menu-item artwork in icon-popup; the requested mode stays unchanged. The source entry remains unmodified. Rail labels appear on pointer hover and keyboard focus; Escape dismisses the hint. Opening a branch dismisses its hint and suppresses it while the branch is open. Declared leading icons remain visible. Selection/check scopes and shortcut hints are ignored without mutating the entry source.

A template ref exposes `ownsTarget(target: Node | null): boolean`. It checks the current menu surface and its registered popup surfaces, including ones rendered outside the menu's DOM tree. [useUiResponsiveNavigationSwitch](../functions/useUiResponsiveNavigationSwitch.md) uses it to detect outgoing navigation focus. It does not change focus or open a branch.

Hrefs retain ordinary browser link operations, including modified clicks. Key-only destinations are operable controls. Disabled items cannot navigate. Manual href consumers remain responsible for coordinating browser navigation; a bound driver intercepts ordinary clicks synchronously.

Backends own markup, keyboard pattern, native treatment, overlays, motion and focus. vertical-tree is a visual hierarchy, not a required ARIA tree widget. Drawer hosting and a hamburger trigger are outside this component. Drawer-specific navigation orchestration belongs to [createUiNavigationDrawerControl](../functions/createUiNavigationDrawerControl.md), which composes this menu with UiDrawer. UiNavbar remains always-visible and wrapping. The application chooses responsive presentation using environment information.

Verify all three levels, icons, exact current and ancestor treatment, ignored command metadata, independent expansion, lazy retry, refused navigation and cleanup. Browser acceptance must additionally check caret geometry, RTL, mobile placement, transitions and focus return without stealing deliberate application focus. See the [navigation menu guide](../../guides/navigation-menus.md).

Vertical roots and every persistent tree level reserve a stable leading icon column, including levels without artwork. Child labels advance beyond parent labels regardless of icons. Independent floating submenu surfaces retain per-surface icon columns; horizontal roots retain per-item icon/label spacing. Authors supply no placeholders or spacing. See the [navigation menu guide](../../guides/navigation-menus.md#presentation).

The three vertical presentations keep their root icon alignment within each backend. Mode changes close floating sessions, retain persistent expansion and keep focus on a surviving entry or ancestor. Allocation changes animate when motion is allowed. Unmounting starts a new view session and business-controlled expandedKeys remains authoritative.

Labelled side navigation (`vertical-tree` and `vertical-popup`) has zero outer
inline padding. Supply any shared sidebar inset through its host, such as
[UiContent](UiContent.md). Use `width="full"` to span the offered width. Root
row targets and current highlights reach the menu's inner edges. The backend
owns padding inside each row and indentation for nested entries.
`width="content"` requests intrinsic sizing, capped by the parent offer.
See the backend's navigation guide for the default width of each presentation.
The width applies to the root surface. Horizontal entries retain their own
sizes, icon rails retain compact targets, and floating submenus size
independently. An explicit width requires `navigation.menu.width.v1`.

Root navigation supplies a themed boundary toward adjacent content. UiNavbar adopts horizontal menu separation; an explicitly designated UiRegionLayout navigationRegion can adopt the full adjoining edge. Unrelated or nested regions do not suppress it. Boundary dimensions, glyph sizes and native treatments remain backend-owned.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
