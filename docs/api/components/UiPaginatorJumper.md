# UiPaginatorJumper

An independent page-number input borrowing an existing [UiPaginatorBinding](../types/UiPaginatorBinding.md). Import from `@uninterface/uninterface`.

| Prop | Meaning |
|---|---|
| `binding` | Required paginator binding |
| `aria-label` | Optional accessible-label override; defaults to localized “Go to page” |

```vue
<UiPaginatorJumper :binding="orders.bindings.paginator!" />
```

It needs no UiPaginator, UiField or UiForm ancestor. The component owns a temporary text draft, initialized from the accepted numbered page. Typing never requests data. Enter or blur commits a positive safe whole number within the known page count; unknown upper bounds are allowed when the source supports jumps. Empty, fractional, negative, exponential and out-of-range values show localized validation feedback without requesting or silently clamping. Whitespace is trimmed and leading zeros normalize on valid commit.

Cursor/non-jump sources, uninitialized or empty results, session restrictions and pending requests disable the control. Core guards the live binding before committing. Enter prevents enclosing-form submission and respects IME composition. Enter followed by blur issues at most one request. A failed request retains the requested draft; another explicit Enter may retry it, while blur does not automatically retry. The current accepted page is a no-op.

New accepted page/size metadata or a different binding resets the draft. Unrelated rerenders, pending intent, failures and locale changes preserve it. Unmount discards this local draft without disposing or requesting the shared session. Remount starts from accepted metadata. Source/read errors belong to the existing collection status; the jumper owns only local input validation.

Core owns draft/validation/commit behavior. Backends own native input and label integration, error association, keyboard wiring and presentation. Labels sit inline and normal control-surface height must match or be similar to paginator buttons and size selection. Native sizing/density is preferred. The input has approximately five visible digit cells plus native padding and borders; the localized inline label adds its own width. This is visible capacity, not a five-digit input limit: longer page numbers remain editable and undergo the same safe-integer/bounds validation. No universal pixel height is prescribed.

Validation feedback defaults to an automatically displayed anchored tooltip in supporting backends. Invalid Enter or blur requests feedback automatically. The tooltip appears when at least 50% of the input anchor is visible and takes no space in the footer. Editing clears the feedback. The input retains its accessible error description and focus. [uiValidationFailure](../../strategies/uiValidationFailure.md) applies at the `paginator-jumper` strategy target: `show-tooltip` selects floating feedback, `show-below` selects an inline message below the input, and `none` suppresses the failure message while retaining native invalid-state highlighting and preserving `aria-invalid` and rejection of invalid values. `show`, omission and the unsupported `show-embedded` fallback use the tooltip default. Below feedback may extend the surrounding row; consumers choosing `none` must explain failures elsewhere.

```vue
<UiStrategy :use="uiValidationFailure('show-below', { scope: { targets: ['paginator-jumper'] } })">
  <UiPaginatorJumper :binding="orders.bindings.paginator!" />
</UiStrategy>
```

Required capability: `paginator.jumper.v1`. Verify standalone placement, no typing/mount reads, Enter/blur deduplication, retry, bounds and unknown bounds, disabled source capabilities, accessible localized feedback, draft preservation and synchronization with independent navigation. Also verify five-digit visible capacity, longer editable drafts, tooltip error visibility without hover, stable footer geometry on failure, and strategy changes retaining input identity/focus. Real-browser geometry/focus/keyboard and assistive-technology acceptance remain separate.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
