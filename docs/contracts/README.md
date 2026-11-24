# Contracts

Contracts define the business meaning of a concept, the responsibilities of controls and implementations, and the behavior that must be verifiable. They guide both library use and backend development.

Use the [API reference](../api/README.md) for usable exports and exact signatures. Contracts distinguish current guarantees from conceptual extensions; a broader semantic proposal does not supply a runtime API.

## Composition and presentation

The [control presentation principles](../guides/design-principles.md) establish shared shape, state-size stability and native/adapted implementation expectations across these contracts.

| Contract | Concern |
|---|---|
| [Native HTML content](native-html.md) | Safe native element set, backend defaults and content/layout spacing ownership |
| [Logical nodes](logical-node.md) | Composition, relationships, and ownership boundaries |
| [Dynamic z-order](dynamic-z-order.md) | Core-owned ordering, component/layout APIs and backend registration |
| [Layout](layout.md) | Space assignment, division, scrolling, and visibility |
| [Input-styled controls](input-styled-controls.md) | Shared field placement, input frame, focus, shape and backend obligations |
| [Frames](frame.md) | Outward presentation, attachment, and surrounding interaction |
| [Strategies](strategy.md) | Presentation policy, scope, composition, and agreement |
| [Icons](icon.md) | Semantic names, optional tones, and presentation selection |

## State and interaction

| Contract | Concern |
|---|---|
| [UI state](ui-state.md) | Control-owned UI state and business-owned lifetime |
| [Forms](form.md) | Fields, codecs, validation, and form lifecycle |
| [Common control API](../guides/controls.md) | Shared editor availability, ownership and focus guarantees |
| [Control bindings](control-binding.md) | Connecting control roles and live state to components |
| [Upload region](upload-region.md), [API and controller patterns](upload-region-api.md) | Implemented acquisition workflow, retained/service destinations, optional progress/preview and backend-owned layout |
| [Lists](list.md), [control/view APIs](list-api.md), [view/value contracts](list-view-decisions.md) | List controls, sources, views, pagination/continuation and parent-value editing integration |
| [Entries](entries.md) | Shared collections, source lifecycle, menus and selection |
| [Search and suggestions](search.md) | Search controller, input bindings and custom-editor suggestion surface |
| [Date/time input family](date-time.md) | String values/codecs, view projection, timezone, eligibility and half-open range direction |

## Shared guarantees and extension

| Contract | Concern |
|---|---|
| [Accessibility](accessibility.md) | Responsibilities and verification |
| [Internationalization](i18n.md) | Language, formatting context, and semantic stability |
| [Capabilities](capability.md) | Explicit support, requirement matching, and failure behavior |
| [Plugins](plugin.md) | Backend extensions and higher-level compositions |
| [Test kit](test-kit.md) | Shared scenarios and acceptance against documented rules |

For implementation details, use the [backend authoring reference](../api/backend/README.md). For application composition, use the [usage guides](../guides/README.md).


[Feedback routing](feedback-routing.md): virtual targets, scoped delivery lifetime and UiNotice presentation.

- [Collection filters](collection-filter.md): independent criteria, editing and presentation ownership.
