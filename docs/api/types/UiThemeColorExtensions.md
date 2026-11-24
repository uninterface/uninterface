# UiThemeColorExtensions

An initially empty interface exported from `@uninterface/uninterface/theme` for TypeScript declaration merging. Its string keys extend [UiThemeColor](UiThemeColor.md); members conventionally have type `true`.

```ts
import type {} from '@uninterface/uninterface/theme'

declare module '@uninterface/uninterface/theme' {
  interface UiThemeColorExtensions {
    premium: true
  }
}
```

This declares vocabulary only. A package must also supply a runtime semantic definition and the installed theme must implement and declare `theme.color.premium.v1`. See [uiTheme.colors.define](../constants/uiTheme.md) for deriving these type keys from one runtime declaration without duplicating a list of names.

Augmentation is project-wide, not scoped to a Vue subtree. Including multiple theme packages may make their combined vocabulary type-check even though only one theme is installed. Runtime and build requirements remain authoritative for availability. Applications should include the selected theme package's declarations in their TypeScript program.

This interface adds no runtime registration or styling. Test that declared extensions are accepted and typos remain rejected; separately verify installed support.
