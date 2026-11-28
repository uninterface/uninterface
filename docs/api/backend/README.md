# Backend authoring reference

Backends own rendered structure, toolkit integration, accessibility wiring and presentation. Core owns control state, parsing, validation timing, submission and shared interaction flow. A backend must fulfill the shared contracts without introducing a competing state or validation manager.

Start with [assembly and package protocol](assembly.md) and the [backend compliance checklist](../../agents/backend-compliance.md). Each backend package owns its installation, native mappings, customization instructions and support limits.

## Binding and helper references

| Responsibility | Reference |
|---|---|
| Assembly and package protocol | [Static imports, required modules, integration hooks, capabilities and customization documentation.](assembly.md) |
| Presentation and accessibility | [Avatars, shared styling, native integration, hidden content containment, typography and native HTML.](presentation.md) |
| Controls, forms and focus | [Editor and action bindings, form association, focus handles, search and segmented selection.](controls.md) |
| Strategy integration | [Query resolution, field policy, alignment and size integration.](strategies.md) |
| Layout and allocation | [Layout bindings, theme spacing, density and adjustable regions.](layout.md) |
| Navigation and menus | [Application navigation, entries, menus, breadcrumbs and context-menu hosting.](navigation.md) |
| Modals, drawers and floating panels | [Overlay views, lifecycle, motion, positioning and drawer allocation.](overlays.md) |
| Feedback and read-only details | [Notices, badges, panels, empty/loading states and managed feedback targets.](feedback.md) |
| Files, uploads and previews | [Acquisition, workflow presentation, progress and preview view helpers.](files.md) |
| Input frames and cooperation | [Shared surfaces, participation and control-frame ownership.](input-frames.md) |
| Collection views | [List/table/paginator bindings, measurement, summaries and footer navigation.](collections.md) |
| Collection headers, filters and badges | [Header/editor hosting, panel composition and badge interactions.](collection-presentation.md) |
| Dynamic stacking integration | [Actual root/popup registration and core-owned ordering.](stacking.md) |

Use the [binding and helper index](symbols.md) to find a named interface, helper or implementation rule.
