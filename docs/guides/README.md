# Using Uninterface

Uninterface provides business-facing UI abstractions together with principles for using them. These guides explain how to structure an interface, why responsibilities belong at particular boundaries, and how to verify the result. They are written for software developers and development agents using the same public contracts.

The [API reference](../api/README.md) explains individual exports. The [contracts](../contracts/form.md) define responsibilities and observable guarantees. Usage guides connect those pieces into application designs; they distinguish working implementation patterns from capabilities still under research.

## Scope and expected outcome

Use Uninterface when the task calls for a conventional business interface that is professional-looking, understandable, structured, and operable without routine CSS tuning. This is especially useful when there is no dedicated UI designer or when development agents need clear limits on presentation work. Define the task and its acceptance criteria before selecting components; avoid adding visual refinements that do not serve them.

The [project scope](../../README.md) distinguishes this goal from bespoke design. Responsive web contexts, internationalization, accessibility, and light/dark presentation are shared design requirements, not styling exercises for every business component. Consult the [API reference](../api/README.md) and the selected backend’s capability and limitation documentation before relying on a feature.

## Principles

| Principle | Application | Reason |
|---|---|---|
| Start with the business task | Define what the person edits, decides, or accomplishes and the permitted outcomes | Component choices follow meaning and behavior |
| Encapsulate complete business compositions | Let a record editor own its field definitions, codec selection, validation wiring, and editing workflow | Consumers can use the component without rebuilding its internals |
| Make ownership explicit | Identify the owners of persisted data, editing state, operations, and session lifetime | Clear ownership prevents accidental sharing, discarded drafts, and competing state managers |
| Keep domain rules with business code | Supply rules and persistence through business components or shared domain modules; use Uninterface to manage their UI execution | Reusable UI mechanisms cannot decide application policy |
| Express meaning through shared contracts | Use semantic components and layouts, leaving concrete markup, spacing, colors, and toolkit integration to backends | The same business composition can work across presentations |
| Use supported defaults | Require only presentation choices that serve a concrete business need | Ordinary consumption should not require a design exercise |
| Document consumer obligations | Specify data types, units, operations, lifecycle, feedback, and failure behavior | Humans and agents can use the component without inspecting its implementation |
| Verify observable behavior | Derive acceptance cases from the contract and exercise the actual composition | Tests establish whether the promised task and state transitions work |

Uninterface defines its public rules; backends fulfill them. A toolkit's defaults do not determine business semantics. Required capabilities must be declared and satisfied; an unsupported requirement is an error, not permission to silently change behavior. See the [capability contract](../contracts/capability.md).

