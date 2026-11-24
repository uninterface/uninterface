# UiContentProps

Type-only export from `@uninterface/uninterface` describing [UiContent](../components/UiContent.md)'s ordinary content-hosting props.

```ts
interface UiContentProps {
  inset?: 'default' | 'none'
  height?: 'content' | 'full'
  scroll?: 'none' | 'horizontal' | 'vertical' | 'both'
  'aria-label'?: string
}
```

Defaults are backend insets, content height and no scrolling. Set inset to none for a flush content host, including a navigation sidebar; only this host's padding is omitted. Unsupported inset values are rejected. Vertical/both scrolling needs full height and a definite parent allocation. Any scrolling needs a nonempty aria-label. Width fills the available allocation. The business composition owns bounds and naming; core validates combinations; the backend owns inset geometry, scrolling and focus clearance. Concrete spacing values and field/control state are not part of this type.

Use individual props or a typed computed object with v-bind. Changes preserve the mounted content tree. Verify scroll naming, retained drafts, bounded geometry and visible focus as described in [scrolling content](../../guides/scrolling-content.md).
