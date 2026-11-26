# uiButtonWidth

Requests the width of standalone text-labelled buttons within a logical region. Import from `@uninterface/uninterface`:

```ts
uiButtonWidth(value: 'content' | 'full', options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
```

`full` fills the width offered by the parent allocation. `content` fits the button to its contents, constrained by the available width. Omission or conflicting answers retains the backend default. Equal values agree; scope and family/query barriers follow ordinary strategy rules. There is no new UiButton width prop or action-group component.

```vue
<UiStrategy :use="uiButtonWidth(mobile ? 'full' : 'content')">
  <UiLayout :direction="mobile ? 'vertical' : 'horizontal'" :wrap="!mobile">
    <UiButton>First action</UiButton>
    <UiButton>Second action</UiButton>
  </UiLayout>
</UiStrategy>
```

Layout owns the offered space; this strategy determines whether the button fills it. A full-width button cannot exceed a narrow parent allocation. Height, appearance, loading, disabling and action semantics remain unchanged. Icon-only buttons and actions participating in a parent's UiInputFrame do not consume width requests: their own square/shared-surface geometry takes precedence. An icon request without artwork falls back to a text button and can consume the width request.

supporting backends integrate this query via useUiButtonPresentation and declare strategy.button-width.v1. Stretch the actual control as well as its containment wrapper. Use compatible native width facilities or adapt the existing containment host. Keep focus, native sizing and accessible helpers intact. Use [uiButtonWidthQuery](../api/constants/uiButtonWidthQuery.md) to answer/block the concern from custom strategies.

For a settings panel, scope the strategy to the action area and choose full width in a narrow layout and content width in a wider layout. Block incoming width requests at that scope if the panel owns the action layout. Keep the strategy outside unrelated fields, previews and business actions.

Verify agreement/conflicts, blocking, desktop/mobile transitions without remounting, text-button stretch, icon/input-frame exclusions and unchanged click/disabled behavior. DOM checks establish selection and wiring; browser checks must confirm equal full widths, narrow/RTL containment and focus appearance.