The [control presentation principles](design-principles.md) establish coherent rectangular regions, native implementation preference with consistent adaptation, and stable dimensions through ordinary state changes. They explain business expectations, backend responsibilities and intentional exceptions such as UiCollapsible expansion, including the [native arrow rule for anchored surfaces](design-principles.md#native-arrows-on-anchored-surfaces).

For conventional field editors, the [input-styled control agreement](controls.md#input-styled-controls) defines the placement, shared input surface, focus and shape that business authors can expect backends to supply.

## Recommended business patterns

Use these patterns as starting points for recurring application tasks. They explain ownership, consumer obligations, supported composition and observable checks. Adapt business policy where the task requires it; recommendations do not add mandatory controls or workflows.

| Pattern | Recommended composition |
|---|---|
| [Form-integrated modals](form-modals.md) | An owned editing session with Save and Cancel together in the modal footer, native form association, validation, retry and deliberate dismissal policy |
| [Collection views](collection-views.md) | Shared field/action definitions for tables and cards, explicit query/selection ownership and an editor lifetime independent of presentation changes |

## Compose across clear boundaries

Apply model–view–controller separation by responsibility. The application owns domain data and operations; Uninterface controls own editing and interaction state; views present that state and report user actions. A reusable business component can assemble these responsibilities behind a small consumer interface without merging their ownership.

Use native HTML for ordinary content such as branding, and other components for concerns they already handle appropriately. There is no requirement that every rendered element be an Uninterface component. A specialized editor participating in a form must integrate with the relevant field/control contracts so that value changes, validation, availability, and submission have clear owners. Avoid a second form manager or widget lifecycle competing with the shared control.

Presentation defaults should cover supported everyday tasks. When a recurring need warrants a deliberate presentation choice, prefer a documented strategy at its meaningful scope over repeated per-field styling. Where a capability is missing, identify the gap explicitly instead of hiding it behind business-side CSS or assuming an undocumented integration works.

## Base decisions on evidence

Technical claims need supporting evidence regardless of whether they come from a human developer or a development agent. Check platform claims against authoritative specifications or official documentation, and implementation claims against source or observable tests. Distinguish verified facts from assumptions, design tradeoffs and preferences; make uncertainty explicit.

When reviewing a proposed change, first establish the behavior and requirement involved, then compare the alternatives against the contract. A familiar platform convention can support a design, but does not automatically require its inclusion. An alternative approach does not automatically invalidate an existing one. Explain the reasons for a recommendation and revise it when evidence changes.

## Guides

Start with [getting started](../getting-started.md) for setup. The [API reference](../api/README.md) covers individual exports; the [contracts](../contracts/README.md) define shared semantics.

### Business workflows and controls

- [Authoring and consuming business components](business-components.md)
- [Compose a confirmed email editor](confirmed-email.md)
- [Form-integrated modals](form-modals.md)
- [Common control API](controls.md)
- [Connect a control once](control-bindings.md)
- [Asynchronous validation](validation.md)
- [Numbers and monetary amounts](number-and-money.md)
- [Choosing button colors and variants](button-actions.md)
- [Choice groups and three-value checkboxes](choice-groups.md)
- [Multiple selection](multiple-selection.md)
- [Segmented selection](segmented-selection.md)
- [Search and suggestions](search.md)
- [Dates, times and intervals](temporal-inputs.md)
- [Files and uploads](files.md)
- [Shared input frames](input-frames.md)
- [Delegated control frames](control-frames.md)

### Collections

- [Collections: ownership and presentation](collections.md)
- [List sessions and sources](lists.md)
- [Editable child collections](editable-collections.md)
- [Collection views](collection-views.md)
- [Table column sizing and alignment](table-columns.md)
- [Column filtering and separate query controls](column-filtering.md)
- [Reusable collection filters](collection-filters.md)
- [Built-in collection filters](filter-patterns.md)
- [Collection header](collection-header.md)
- [Collection presentation: layers, selection and conditions](collection-presentation.md)
- [Filter presentation adaptations](filter-adaptations.md)
- [Collection header adaptations](header-adaptations.md)
- [Filter and sort collection adaptations](collection-panels.md)
- [Collection filter and sort badges](collection-badges.md)
- [Collection sorting capabilities](collection-sorting.md)
- [Customizing collection presentation](collection-customization.md)

### Layout, panels and overlays

- [Document pages and bounded workspaces](application-layouts.md)
- [Responsive layouts and reactive bindings](responsive-layouts.md)
- [Scrolling content, alignment and visible focus](scrolling-content.md)
- [Framing layout regions](layout-framing.md)
- [Layout density](layout-density.md)
- [Field alignment](field-alignment.md)
- [Group content with cards and hierarchy](cards.md)
- [Tabs and collapsibles](panels.md)
- [Awaitable modal interactions](modals.md)
- [Drawers and popovers](drawers-and-popovers.md)
- [Floating launchers and resizable panels](floating-panels.md)
- [Dynamic stacking relationships](dynamic-z-order.md)
- [Navigation menus and shared location](navigation-menus.md)
- [Links, breadcrumbs and tooltips](navigation-and-tooltips.md)
- [Menus and asynchronous choices](menus-and-choices.md)

### Presentation and feedback

- [Control presentation principles](design-principles.md)
- [Native HTML content baseline](native-html.md)
- [Apply presentation strategies](strategies.md)
- [Focus presentation for author-supplied elements](focus-presentation.md)
- [Feedback and record details](feedback-and-details.md)
- [Route feedback to a placed notice](feedback-routing.md)
- [Toasts and notifications](toasts-and-notifications.md)
- [Loading indicators and surfaces](loading.md)
- [Empty states](empty-states.md)
- [Typography and font delivery](typography.md)
- [Theme colors and extensions](theme-colors.md)
- [Application color mode](color-mode.md)
- [Text in reusable definitions](text-sources.md)
- [Application localization and icons](localization-and-icons.md)

### Assembly and verification

- [Application identity, isolation and server rendering](application-isolation.md)
- [Runtime information and API boundaries](runtime-information.md)
- [Test business workflows](testing.md)


[Documentation index](../README.md) · [Development procedures](../agents/README.md)

- [Collection summaries](collection-summaries.md): lazy record access, business-provided data and table/card presentation.

- [Composed drawer navigation](drawer-navigation.md): coordinate a hamburger trigger, modal drawer and vertical menu through a reusable control.

- [Operation progress](progress.md): standalone known/unknown bars, producer ownership and upload composition.

- [Collection editor coordination](collection-editors.md): local projection, action bindings and view-local recovery for editable child collections.
