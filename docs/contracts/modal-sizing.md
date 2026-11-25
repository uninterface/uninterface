# Modal width determination

UiModal supports auto/available width, preferredWidth, minWidth and maxWidth, with a shared 32rem fallback and a hard available-viewport limit. Automatic content preference reporting through nested components/layouts remains a proposal, described separately below. See the [UiModal API](../api/components/UiModal.md).

## Ownership

The modal determines its outward width from optional author constraints and the available viewport. Its body receives the remaining usable width after native frame borders and insets. Business authors must not calculate those deductions or supply backend CSS to get a usable editor.

Shared rules determine allocation. Backends retain native surfaces, padding, typography, viewport clearance, focus and scrolling. Different native insets can produce slightly different outer widths for the same preferred body width; that is compatible with the standard. A toolkit's unrelated default dialog width must not override the resolved allocation.

## Author inputs

| Input | Meaning | Default |
| --- | --- | --- |
| `width` | `auto` uses the explicit preference or shared fallback; `available` takes the available width within the constraints below. | `auto` |
| `preferredWidth` | Explicit preferred outer width, replacing the shared fallback. | Unspecified |
| `minWidth` | Requested minimum outer width; the available viewport remains the ultimate limit. | Unspecified |
| `maxWidth` | Maximum outer width, also limited by the available viewport. | Unspecified |

Lengths accept positive pixel numbers or positive px/rem/em strings. preferredWidth additionally accepts percentages greater than zero and no greater than 100%. A percentage resolves against the available outer modal width after viewport safe-area constraints and edge clearance, before applying author minWidth/maxWidth constraints. It does not refer to the trigger, an arbitrary DOM parent, or the modal's current width. minWidth/maxWidth use absolute or font-relative lengths. Arbitrary CSS expressions and backend size names are not accepted. Reject minWidth greater than maxWidth. Reject preferredWidth with width=available because that mode does not use a preferred width. A preferred width outside the declared bounds is clamped, not treated as a fixed width.

These inputs describe allocation, not visual styling. A reusable business dialog can encapsulate a deliberate constraint; its ordinary consumers still supply business data and operations. All props are reactive. Changing them updates allocation without replacing the modal session or its children. Mixed-unit minimum/maximum comparisons resolve using actual dialog/root font sizes when the view mounts; conflicting bounds report an error through the modal lifecycle.

## Responsive authoring

An author can request a fraction of available width on desktop and all available width on mobile using the existing environment detection mechanism. Keep detection separate from allocation; the modal consumes the resulting policy. For example, with an application boolean isMobile:

```vue
<UiModal
  :control="modal"
  title="Edit invoice"
  :width="isMobile ? 'available' : 'auto'"
  :preferred-width="isMobile ? undefined : '80%'"
/>
```

The desktop target is 80% of the available outer width, subject to applicable minimum/maximum constraints. On mobile, available mode consumes the full allowed width and preferredWidth is omitted. Neither can exceed the viewport hard limit. A supplied maxWidth still caps available mode; omit or change it responsively when the intent is to use all available mobile width. Available width does not imply full height or the removal of edge clearance. An alternative preferredWidth of 100% requests the available-width target, but available mode states that intent directly.

## Implemented allocation

1. Establish available outer width from the current viewport, safe-area constraints and backend-owned edge clearance. When a visual viewport exists (for example during pinch zoom), use its width if smaller than the layout viewport, and account for its horizontal offset. Do not derive the limit from the modal's current width.
2. For auto, use preferredWidth when supplied, otherwise **32rem**. A percentage uses the available width before author min/max constraints. For available, use the full available width.
3. Apply minWidth and maxWidth, then cap the result at the available viewport width. This hard cap wins even when minWidth is larger than the viewport.
4. Give the body the remaining usable width after native frame insets. Consumers do not calculate those deductions. Available width does not imply full height or edge attachment.

