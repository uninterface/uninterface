# UiResolvedLayout

Interface exported from `@uninterface/uninterface`. It has the same members/value types as [UiLayoutOptions](UiLayoutOptions.md), with every member required after defaults have been applied to the current props. It is the geometry-policy portion of the backend's [UiLayoutViewBinding](../backend/layout.md#uilayoutviewbinding).

Core produces this validated snapshot. Backend authors implement its meaning and treat it as read-only. Business applications normally supply `UiLayoutOptions` rather than constructing a resolved snapshot. No dimensions in pixels, CSS declarations, child VNodes, or mutable layout state are included. UiLayout's reference specifies each member's behavior and valid combinations; no public resolver function is exported.
