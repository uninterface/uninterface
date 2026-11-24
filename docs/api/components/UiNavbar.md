# UiNavbar

Present application branding, navigation links and related actions as a navigation bar. The business supplies destinations and behavior; the backend supplies bar presentation, spacing, alignment and wrapping. Import from `@uninterface/uninterface`.

```vue
<header>
  <UiNavbar aria-label="Main navigation">
    <template #brand>
      <a href="/">Customer workspace</a>
    </template>
    <a href="/customers" aria-current="page">Customers</a>
    <a href="/reports">Reports</a>
    <template #actions>
      <UiButton @click="signOut">Sign out</UiButton>
    </template>
  </UiNavbar>
</header>
```

## API

No component-specific props, custom events, or instance methods are defined. Standard attributes and listeners target the navigation landmark. Use `aria-label` or `aria-labelledby` to name it, particularly when a page has several navigation regions; the component does not invent an English name.

| Slot | Meaning |
|---|---|
| `brand` | Optional application identity, often a linked name or logo |
| default | Optional navigation links or application-supplied navigation components |
| `actions` | Optional related controls |

All slots are ordinary Vue slots without slot props. Reading and keyboard order is brand, navigation, then actions. Absent slots consume no dedicated group. Supplied content retains its native or component semantics, identity and handlers. Dynamic lists need stable keys. The application supplies meaningful link names, valid destinations, current-location state (for example `aria-current="page"`), and disabled behavior where applicable.

UiNavbar itself works without UiApp. Descendants retain their own dependencies: UiButton consumes application localization. UiNavbar creates navigation semantics, not a header/banner landmark; use a native header when that role is appropriate. It does not create menu/menubar roles or arrow-key navigation. Ordinary links remain keyboard navigable by Tab and activated by Enter.

## Presentation and scope

In a designated `UiRegionLayout` navigation region, the navbar follows its placement: a horizontal region arrangement produces a vertical side navbar; a vertical arrangement produces a horizontal top/bottom navbar. Vertical navbars stack branding, navigation links and actions from top to bottom regardless of available width. Standalone navbars and content outside a designated navigation allocation remain horizontal. No new component prop is required.

The bar uses the width offered by its host and grows with content in document flow. Brand, navigation and actions remain visible, in order, and wrap as space requires. Backends provide their own surface, typography, spacing, group alignment and visible keyboard focus treatment, including forced-colors support. They may use different DOM structures, but must preserve these semantics and interactions. Standard links require no backend classes from business code. For author-supplied branding or links, apply [useUiFocusPresentation](../functions/useUiFocusPresentation.md) to the actual focus target. The same binding works outside the navbar; it requires no structural selector or backend class name. Native HTML, router links and other components can be mixed; specialized descendants retain their own sizing and styling responsibilities.

The initial contract does not hide navigation, add a mobile toggle, open a drawer, manage routes, decide the active destination, or introduce sticky/fixed positioning. No responsive detector is needed for wrapping. Oversized custom content must cooperate with available space; the bar must not clip it to simulate a fit. General strategies, nested menus and collapsed-navigation behavior require their own contracts.

## Backend responsibility

The backend must support `navbar.v1`, render a navigation landmark and forward naming and attributes to it. Preserve slot order, ordinary activation and component state when slots change. Extra wrappers are implementation details. Always-visible wrapping remains required even if the toolkit offers optional collapse behavior. See the [backend view contract](../backend/navigation.md#uinavbar-implementation-guidance) for module and slot wiring.

Follow the [backend implementation guidance](../backend/navigation.md#uinavbar-implementation-guidance), including explicit vertical stacking. Backends own navbar appearance and always-visible wrapping. Toolkit collapse conventions do not override the shared visibility contract.

## Observable verification

Verify accessible naming, current-link attributes, all optional slots and native actions. Removing or changing branding must not recreate unrelated controls or lose their state/focus. At wide and narrow widths, verify link availability, reading/keyboard order, activation, wrapping and correct page landmarks. The bar must also work without UiApp.

Browser and manual checks are needed for appearance, visible focus and accessibility. Assembly must preserve selective imports; see the [backend assembly contract](../backend/assembly.md#static-assembly).

## Navigation boundary ownership

UiNavbar supplies a themed boundary on its adjoining edge (bottom by default) and adopts the boundary of same-axis UiNavMenu descendants. In an explicitly designated, framed UiRegionLayout navigation region, that region can own the outer edge instead. Menus with a different axis are not adopted, and their explicitly chosen presentation is unchanged. Native active indicators remain distinct from the frame separator. The bar aligns menu rows with branding/actions as its height changes; concrete dimensions remain native. See the [navigation guide](../../guides/navigation-menus.md#navigation-boundaries-and-top-bars).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

## Field peers

Direct field peers in the actions region anchor at block-start; a taller editor or feedback must not vertically recenter neighboring field labels. Bare actions retain native centering. Native integrated labels remain integrated. See [field alignment](../../guides/field-alignment.md) for wrapped labels, mixed presentations and opaque composition boundaries.
