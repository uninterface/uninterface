# UiContent

Hosts ordinary application content with backend-owned insets, or flush content with `inset="none"`. It can grow with content or consume a bounded height and scroll while preserving clearance inside its scrolling boundary. Import from `@uninterface/uninterface`.

```vue
<UiContent height="full" scroll="vertical" aria-label="Customer details">
  <UiLayout>
    <CustomerSummary />
    <RecordEditorForm :initial-value="record" :save="save" />
  </UiLayout>
</UiContent>
```

The parent must supply a definite height for this example. See [scrolling content and visible focus](../../guides/scrolling-content.md) for ownership, ordinary and edge-to-edge recipes, and verification.

## API and business responsibility

Props are [UiContentProps](../types/UiContentProps.md):

| Prop | Values | Default and meaning |
|---|---|---|
| `inset` | `default`, `none` | `default`: normal backend insets; `none`: no padding added by this host |
| `height` | `content`, `full` | `content`: grow with content; `full`: consume a definite parent's allocation including insets |
| `scroll` | `none`, `horizontal`, `vertical`, `both` | `none`: document flow; other values establish a named, keyboard-focusable scroll region |
| `aria-label` | string | Required nonempty accessible name when scrolling; no visible label is added |

Vertical/both scrolling requires height full. Unsupported values, missing scroll names and vertical requests without full height throw. CSS bounds are the embedding host's responsibility; automatic detection of missing external bounds is not provided. Width fills the available allocation. Requested overflow scrolls automatically; overflow on the other axis remains reachable as a fallback.

Supply ordinary HTML, Uninterface components or other Vue components through the default slot. There are no custom events or exposed methods. Standard attributes/listeners target the content/scroll root. Omitted scrolling adds no landmark or tab stop. Scrolling adds role region, tabindex 0 and the supplied name on the actual scrollport.

Use ordinary layouts inside the area to separate peers. For flush alignment with adjacent content, use `inset="none"` (for example, around a navigation menu), or a scrolling UiLayout when arranging peers; do not introduce UiContent solely to protect a focus outline. Explicit nested UiContent creates another inset area; it does not detect ancestors and cancel their insets. Do not add a second UiContent inside a UiModal solely for focus clearance: modal bodies already own this responsibility.

## Space and presentation contract

The area fills its host's available width including insets and uses border-box sizing. Full height likewise includes insets. Child full-height layouts receive the remaining content height. No maximum content width, centering, outer margin, typography, color or viewport policy is imposed. No new surface/theme boundary is created. Content remains mounted when props change.

The supporting backends allow long words in bare text or inline content to wrap when they exceed the available line width, independently of paragraph/card ancestry. Normal word boundaries remain preferred; explicit descendant whitespace/wrapping policies retain ownership. This does not shrink non-text content or establish a horizontal resize minimum.

Default insets on all sides keep ordinary content away from the boundary. `inset="none"` removes only this host's padding; it does not cancel parent card padding, descendant insets or a menu's own row spacing. An unpadded scrolling host uses the backend's contained-focus treatment. Changing inset preserves mounted children and scrolling semantics. In a scrollport, leading and trailing insets travel with content; they are not permanent empty bands. Backends keep the host's own focus indicator inward and preserve native focus scrolling. Normal partial clipping while manually scrolling remains expected. Oversized content remains reachable, rather than being silently clipped to simulate a fit.

UiContent never forwards an enclosing application's unadjusted numeric height offer to nested grouped layouts. Full height consumes a CSS allocation; it does not establish the generalized measured hosting protocol required by grouped UiRegionLayout. Put non-scrolling UiContent inside grouped regions, or use ordinary full-height layouts inside a bounded UiContent.

## Backend responsibility

Core statically imports `@uninterface/backend/UiContent.vue`, validates reactive props and requires content.inset.v1. Full height or scrolling additionally requires content.scroll.v1. The backend receives [UiContentViewProps](../backend/layout.md#uicontentviewprops), preserves opaque content and root attributes, and owns sizing, inset placement, native styling, visible focus. It works without a provider ancestor and creates no control state.

Default-slot content must not remount when scrolling changes. A content-only import excludes application/provider views, layouts and field controls. No author-facing numeric padding option is provided; application theme customization remains backend-owned.

## Observable verification

Unit checks cover options and invalid combinations. Verify with rendered components: scroll naming, focusability and retained node/input/focus identity when bounded scrolling changes. Shared browser acceptance checks initial/final control clearance, inward host focus, nested clipping, RTL and narrow/wide hosts. DOM simulation does not establish geometry or accessibility conformance. See the scrolling guide for limits and acceptance obligations.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

When this is the sole direct root of a vertically resizable UiRegionLayout allocation, content height contributes the measured natural minimum. Full-height scrolling content contributes insets/borders plus one line of viewport height. The arrangement reconciles constraints and supplies whole-arrangement scrolling when necessary. This integration does not inspect opaque descendants or change horizontal resizing. See [vertical resize ownership and checks](../../guides/layout-framing.md#vertical-resizing-and-content-height).

