# UiCollectionButton

A specialized [UiButton](UiButton.md) for the actions slot of [UiCollectionView](UiCollectionView.md). Import from `@uninterface/uninterface`. It reuses UiButton rather than adding a second action engine. No action key is required; use ordinary Vue keys in repeated declarations.

The default slot supplies the action label, such as Edit or Remove. `#icon` supplies artwork, normally UiIcon. Effective `presentation` is an optional local `text`, `icon+text` or `icon` override, otherwise the owning collection's `actionPresentation`. Text suppresses the icon; icon+text shows both; icon retains an accessible hidden label and native button hint. Missing/empty icon output falls back to text. Slot component internals remain opaque. Icon-only labels should be plain text, or provide a meaningful aria-label for opaque label content.

Props `binding`, `form`, `type`, `color`, `variant`, `disabled` and `loading`, click handling and exposed `focus()` follow UiButton. Content mode remains independent of surface. Optional defaultVariant: UiButtonVariant supplies each action's ordinary treatment for the bordered collection variant; omission supplies text/native-icon treatment. The backend chooses the default collection action variant when no strategy answers. Soft/text strategies can override these composition defaults. Explicit non-icon variant takes precedence over strategies. The collection action strategy selects bordered/soft/text surfaces, including for icon-only content. An explicit icon variant cannot override the collection's content mode. See [collection action variants](../../strategies/uiCollectionActionVariant.md). Bound type/loading/activation remain owned by the producer, local disabled can only tighten restrictions, and loading prevents duplicate activation. Do not combine a binding with a click handler.

Use `v-if` for business applicability/visibility; a disabled binding does not hide the button. Dynamic changes are reactive. Label content need not contain a record identifier; an explicit aria-label can add that context without making the visible action verbose.

Core inherits collection presentation and delegates to UiButton; backend buttons own native rendering, focus and accessibility. The collection automatically supplies the table actions column and chosen card action region (`cardActionPlacement="footer"` or `"top-end"`). Verify all three modes, fallback without an icon, visible versus disabled distinctions, one invocation per click, retained accessible names and loading/live-disabled guards.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
