# UiLayoutProps

`UiLayoutProps extends UiLayoutOptions, UiZLayoutProps`, exported from `@uninterface/uninterface`, describes [UiLayout](../components/UiLayout.md)'s ordinary Vue props. It adds `'aria-label'?: string`, a meaningful accessible name required for a requested scroll region. [UiZLayoutProps](UiZLayoutProps.md) supplies optional `zOrder` and allocation-level `zParts` independently of geometry.

Props can be supplied individually or together through `v-bind`. A computed value or business layout control can produce them without registering with UiLayout. The component has no knowledge of the producer or environment detection. See [responsive layouts](../../guides/responsive-layouts.md) for reactive binding examples.

Core applies defaults to omitted values and validates the current combination on every render. Backend classes, child content, and controls are not stored in these props. Supply children through the default slot. See [UiLayoutOptions](UiLayoutOptions.md) for option types and the component reference for failures and observable verification.
