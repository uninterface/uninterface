# Assembly and package protocol

[Backend reference](README.md) · [API reference](../README.md)

Static imports, required modules, integration hooks, capabilities and customization documentation.

## Static assembly

For an implementation workflow and evidence requirements, use the
[backend compliance checklist](../../agents/backend-compliance.md). This
reference defines the bindings; the checklist covers mapping, native
integration, inherited context and acceptance review.

Application assembly selects one backend dependency under the stable name `@uninterface/backend`. The bundler and TypeScript must resolve the same package exports. Backends may use their own source directory structure. Core components statically import individual exports such as `@uninterface/backend/UiButton.vue`; no eager registry or runtime component-name lookup is involved. Importing one component must not include unrelated views or controls. For example, UiApp alone must not pull in forms, layouts or responsive detection; UiNavbar alone must not pull in form controls or layout components.

| Export | Contract | Assembly responsibility |
|---|---|---|
| Package root | Named `uiBackend: UiBackendDescriptor` | Supply identity, dependencies, theme definitions and capabilities |
| `./capabilities.json` | Machine-readable capability manifest | Check application requirements against declared support |
| `./style.css` | Stable component/document styles and native font mapping; no font delivery | Import after one font entry, or alone for system fonts |
| `./font.css` — supporting backends | Backend-recommended selection and network font delivery | Import first, before style.css |
| `./font-bundled.css` — supporting backends | Same selection with local font assets | Explicit alternative to font.css; deploy emitted assets |
| `./layout` | Named `uiLayoutPresentation: UiLayoutPresentation` | Supply peer spacing and optional density levels to linear/flow/grid layouts; `layout.spacing.v1` |
| `./focus` | Named `uiFocusPresentation: UiFocusPresentationBinding` | Supply immutable presentation-only element bindings; `focus.presentation.v1` |
| Individual `./UiXxx.vue` modules | Default Vue views in the [binding references](README.md#binding-and-helper-references) | Resolve static per-component imports |
| `./integration` | Default UiBackendIntegration export | createUiApplication installs native contexts, locale resources and icon defaults |
| `./vite` — optional | Default factory callable without arguments returning Vite `PluginOption` entries | Apply alongside the Vue plugin when using Vite and the hook is exported |

A backend may additionally accept documented backend-specific presentation options in its build hook; no-argument invocation must retain its default setup. Core does not define the native option schema.

Optional means a backend need not export that hook; it does not mean consumers may omit an exported integration requirement. The Vite hook must be executable JavaScript when the build configuration imports it; `.mjs` is suitable. It may supply backend-specific compilation and CSS processing. Vue setup supplies toolkit services without registering an eager component catalog, owning business controls or routing, or requiring a new rendered business boundary.

Assembly tooling can discover hooks from explicit package exports. An absent optional export needs no action; a declared hook that fails to resolve or execute is an integration error and must not be silently ignored. Required exports must resolve, and capability gaps fail requirement checks. Only the selected backend's hooks are applied. Business imports remain `@uninterface/uninterface`.

Each backend must document its complete installation and setup, compatible versions, dependency and stylesheet effects, exported hooks, and supported capabilities and limitations. Toolkit-specific configuration and presentation details belong to that backend's documentation. Core defines this protocol without maintaining a backend list or named setup branches. A new backend fulfilling this contract does not require a core documentation or implementation change.


### Customization documentation

Each backend must state whether presentation customization is supported. Where
supported, its public documentation must provide concrete application-owned
files, import/setup steps, examples, defaults and limitations, linked from its
README and setup guide. Prefer a workflow concentrated in one or two theme/config
files after initial assembly. Do not require editing installed backend source,
copying native integration plumbing or adding toolkit-specific styling to each
business component.

Distinguish toolkit facilities from options actually accepted by the adapter.
Document native tokens/configuration, merging or replacement behavior where
applicable, stylesheet order and global effects, required assets, build-time
versus runtime changes, light/dark treatment and teleported surfaces. Describe
whether adapter-owned layout spacing and insets participate. When an upstream
theme builder is relevant, explain which exported files/settings are consumed,
any required conversion, compatible versions and unsupported portions; do not
claim that an unconsumed configuration file activates a theme.

Unspecified customization retains the documented defaults. Explicit semantic
requests and control authority remain binding: presentation configuration must
not replace model ownership, validation, loading/disabled behavior or required
keyboard interaction. Recoloring an existing role differs from adding a role,
which requires implementation and capability support. Describe unsupported
customization honestly rather than implying a universal configuration factory,
theme-import format or strategy API exists. Native appearance settings belong
in backend documentation; core defines these responsibilities without maintaining
toolkit option schemas.

Provide observable verification steps for changed presentation, including
states, focus, overlays and layout behavior. State acceptance policy and evidence
separately from any accessibility-conformance claim. A configurable theme does
not authorize silently modifying native defaults to satisfy a test.

Application assembly follows the selected backend’s setup guide. Development environments may automate the declared hooks; that orchestration is separate from this package’s exports. Core exports Vue/TypeScript source; see [source consumption](../../getting-started.md#source-consumption). General strategy negotiation beyond the documented synchronous agreements is not supported.


## Required view modules

Backend filenames match the public semantic component names, including `UiButton.vue` and `UiCheckbox.vue`. Each module exports one default Vue component. Slots are default slots unless stated otherwise. Fallthrough attributes and listeners must reach their meaningful target, not an arbitrary wrapper. Do not let consumer attributes override reserved state/association bindings. New backends are allowed different DOM structure; shared tests address roles, names, state, and results.

| Module | Props / slots | Reports or exposes | Obligation |
|---|---|---|---|
| `UiApp.vue` | UiAppViewProps; default content slot | availableHeight(number or undefined) | Application surface inheriting the document baseline, with full available width for content in document flow; `app.root.v1` |
| `UiCard.vue` | `UiCardViewProps`; header/title/description/default/footer/top-end slots | Standard root listeners | Bounded content, color and portable hierarchy presentation; `card.v1`, `card.color.v1`, `strategy.hierarchy-level.v1`, `strategy.card-presentation.v1` |
| `UiContent.vue` | UiContentViewProps; default content slot | Standard root listeners | Content insets; optional bounded, named scrolling; `content.inset.v1`, `content.scroll.v1` |
| `UiNavbar.vue` | Optional brand, default and actions slots; standard attributes | Standard navigation-root listeners | Named navigation, ordered always-visible wrapping content, default bar presentation; `navbar.v1` |
| `UiForm.vue` | `binding: UiFormViewBinding`; default content slot | `submit()` and `reset()` events; `UiFormViewHandle` | Form semantics, suppress competing validation, focus invalid target or named form |
| `UiField.vue` | `binding: UiFieldViewBinding`; editing-content slot | None | Label/control/group relationships and help/issue presentation |
| `UiTextInput.vue` | `UiTextInputViewProps`; no slot | `update(value: string)`, `blur()`; `UiFocusHandle` | Text edit target, uncoerced input, accessible associations, focus, disabled handling |
| `UiRadioGroup.vue` / `UiCheckboxGroup.vue` / `UiSegmentedSelect.vue` | `UiChoiceGroupViewProps`; no slots | `choose(key: string)`, `blur()`; `UiFocusHandle` | Field-owned selection, retained values, source states and group interaction |
| `UiCheckbox.vue` | `UiCheckboxViewProps`; no slot | `update(value: boolean)`; `UiFocusHandle` | Boolean selection, keyboard operation, naming/feedback |
| `UiMenu.vue` | `binding: UiMenuViewBinding`; entry/icon/host slots | `open`, `close`, `activate`, `expand`, `retry` | Command menu and popup/context presentation |
| `UiNavMenu.vue` | `binding: UiNavMenuViewBinding`; entry/icon slots | `activate`, `expand`, `retry` | Navigation links/disclosures |
| `UiSelect.vue` | `UiSelectViewProps`; no slot | `update(value: string)`, `blur()`, `requestLoad()`; `UiFocusHandle` | Single choice, names/values, keyboard operation, naming/feedback |
| `UiButton.vue` | `UiButtonViewProps`; content slot | Standard target listeners; `UiFocusHandle` | Correct action/submit/reset type, loading/disabled OR rule and keyboard semantics |
| `UiRegionLayout.vue` | binding: UiRegionLayoutViewBinding; named region slots | None | Bounded vertical scroll grouping, retained supporting regions, overflow escape |
| `UiLayout.vue` | `binding: UiLayoutViewBinding`; keyed child slots | None | Allocate space in source order, preserve children, provide named focusable scrollports |

Vue's declared custom events must not accidentally fall through and fire twice on a native root. Backend events report interactions; core decides state transitions. Do not hold a competing form model. Backend views may coordinate presentation privately, for example to arrange a checkbox and its field label while keeping group headings separate. Registration cleanup belongs to the view lifecycle and must not reset control state. Transient widget state necessary to operate a toolkit may stay inside the backend, but must track the supplied control bindings and must not own business lifecycle decisions.


## Acceptance and limits

Use the same business scenario and behavior tests against each separately assembled backend. Verify keyboard/focus, labels/descriptions, groups, pending/disabled state, and feedback in a browser as well as control/DOM tests. Backend-specific visual checks may supplement these rules; declarations are not conformance evidence.

Backends may use native controls or composite toolkit controls. Each backend owns its DOM structure and fulfills the shared binding contracts. Full generalized strategy negotiation, runtime backend switching, business-facing portal APIs and rich inputs are not implemented. Toolkit backends may internally teleport picker surfaces while preserving the shared associations and lifecycle. The selected build must not include unselected backend styles or view implementations.

Ordinary UiRegionLayout arrangements compose the existing UiLayout view. Grouped scrolling uses the dedicated UiRegionLayout backend view. Each named region becomes one keyed allocation, possibly containing multiple root nodes. The shared linear/reactive/division/scroll contracts apply; see [UiRegionLayout](../components/UiRegionLayout.md).

UiFlowLayout also composes the existing UiLayout view, fixing division to content. The resolved binding includes `align: 'start' | 'center' | 'end' | 'stretch' | 'baseline'`. `layout.align.v1` requires alignment of allocations across the arrangement axis (within each row for wrapping), honoring logical horizontal edges under RTL. Content division packs items at the arrangement start; proportional division remains governed by its shares. Child components retain their own sizing contracts inside their allocations. `layout.baseline.v1` additionally requires horizontal first-baseline alignment with independent wrapped rows. Preserve baseline propagation through allocation wrappers and built-in field/form/input-frame/button compositions. Leading decorations must not replace the editable/caption reference; native fallback applies to arbitrary opaque/text-free content. Above labels contribute their first label row; integrated/hidden labels contribute editor text. Backend-owned CSS coordinates actual parts without descendant searches or measured offsets. UiRegionLayout excludes baseline alignment from its props and rejects it at runtime. No separate backend flow module is required. See [UiFlowLayout](../components/UiFlowLayout.md).


### UiBackendIntegration

Export a default integration object from `./integration` with `locales: UiLocaleSource<unknown>`, `initialLocale` (the initial English native resource), `icons: UiIconCatalogue`, and `create({ i18n, nativeLocale, ssr })`. The factory returns an optional native Vue `plugin`, optional renderless/context `Root` component, and optional `dispose(): void` hook for native resources. The `ssr` boolean is true for both server rendering and client hydration, allowing native services to enable their SSR mode. Native ID generators must be per application/request, use the Vue application ID namespace, and produce matching server/client identifiers. Native services and contexts are created per application; native locale resources are prepared before `nativeLocale` and the active i18n snapshot update. Native providers use the live ref, preserve slots and control identity, and must not add styling/layout boundaries. Native resource cleanup runs once on app unmount or pre-mount `app.ui.dispose()`, and after a later setup failure. Cleanup attempts all registered releases even if one throws; factories must release their own partial allocations if `create` itself throws. Resource maps include declared aliases; `backend` integration overrides are assembly-owned and must match the statically selected view modules. Do not register every toolkit component globally.


## Browser testing integration

A backend supplies a separate `./testing` export for the **component testing adapter contract** in `@uninterface/testing` (`docs/adapter-contract.md`). This export stays outside production imports. It maps actual rendered select/checkbox parts and does not replace shared acceptance requirements.

For mounted DOM select tests, supply `uiDomTestAdapter` from `./testing/dom`.
The mapping resolves the rendered selection and owned popup. See the DOM
select section of the same adapter contract.

