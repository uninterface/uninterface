# UiThemeColor

A shared semantic color role for components that accept themed colors. Business code chooses meaning; the installed theme supplies appearance. Import from `@uninterface/uninterface`.

```ts
import type { UiThemeColor } from '@uninterface/uninterface'
const approvalColor: UiThemeColor = 'success'
```

## Vocabulary

`UiThemeColor = UiDefaultThemeColor | Extract<keyof UiThemeColorExtensions, string>`.

The required baseline is `primary`, `success`, `danger`, `warning`, `info`, and `secondary`. These mean theme identity, positive outcome, dangerous/destructive meaning, caution, information, and supporting presentation respectively. Extensions add named semantic roles through [UiThemeColorExtensions](UiThemeColorExtensions.md) and runtime [definitions](../constants/uiTheme.md). Literal CSS colors and arbitrary strings are not accepted.

`accent` is an example of an optional complementary-emphasis role; a theme may implement it or support only the baseline. TypeScript vocabulary is project-wide; a type declaration does not prove that a particular installed theme implements the role. Runtime and manifest checks enforce actual support.

The same vocabulary applies across components; there are no button-specific extension names. A role does not dictate action importance, layout, treatment, or control behavior. Danger does not trigger confirmation or deletion. `error` is not a baseline role; invalid-state feedback remains a separate concept. Omitted color and default selection belong to each consuming component's contract.

## Implementation responsibilities

`theme.colors.v1` guarantees the six baseline roles. `theme.color.<name>.v1` claims support for one declared extension across the installed theme's supported themed components. A component capability such as `button.color.v1` means that component consumes the installed theme's roles; it does not define a separate palette. Declaring an extension without claiming support does not make it usable. Unsupported roles fail loudly on components that consume color, never substitute another role. UiCollapsible has an explicit optional-presentation exception: if its backend lacks collapsible.color.v1, the entire request is ignored before theme-role validation.

Themes fulfill each supported role in relevant foreground/background/border, interaction, variant and supported light/dark contexts. Declared support requires actual mappings and acceptance coverage across applicable components. A declaration alone cannot prove CSS or contrast correctness. Business authors do not supply concrete colors or backend classes. Components continue to own their behavior and accessibility; color must not be the only essential cue.

Use [getUiRuntime](../functions/getUiRuntime.md) when a palette itself is the content being explored, such as a theme showcase. Business workflows that require a specific extension should declare that requirement rather than silently omitting functionality on unsupported themes.

## Verification

Check baseline roles, declared-but-unsupported extensions, unknown names, and supported extension rendering. Verify reactive color changes preserve component behavior and focus. Test every supported role with applicable treatments and verify appearance/contrast in browsers. A palette showcase must reflect actual supported roles; explicit extension requests must fail when the installed theme does not support them.

See the [theme-color guide](../../guides/theme-colors.md). Strategy negotiation, runtime theme switching, and public tone selection remain separate work.
