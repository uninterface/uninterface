# Focus presentation for author-supplied elements

Use [useUiFocusPresentation](../api/functions/useUiFocusPresentation.md) when an existing native element needs keyboard-focus presentation consistent with the selected backend. It works independently of navbars, cards and menus. Ordinary consumers import from `@uninterface/uninterface`; backend selection and stylesheet loading remain application setup concerns.

```vue
<script setup lang="ts">
import { useUiFocusPresentation } from '@uninterface/uninterface'
const focusPresentation = useUiFocusPresentation()
</script>

<template>
  <a href="/records" v-bind="focusPresentation">Records</a>
  <section
    tabindex="0"
    aria-label="Record preview"
    v-bind="focusPresentation"
  >
    <!-- Business content -->
  </section>
</template>
```

The section illustrates an explicitly chosen keyboard stop. Do not add `tabindex="0"` to every content region: make it focusable only when its interaction or scrolling purpose warrants keyboard access. Prefer native links and buttons for navigation and actions. Adding this binding to a div does not turn it into a button.

## Ownership and rationale

| Owner | Responsibility |
|---|---|
| Business composition | Choose a meaningful element, destination/action, accessible name, and whether a custom region should be focusable |
| Interaction component or binding | Own keyboard behavior, availability, focus movement and restoration |
| Core | Supply a common presentation-only binding and require `focus.presentation.v1` |
| Selected backend | Define visible keyboard-focus treatment using its theme, including dark and forced-colors behavior |

The binding adds only an opaque CSS class. It adds no `tabindex`, roles, ARIA attributes, listeners, disabled state or focus movement. It neither validates content nor indicates selection. Backend presentation may use an outline, ring or another suitable treatment; callers must not depend on a particular drawing mechanism.

This separation makes the same presentation usable on branding, standalone links, custom keyboard regions and other author-supplied elements. Avoid fixing each occurrence with a container-specific selector or requiring business authors to copy backend CSS. Native HTML remains a supported part of business composition.

## Applying the binding

Apply the complete object with `v-bind` to the actual focus target. Vue merges its class with a class already written on that element. The binding is readonly, stable and safe to reuse; do not mutate it, interpret its class name, or copy its current CSS into business code. A component can receive it only if it forwards attributes to its actual focusable element. A wrapper that keeps the class while an inner input receives focus will not provide the intended result.

Import the backend stylesheet through normal application setup. No additional provider, watcher, DOM registration or disposal is needed for this binding. It can also be obtained outside Vue setup and during server rendering. Theme changes are reflected through backend CSS, without recreating the binding.

The backend styles the bound element's boundary. It does not inspect nested children to copy their shape or apply focus styling to them. A child button keeps its own focus treatment; its focus must not activate the parent's indicator. Backends may supply a default radius, but neither exact geometry nor a shape-matching algorithm is part of this API. A clipping ancestor can still obscure an outward indicator; the surrounding composition must allow a visible focus boundary.

## Existing components and interaction bindings

For static navigation destinations, use the different treatment below; do not apply both treatments to the same element.

UiButton, field editors and other Uninterface controls already supply their own focus presentation. Do not apply this binding to them routinely, because a second treatment may conflict with their native toolkit behavior.

[UiMenu](../api/components/UiMenu.md)'s `contextTrigger` already includes the selected backend's focus presentation together with its contextual interaction and accessibility attributes. Use that complete binding; no additional call is needed. Its `buttonTrigger` supplies button interaction state while the receiving UiButton owns button presentation.

For branding, the same standalone binding can be applied to an anchor inside or outside a navbar. There is no navbar-specific automatic treatment for arbitrary branding content.

## Static navigation destinations

Use [uninterface-navigation-focus-target](../api/styling-classes/uninterface-navigation-focus-target.md) on a static destination such as `<main tabindex="-1">` when navigation moves the reading position there. Import `@uninterface/uninterface/style.css` in application assembly and declare `style.navigation-focus-target.v1`. The class suppresses only that destination's outline while it is focused; it neither moves focus nor suppresses descendant indicators.

Business code owns the destination and focus timing. Core supplies the semantic contract and the shared, backend-independent rule. Backends preserve that treatment and continue to own theme-appropriate indicators on controls and keyboard-operated scroll regions. Consumers select the semantic treatment without writing outline CSS or depending on private toolkit classes.

Focusing static content and focusing a keyboard-operated region serve different purposes. A page-sized outline can misleadingly suggest an interactive surface when focus only establishes the reading position. Suppression is an explicit presentation policy, not a universal requirement for focused HTML. GOV.UK's [skip-link implementation](https://github.com/alphagov/govuk-frontend/blob/main/packages/govuk-frontend/src/govuk/components/skip-link/_mixin.scss) supplies a related precedent: it focuses static content for announcements while suppressing the destination outline. The [WCAG discussion](https://github.com/w3c/wcag/issues/1001) records interpretation and usability tradeoffs; it is not a blanket exemption for programmatically focused controls.

Do not infer this purpose from `main`, `tabindex="-1"`, or a call to `focus()`. Apply the class only to the static destination. A main landmark that itself provides keyboard scrolling needs visible operational focus instead. The demo's main destination is inside a separately focusable scrolling region, so only main receives the class. Its existing navigation focus and scrolling behavior remain intact.

Verify retained focus with no enclosing outline, the next Tab stop and its visible indicator, and separate scroll-region focus/keyboard operation. Check direct entry, refresh and route changes in light/dark and forced-colors modes. DOM verification cannot establish browser paint or screen-reader announcements. The class reference gives the exact scope, example and acceptance checks.

## Observable verification

Check the actual business composition in a browser:

1. Tab and Shift+Tab reach the intended element, with a visible theme-consistent indicator.
2. Link activation, button activation or the custom interaction still behaves as defined by its owner.
3. Moving focus to an independently interactive child removes the parent's focus indicator.
4. Light/dark mode and forced-colors preserve visible focus; narrow layouts and scrolling do not clip it.
5. Unbound neighboring content retains its own presentation and tab order.

DOM tests can verify the class reaches the target and that the binding adds no behavior. They cannot establish visible focus, contrast or clipping. A focus treatment is not by itself a claim of WCAG conformance. See [common control focus](controls.md) for imperative focus handles; those are a separate API.

Checkable editors keep native focus indicators on their actual options. Their named fallback group/status containers use this same backend presentation when no option can receive recovery focus. They become programmatically focusable only on demand and remove that temporary tabindex on blur. An option receiving focus does not activate an enclosing group outline. See [choice groups](choice-groups.md).
