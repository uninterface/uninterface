# UiThemeColorDefinition

The semantic documentation for a theme-color extension. Import from `@uninterface/uninterface/theme`.

```ts
interface UiThemeColorDefinition {
  readonly description: string
}
```

`description` is a nonempty explanation of the role's meaning for authors and implementers, not UI copy or a CSS value. [uiTheme.colors.define](../constants/uiTheme.md) validates and freezes definitions. The installed backend descriptor and JSON manifest carry these definitions; support is declared separately through theme capabilities.

Implementations translate this meaning into the appropriate presentation contexts. Verify nonempty descriptions and reject malformed names; declarations alone do not verify visual conformance.
