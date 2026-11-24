# uninterface-navigation-focus-target

Identifies a static destination for moving the reading/navigation position. The focused destination has no enclosing outline. Use it on content such as the main landmark reached after navigation or by a skip link; it does not move focus or make an element interactive.

## Usage

Application assembly imports the selected backend stylesheet and the core utility stylesheet once:

```ts
import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
```

Business composition applies the class to the actual static focus destination:

```html
<main
  id="main-content"
  class="uninterface-navigation-focus-target"
  tabindex="-1"
  aria-labelledby="page-title"
>
  <h1 id="page-title">Records</h1>
  <a href="/records/new">Create record</a>
</main>
```

The navigation owner decides when to call `focus()` after the destination is rendered, how to reveal it, and whether to preserve or restore an existing focus position. The class does not prescribe automatic focus on load. `tabindex="-1"` permits programmatic focus without adding a static container to the ordinary Tab sequence. Supply suitable document structure and accessible naming; the class adds neither.

Declare `style.navigation-focus-target.v1` in application requirements. Core provides this capability; arbitrary HTML class strings are not automatically scanned. Capability checks do not verify that the stylesheet was imported. There is no JavaScript or TypeScript value export.

## Exact contract and scope

Only the element carrying the class, while it is itself focused, receives `outline: none`. Focus remains on that element. The rule does not target descendants or use `:focus-within`; descendant links and controls keep their own focus indicators. Unmarked neighboring content and separately focusable scroll regions retain their presentation.

This class adds no behavior, roles, attributes, listeners, tab stops, scrolling, layout, borders or shadows. It does not blur the destination, hide it from assistive technology, or clear text selection. Removing the class restores the remaining cascade. The rule uses no `!important` and does not override deliberate higher-priority application styles.

Use it only for static navigation destinations. Do not apply it to buttons, links, editors, keyboard-operated scrollports, or other operational focus targets, even if they use `tabindex="-1"`. Do not combine it with [useUiFocusPresentation](../functions/useUiFocusPresentation.md) on the same element: that binding requests visible operational focus. An element's tag or the fact that JavaScript focused it is insufficient to choose this treatment.

## Implementation responsibility

Business code identifies the destination's purpose and owns focus timing. Core defines the public meaning, capability and backend-independent suppression rule in `@uninterface/uninterface/style.css`. Backends preserve that treatment while supplying their own visible focus presentation for operational regions and descendant controls. They must not duplicate the utility, infer it for every `main` or `[tabindex="-1"]`, or add an enclosing focus shadow to this static destination. A component that owns an equivalent static navigation destination can apply the class internally; native business-authored destinations opt in explicitly.

The class works without UiApp, a provider, a particular backend, or runtime initialization. It is not a general focus reset. See the [focus guide](../../guides/focus-presentation.md#static-navigation-destinations) for the rationale and the [backend contract](../backend/presentation.md#public-styling-classes) for integration obligations.

## Observable verification

1. After navigation or a skip action, the intended destination remains `document.activeElement`, with no enclosing outline.
2. Tab reaches the appropriate next interactive descendant and displays its normal focus indicator; activation still works.
3. Focusing the separate scrolling region retains its visible backend indicator and keyboard scrolling.
4. The treatment works on direct entry, refresh and subsequent navigation, in light/dark and forced-colors modes; it does not introduce layout or scroll changes.
5. Removing the class restores the remaining focus-outline cascade. Unmarked elements and descendants retain their own styling.

DOM checks establish focus retention, selector scope and cascade behavior; browser checks establish actual paint, tab order and scrolling. Screen-reader announcements require separate assistive-technology verification. This treatment alone is not a claim of WCAG conformance.
