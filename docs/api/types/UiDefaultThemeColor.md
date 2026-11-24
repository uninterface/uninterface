# UiDefaultThemeColor

The required theme vocabulary: `'primary' | 'success' | 'danger' | 'warning' | 'info' | 'secondary'`. Import this type from `@uninterface/uninterface/theme`.

Use it when a composition deliberately accepts only portable baseline roles. General themed component props use [UiThemeColor](UiThemeColor.md), which also accepts declared extensions. Theme implementations claiming `theme.colors.v1` must implement all six roles; extensions cannot redefine them.

Verify that baseline-only assignments reject extension names, including accent.
