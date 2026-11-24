# Uninterface

A UI language for building everyday business interfaces without making every developer a UI designer.

Uninterface aims to let software developers and development agents express data, actions, rules, and structure through semantic Vue components. Shared controls manage UI behavior; presentation backends and strategies turn that meaning into a coherent interface. The goal is a professional-looking, understandable, structured, accessible, and working result without routine CSS tuning in business code.

The package exports Vue/TypeScript source. The [API reference](docs/api/README.md) defines its exports and their limits.

## Why Uninterface exists

A developer is asked to build a web-based solution with straightforward UI needs, often without a professional UI designer. The business task may be clear, yet implementation becomes a succession of decisions about spacing, alignment, colors, responsive behavior, validation messages, and loading indicators. Time intended for business functionality goes into adjusting the interface.

Agentic development faces the same problem. An agent can keep adding presentation choices and refinements, creating more work to review and tune while moving away from the original task.

Uninterface aims to make conventional UI needs straightforward to express and reliably presented. Its defaults should follow broadly established design and interaction principles, so authors can concentrate on what the interface must accomplish. A supported business composition should not need a second round of CSS work to become usable and coherent.

## What Uninterface is

- **A shared UI language.** Fields, forms, actions, layouts, and control bindings express meaningful relationships and behavior. The initial authoring surface is Vue components, with room for reusable business compositions.
- **A set of usable presentation defaults.** Backends supply coherent appearance and accessible interaction. Strategies package deliberate presentation choices at a meaningful scope, such as a whole form, without requiring authors to specify CSS.
- **A separation of model, view, and control responsibilities.** Business code owns domain data, rules, and operations. Uninterface controls manage UI state and interaction flow. Backend views present that state and report interactions.
- **A foundation for different usage contexts.** Responsive desktop/mobile and other web usage contexts, internationalization, and light/dark presentation are design requirements. Environment detection, language resources, and theme details belong outside individual business workflows.
- **Contracts and guidance for humans and agents.** Components and exports document their meaning, responsibilities, and observable behavior. Usage guidelines explain how to compose them and why those boundaries matter.

The intended fit is the broad range of business interfaces that need to look professional and behave correctly using familiar, reasonable conventions. Authors still decide the business task, information structure, labels, rules, and actions. Uninterface supplies the UI mechanisms and presentation needed to realize those decisions.

## What Uninterface is not

- **A tool for bespoke visual design.** Exact art direction, one-off styling adjustments, and highly specialized visual experiences are outside its goal. Its purpose is to make conventional interfaces work well with shared defaults.
- **A requirement to wrap every element.** Native HTML, other Vue components, and specialized integrations can coexist with Uninterface. Use each for the concern it serves.
- **An application model or business-policy engine.** Persistence, authorization, domain rules, and business decisions remain with the application.
- **An automatic product designer.** It does not infer missing requirements or decide which workflow a business needs.
- **A promise of every framework or platform.** The public authoring API targets Vue and web interfaces.

Extensibility supports additional controls and business compositions within these boundaries. It does not make arbitrary visual customization the responsibility of the shared language.

## Keep concerns separate

Uninterface takes model–view–controller separation seriously:

| Concern | Owner |
|---|---|
| Domain data, business rules, authorization, and persistence | Application and business compositions |
| Editing drafts, validation execution, submission lifecycle, and other UI state | Uninterface controls |
| Meaningful composition of fields, actions, and layouts | Business-facing Vue components |
| Rendered structure, styling, focus mechanics, and accessible presentation | Backend views, fulfilling Uninterface contracts |
| Coherent presentation policy and concrete visual values | Strategies and themes |

For example, a record editor can accept typed data and a save operation. Internally, its form control owns the editing session and validation flow; its buttons observe submission state through bindings; the backend decides how fields, errors, and loading indicators appear. Changing the presentation should not require rewriting the business rules.

Native HTML is appropriate for ordinary content such as branding. A specialized component can own its own interaction, or integrate through Uninterface's contracts when it needs shared field, validation, or control behavior. Mixing components is supported in principle, but responsibility must remain explicit: two mechanisms must not independently manage the same editing or submission state. Uninterface's guarantees cover its contracts and integrations, not arbitrary surrounding content.

## Start here

Add Uninterface to an existing Vue project by resolving `@uninterface/uninterface` and one presentation backend under the alias `@uninterface/backend`. Follow the chosen backend's setup guide for package resolution, styles, and any required Vue or build integration. Business components import from `@uninterface/uninterface`.

Start with [project setup](docs/getting-started.md) for shared requirements and a first component. Each backend's own documentation supplies its setup instructions and compatibility information.

Continue in the [documentation](docs/README.md) for usage principles, API references, contracts, and backend architecture.

Use the [application development procedure](docs/agents/application-development.md) to apply the contracts, or the [backend compliance checklist](docs/agents/backend-compliance.md) to implement a presentation backend.

- [Collection summaries](docs/guides/collection-summaries.md): lazy record access, business-provided data and table/card presentation.

- [Collection views](docs/guides/collection-views.md#infinite-continuation-content): per-view infinite loading/completion messages and content slots.

- [Composed drawer navigation](docs/guides/drawer-navigation.md): coordinate a hamburger trigger, modal drawer and vertical menu through a reusable control.

Use [operation progress](docs/guides/progress.md) for measured or unknown work with `UiProgressBar`; upload presentations compose the same bar.

[Editable collection coordination](docs/guides/collection-editors.md) composes existing child-value controls with local views, editing actions and focus recovery.

## License

Uninterface source is available under the [MIT License](LICENSE).
