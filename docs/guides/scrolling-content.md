# Scrolling content, alignment and visible focus

Enabling scrolling or displaying focus must preserve the intended content alignment and spacing. Content insets are a deliberate presentation choice; focus clearance must not silently create another content gutter.

## Choose the intended content edge

For content aligned with adjacent surfaces, such as a tab bar and its fields, use a scrolling layout inside an established bounded allocation:

```vue
<UiLayout height="full" scroll="vertical" aria-label="Customer details">
  <CustomerSummary />
  <RecordEditorForm :initial-value="record" :save="save" />
</UiLayout>
```

UiLayout separates peers and adds no outer inset. UiGridLayout has the equivalent allocation-only scrolling option. In these unpadded scroll areas, supporting backends contain their supported controls' focus paint without moving the content: outward outlines adapt inward, while native inset rings/borders remain native. Colors and thickness remain backend-owned. Arbitrary third-party controls still own their presentation and clipping integration.

When a native wrapper sits between the layout and its scroll region, apply
[uninterface-fill-height](../api/styling-classes/uninterface-fill-height.md)
to carry a definite height through the wrapper. The scroll region still owns overflow.

UiContent also supports flush hosting without arranging its children. For example, use `inset="none"` around a navigation menu:

```vue
<UiContent inset="none" height="full" scroll="both" aria-label="Navigation">
  <UiNavMenu :binding="navigation.bindings.navMenu"
    presentation="icon-popup" aria-label="Destinations" />
</UiContent>
```

Only this host's insets are omitted. The menu retains its internal row spacing; parent card padding and explicit nested UiContent insets remain intact. Unpadded scrolling UiContent uses the same contained-focus policy as scrolling layouts.

When the content should have its own inset area, use UiContent with its default inset:

```vue
<UiContent height="full" scroll="vertical" aria-label="Customer details">
  <UiLayout>
    <CustomerSummary />
    <RecordEditorForm :initial-value="record" :save="save" />
  </UiLayout>
</UiContent>
```

This intentionally adds the content area's normal insets inside its scrollport. It is not a repair wrapper for every scroll area. Full height includes padding and consumes a definite parent's allocation; it does not mean viewport height or infer missing bounds. Without height/scroll props, UiContent retains document-flow behavior. Toggling scrolling or inset preserves mounted content and editing state.

## Ownership

| Concern | Owner |
|---|---|
| Available space and division between regions | Host and layout |
| Separation between peers | UiLayout, UiFlowLayout or UiGridLayout |
| Deliberate content inset | UiContent or the frame's interior presentation |
| Focus paint inside an unpadded scrolling allocation | Backend control/presentation adaptation |
| Scroll-container and panel focus indicator | Backend, with inward placement |
| Revealing a hidden panel before requesting focus | Business workflow and panel control |

Padded UiContent, cards and modal surfaces establish their own normal focus presentation context. An unpadded scroll layout nested inside them establishes a new contained-focus context. This changes focus placement, not spacing, and does not cancel explicit nested content insets. There is no measurement of ancestor gutters, no negative-margin compensation and no business-authored focus-spacing property.

UiModal owns its body spacing. Its backend keeps that existing spacing inside the scroll boundary where necessary, preserving the overall header/body/footer separation. Do not add UiContent merely to protect modal focus. Ordinary UiCard provides interior padding but does not establish a bounded scrolling body; a nested scrolling layout does not automatically need another full content inset.

Grouped UiRegionLayout allocations continue to adjoin. Keep intentional non-scrolling UiContent inside their regions when those regions need content insets. Do not introduce another scrollport or gutter solely because a parent scrolls.

## Focus and scrolling behavior

The browser owns ordinary focus scrolling. These hosts do not add a second focusin-driven scroll adjustment. Focus itself does not change allocation, padding or control dimensions. The backend places supported focus treatments within tight scroll boundaries, so their paint does not require extra layout space.

Insets travel with scrolling content. Manually scrolling an element partly out of view naturally clips it. A control larger than its viewport cannot be wholly visible at once. Custom shadows, custom focus styles and third-party controls require verification in their actual host; their visual extents cannot be inferred universally.

## Observable acceptance

Check alignment and focus together: tab-bar and field-surface content edges agree, toggling scrolling introduces no new gutter, normal focus indicators remain visible, and there is no accidental horizontal overflow or lost draft. Verify first/last controls and focus on the host itself, including narrow/wide allocations, RTL and forced colors.

Shared scenarios express these guarantees. Backend test adapters identify the actual visible surface of a composite editor, rather than assuming that its inner input is its frame. Native styling remains backend-owned. DOM tests verify identity and semantics; browser geometry and visual review are required to establish painted-focus acceptance.
