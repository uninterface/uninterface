# UiCard

Present one coherent subject as a visibly bounded content unit: an invoice, customer summary, settings category or subordinate business group. Import from `@uninterface/uninterface`. The backend supplies boundary, surface and interior insets; the author supplies content and meaningful hierarchy. See the [card guide](../../guides/cards.md).

## API

| Input | Meaning |
|---|---|
| `level?: UiHierarchyLevel` | Explicit hierarchy request; overrides the regional hierarchy preference for this card |
| `color?: UiThemeColor \| null` | Explicit role overrides the level's default color; null requests neutral; omission consults the profile |
| `title` slot | Optional title with backend-owned typography; supply a meaningful heading element when appropriate |
| `description` slot | Optional supporting introduction beneath the title |
| Default slot | Main content with card-owned insets; ordinary HTML, Vue components, controls and nested cards are allowed |
| `layout` slot | Alternative body for an arranged composition that owns its own insets; the card adds no body inset |
| `header` slot | Arbitrary introductory content; nonempty output replaces title and description |
| `footer` slot | Optional concluding content or actions |
| `top-end` slot | Optional concise action group over the frame’s logical upper trailing corner; independent of header and media |

No component-specific events, methods or control are introduced. Title/description wrappers do not imply a heading rank or accessible name. A direct heading in the title slot adopts its title typography; the header slot remains opaque. Standard attributes and listeners target the outward container. The card introduces no interactive role, tab stop or landmark. A header is not automatically an accessible name; authors supply meaningful HTML headings and standard naming attributes where the chosen semantic role requires them. A hierarchy level never determines heading rank.

## Hierarchy and strategies

[UiHierarchyLevel](../types/UiHierarchyLevel.md) is `-2 | -1 | 0 | 1 | 2`. Negative levels express broader/higher grouping, zero an ordinary unit, and positive levels subordinate grouping. These are ordinal values, not dimensions, heading ranks, control sizes or z-index values. They do not imply greater business importance or a color role.

An omitted prop uses the agreed [uiHierarchyLevel](../../strategies/uiHierarchyLevel.md) preference, otherwise `0`. Explicit `0` overrides a regional preference just like other explicit levels. The prop affects only this card; it does not install a strategy for descendants. Nesting never automatically increments the level. Strategies use normal logical scope and barriers, with target `card`.

All five requested values are supported. An implementation may fulfill `-2` with its `-1` treatment. That is the only permitted level collapse: `-1`, `0`, `1` and `2` have differentiated treatments and retain discernible grouping boundaries. Agreement compares original requests, so conflicting -2/-1 declarations do not agree merely because they can look alike. No answer/disagreement restores zero. The default treatment map shares -2/-1. A [uiCardPresentation](../../strategies/uiCardPresentation.md) strategy can customize every level independently; explicit -2 differences are retained. Authors can deliberately make custom levels look alike and own evaluating that choice.

## Color and portable presentation

The [card presentation strategy](../../strategies/uiCardPresentation.md) customizes color, header treatment, footer emphasis, density, surface, elevation, border and title typography per level. Core selects an agreed map or the documented default map; backends own concrete values and native integration. This concern is independent of level selection. No strategy is required for ordinary use.

A card's explicit `color` overrides its profile color; `null` explicitly clears the role, while omission uses the profile. Without a configured role the card is neutral. Shared `UiThemeColor` validation includes installed extensions; unsupported effective roles fail instead of falling back. Boundary and tinted body regions use the role; headers coordinate their band treatment with the native footer; ordinary foreground content and child control roles remain unchanged. This is neither implicit descendant color inheritance nor alert/validation behavior.

## Space and content ownership

The card fits its assigned width, includes borders/insets in that width, and grows with its content. Its header, body and footer own interior insets; ordinary consumers need no UiContent to obtain usable card padding. Parent layouts own spacing between cards. Layouts inside slots own local item arrangement. Explicit nested UiContent retains its additional insets; the card never cancels them.

For an already-arranged body, use `#layout` instead of the default slot. The card omits only its own body inset; the composition owns content insets (for example, UiContent in each UiRegionLayout region). Header/footer insets, the frame, and nested cards remain unchanged. Supplying meaningful default-slot content together with a layout slot is an error. This does not add bounded-height hosting, scrolling or a height offer; a bounded composition still owns its height. See the [card guide](../../guides/cards.md#host-an-arranged-body).

Header/title/description and footer omissions release their space and separators. A headerless card retains its enclosing boundary and ordinary body insets. The optional `top-end` slot does not create a header or footer; the backend anchors it to the frame using logical placement and theme-owned clearance. Use a concise action such as an icon-only Remove button with a meaningful accessible label, and verify it does not obscure essential content or clip focus. Empty corner output omits its host. Whitespace, comments and empty fragments count as empty; child component internals remain opaque. Native content order and keyed child identity are preserved. Changes to level, strategy, theme or language do not remount business content or reset editing state.

Cards introduce neither a scrollport nor sticky regions. Content-height cards do not pass a parent's bounded height offer through unchanged. Use existing layouts around the card; bounded-height card hosting is not implemented. Overflow and focus indicators must remain reachable rather than being clipped by native card defaults. Oversized content still needs an appropriate content/layout policy.

## Implementation responsibility

Core registers one logical `card` node, validates the explicit level, resolves the hierarchy preference and default, omits known-empty supporting slots, and statically imports `@uninterface/backend/UiCard.vue`. The view receives [UiCardViewProps](../backend/feedback.md#uicardviewprops) with the original requested level, effective color, complete treatment and supported slots. It owns all concrete DOM, theme treatment, slot insets and native integration. It may compose surfaces rather than use a toolkit's Card widget. Declare `card.v1`, `card.color.v1`, `strategy.hierarchy-level.v1` and `strategy.card-presentation.v1`; missing support is an error.

Use a stable render structure so presentation changes preserve child controls and focus. Do not turn a lower level into an alert, selectable list, disclosure or navigation action. Concrete mappings belong in the supplying backend's presentation documentation.

## Observable verification

Compare all five requests and nested cards in light/dark mode and narrow/wide layouts. Verify the permitted upper-level adaptation and distinct ordinary/subordinate treatments, optional slot removal, root attributes/listeners, accessible heading order, visible focus and absence of accidental scrollports. Switch explicit and regional levels while retaining input value, component identity and focus. Test scope targets/depth/stopAt, family/query blocking, conflicting/custom answers and prop removal. A card-only import excludes unrelated controls and backend views. Verify that a layout body reaches the frame without an extra card inset, that its explicit UiContent insets and nested default-card padding survive, and that switching body slots preserves mounted content. DOM checks establish state/structure; browser checks establish geometry and visible presentation.

## Loading

`loading?: boolean` (default false) masks the entire card, including header/footer, while preserving its shape and mounted content. The mask blocks pointer/keyboard interaction and releases on completion. The owner remains responsible for ending external loading on failure or cancellation. See [loading](../../guides/loading.md) for surface ownership, native backend integration and verification.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