Widths refer to the outer border box. The dialog is horizontally centered within the usable viewport, including asymmetric safe-area insets. Native vertical placement and body scrolling are unchanged. Safe-area insets use CSS env values; the fallback before mounted measurement uses 100dvw. Actual widths, relative units and CSS viewport clearance remain responsive. Native toolkit default widths and max-width classes cannot replace this allocation.

Content does not currently contribute a preferred width. An unspecified preference uses the shared fallback regardless of nested tables or layouts. Consumers needing a wider editor can encapsulate an explicit preference in the reusable business dialog.

## Proposed automatic content participation — not implemented

Preferred size must be independent of allocated size. Measuring the scrollWidth of a full-width table after sizing the dialog cannot reliably discover its preferred width and can create a feedback loop. Uninterface components should report their authored or intrinsic requirements through a shared, optional sizing contract. This contract is new work, not a capability of the current modal helper.

A UiTable can report the sum of max(preferredWidth, minWidth) for its columns, plus selection allocation and native table overhead. Its minimum feasible width uses non-spring starting allocations plus spring minima, matching its allocator. Use authored column preferences; spring-expanded widths and user boundary drags must not expand the modal in response.

Layouts compose reports according to their actual arrangement: side-by-side peers require combined widths and native gaps; vertically arranged peers require the largest width. Wrapping layouts must report a feasible arrangement rather than summing every descendant. UiContent/frame wrappers account for their owned insets. Hidden/absent content contributes nothing. Opaque business and plugin content remains supported through the ordinary fallback, and can opt into the shared contract without exposing its implementation or adopting a schema.

Do not infer requirements by traversing arbitrary component internals or treating all descendants as adjacent siblings. A table nested in a narrow sidebar must not claim the modal's entire body allocation. Initial implementation must establish this composition boundary before claiming automatic sizing for arbitrary nested layouts.

## Stability and constrained space

The implemented explicit/fallback policy does not measure content to determine width. Delayed content, row changes, validation and typing therefore do not change the requested width. For future automatic participation, resolve independent preferences before interaction where feasible, allow growth for genuine structural changes, and retain the accepted automatic preference for that run rather than shrinking for transient changes. These content-report lifetime rules are proposed, not implemented.

Viewport changes always update the outer bound. Explicit author constraint changes apply live. Typing, validation messages, sorting, row counts and manual column resizing must not cause automatic width oscillation. Allocation changes preserve mounted content, focus and unfinished editor drafts.

A viewport can be narrower than all required minima; no allocation algorithm can satisfy both constraints. Keep the modal within the available viewport, preserve its dismissal/actions, and let the content's explicit constrained-space policy apply. Horizontal scrolling must remain opt-in. A no-scroll table may display its recoverable insufficient-space status while retaining drafts, as the current table does. The modal must not silently enable scrolling, discard content or pretend every viewport can accommodate an arbitrary fixed configuration. Wider preferred sizing improves desktop use but does not replace responsive content design.

## Invoice example and acceptance

The invoice editor explicitly requests **52rem on desktop** and **available width on mobile**, using useUiResponsive for detection. Its five-column line table has a spring Description column, numeric allocations and a measured action column. The preference allows room for the columns and frame insets at ordinary desktop widths; the viewport cap and the table's constrained-space policy still apply. The table adapts to the resulting body allocation. No invoice-specific CSS or remount is used.

```vue
<UiModal
  :control="modal"
  title="Edit invoice"
  :width="environment === 'mobile' ? 'available' : 'auto'"
  :preferred-width="environment === 'mobile' ? undefined : '52rem'"
/>
```


Acceptance for the implemented policy must exercise supporting backends: an ordinary form using the fallback; a wider table; an explicit compact dialog; available-width mode; min/max conflicts; narrow viewport and zoom; native inset differences; unchanged width through nested/optional/delayed content; localization; and stable drafts/focus during resizing. Verify actual outer/body/column geometry in a real browser, not only DOM styles. Verify a boundary drag does not grow the modal, source refresh does not resize it and unsupported content still works at the fallback width.

Verify option forwarding, viewport updates, retained drafts and focus, and cleanup. In a browser, verify the geometry with both short form content and an invoice editor containing an editable collection.
