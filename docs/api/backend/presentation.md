# Presentation and accessibility

[Backend reference](README.md) · [API reference](../README.md)

Shared styling, native integration, hidden content containment, typography and native HTML.

## Input-styled control agreement

For components declaring this style, implement the [input-styled control contract](../../contracts/input-styled-controls.md): logical-start placement and normal filling of the field allocation, one coherent native-themed input surface, meaningful visible focus across participating parts/actions, and a single-row default with documented multiline/wrapping adaptations. Keep field-label arrangement with UiField/form strategies. Backends own padding, dimensions, typography and state treatments; consumers must not supply compensating CSS.

UiInputFrame is the shared-frame building block for compositions that act as one input-styled control. An admitted single-line UiTextInput delegates its surface to that frame; standalone UiTextInput retains its own surface. Native input/select views may fulfill the same agreement without rendering UiInputFrame. Preserve the existing value, validation and popup contracts. Follow the contract's applicability table and browser acceptance criteria; neither an Input suffix nor input.frame.v1 alone certifies complete visual conformance.


## Component styling ownership

Component presentation must work without a generic backend marker on itself or an ancestor. Do not introduce `ui-*` classes as Uninterface-authored styling hooks or replace a generic marker with an equivalent renamed scope. Backend-private selectors must identify a concrete component, part or state; their rules belong to that rendered element. Upstream toolkit classes and CSS custom properties retain their toolkit-defined meanings.

Backend assembly supplies the documented document baseline expected by its toolkit, including typography for native content and teleported surfaces. UiApp owns the application frame and surface; it normally inherits that baseline rather than acting as the document. Application setup supplies logical context; native toolkit context bridges preserve content without an invented styling boundary. Component state rules such as disabled, invalid and focus styling target the backend's own controls rather than all matching descendants. Mixed native HTML and third-party components retain their own semantics and component-specific presentation. Documented global baseline effects are intentional and apply without UiApp. A document baseline is not a generic ancestor styling gate.

A toolkit theme class or context requirement must be justified by actual integration behavior and documented with its scope and effects. Convenience, backend identification and arbitrary CSS isolation do not justify a generic styling boundary. Components that render elsewhere, such as teleported popups, must carry the styling and toolkit context they actually require.


## Native feature translation

Apply the [control presentation principles](../../guides/design-principles.md): controls normally present one coherent rectangular region and retain their dimensions through ordinary state changes. Intentional changes such as UiCollapsible expansion follow their component contract. Prefer compatible native support; when adaptation is necessary, preserve the backend's consistent look and feel while fulfilling Uninterface semantics. Record gaps and browser evidence rather than treating native behavior as an automatic exception.

Start with the toolkit's supported feature and composition, including its setup requirements. Translate Uninterface state and interactions through supported props, events, slots and methods before implementing a replacement. Core ownership of values, validation, source requests and lifecycle decisions does not prohibit toolkit focus, keyboard navigation, transitions or synchronized presentation state. Use one owner for each interaction; do not layer competing native and custom keyboard/focus engines.

Backend views may coordinate privately to realize combinations such as form/field/checkbox. A static per-component module interface does not prescribe an isolated DOM wrapper for each component. Retain custom behavior only for a documented semantic or integration gap, and verify that gap with an acceptance scenario. Native toolkit reference examples must include their complete document/configuration setup.


### Visually hidden accessibility content

Backend-generated announcements, hidden labels, required descriptions and accessible error text must not change visible layout or extend a scrollable area. Business authors supply the semantic inputs; the backend owns hiding and containment. See the [accessibility contract](../../contracts/accessibility.md).

For absolutely positioned helpers, establish a containing block within the owning component or a required backend composition, and explicitly anchor the helper inside it. A visually-hidden utility supplies visual suppression, not proof of positioning containment. A positioned sibling does not contain the helper. Prefer an existing suitable element; a private wrapper is appropriate only when it preserves native integration, attributes, events and focus. Do not rely on an incidental application card, positioned page or document overflow restriction.

The current adapters use their required UiField view as the positioning boundary for editor helpers, with local field-editor hosts for tooltip descriptions. Core requires editors to be placed inside UiField. Button announcements retain their private button hosts. Backend views assembled directly must retain these required compositions. These are private implementations, not prescribed DOM structures or public CSS hooks. 

Clip the hidden helper itself, preserving visible focus and popup behavior around it. Retain IDs, label/description associations and announcement lifecycle; do not substitute `display: none`, `hidden` or `aria-hidden` for text that must remain available to assistive technology. Focusable content revealed on focus needs a separate pattern. Reuse a backend-local helper or styling convention where useful without broad overrides of unrelated native utility classes.

Verify components near the end of a long, otherwise unpositioned bounded scrollport, without protective card wrappers or document overflow locks. Exercise empty/populated announcements, hidden labels, required groups, validation and recovery at narrow/wide widths and in LTR/RTL. Check document and inner scroll extents, footer reachability, wheel scrolling, names/descriptions and keyboard focus. Browser measurements establish geometry; DOM checks establish wiring, and assistive-technology checks establish announcement behavior. Record each separately. These functional checks apply to all backends independently of backend/application automated WCAG audit policy.


## Public styling classes

Uninterface core supplies backend-independent [public styling classes](../styling-classes/README.md) through `@uninterface/uninterface/style.css`. Application assembly explicitly imports that stylesheet when using these utilities, alongside the selected backend stylesheet.

Core owns the rule and capability for [uninterface-body-margin0](../styling-classes/uninterface-body-margin0.md). Backends must not duplicate or redefine it, attach additional behavior to the class, or require a provider or toolkit initialization for it. Toolkit-specific component presentation remains backend-owned.

Core also supplies [uninterface-navigation-focus-target](../styling-classes/uninterface-navigation-focus-target.md), declared by `style.navigation-focus-target.v1`. Business code explicitly marks static navigation destinations; a component owning such a destination can mark it internally. Preserve the focused destination without an enclosing outline, and do not replace the suppressed outline with a focus shadow. The shared rule lives in the core stylesheet, not duplicated backend CSS. Do not infer suppression for all main landmarks or negative-tabindex elements. Do not apply the class to keyboard-operated scrollports or controls. Keep backend-specific operational focus indicators, including those on interactive descendants, visible in ordinary and forced-colors modes. Verify the compiled core/backend styles together: retained destination focus, no enclosing outline, normal next-Tab behavior, and visible focus/keyboard scrolling on the separate scroll region.

Document toolkit-wide stylesheet effects separately; a toolkit's own body reset may apply even without this class. Core styling utilities do not establish a universal reset, nor do they replace the backend stylesheet.

Core supplies [uninterface-fill-height](../styling-classes/uninterface-fill-height.md) and [uninterface-fill-width](../styling-classes/uninterface-fill-width.md) for native wrappers that carry an existing layout allocation. Keep sizing, overflow and box-model rules scoped to the relevant backend-owned surfaces. The utilities are supplied through the core stylesheet and work without toolkit setup.

Core-owned layouts need no matching backend view: UiFlowLayout composes UiLayout, while UiGridLayout implements shared grid geometry and consumes only the backend spacing policy.


## Shared theme-color declarations

Theme authoring uses [uiTheme.colors.define](../constants/uiTheme.md) from `@uninterface/uninterface/theme`. The backend entry exports [assertUiCapabilities](../functions/assertUiCapabilities.md) for arbitrary candidate checks and [uiCoreCapabilities](../constants/uiCoreCapabilities.md) for core declarations. Descriptors carry extension definitions under themeColors; `theme.colors.v1` guarantees the six defaults and `theme.color.<name>.v1` declares an extension across all implemented themed components. `button.color.v1` consumes the palette rather than defining it. See the [theme-color guide](../../guides/theme-colors.md) for typed registration, manifest matching and obligations.


### UiIconViewProps

`tone?: UiThemeColor`. The default slot is resolved noninteractive artwork; forwarded role/aria-label/aria-hidden and attributes apply to the icon surface. Supply 1em square occupancy by default and native themed foreground for an explicit tone; omitted tone inherits. Preserve artwork proportions and let the parent own spacing. Core resolves catalogue names, authored variants and mirroring. Export `UiIcon.vue` and declare `icon.catalogue.v1`. Catalogue mappings must follow the [backend artwork selection principles](../../contracts/icon.md#backend-artwork-selection): use suitable native-set artwork first, adapt only when needed, and document provenance and exceptions.

Declare `icon.size.v1` when the icon view and button view support explicit sizing. Core validates the request and forwards square dimensions as style attributes with the internal marker `data-ui-icon-sized`. Apply the attributes to the icon surface, preserve the dimensions, and allow the artwork to fill the box proportionally. Keep the sizing marker available to the parent presentation.


### UiBackendColorMode

Native document selector descriptor exported as optional `UiBackendIntegration.colorMode`: `{ attribute: string; light: string; dark: string; default?: 'light' | 'dark' | 'system' }`. With `attribute: 'class'`, light/dark are distinct single class tokens; otherwise they are attribute values. Optional `default` describes a host without either selector; omitted means light. System observes the host document’s media preference without writing a selector. Explicit light/dark selectors take precedence over that default. The shared controller owns selection, system/storage policy, host observation and cleanup. Backends supply the native selector, native theme styles and `theme.color-mode.v1`; do not create a competing preference controller. Missing integration rejects explicit mode configuration.

Document selectors must cover teleported content. An integration may return `dispose(): void` from `create` to release native services. Setup calls it once on teardown, including `app.ui.dispose()` before mounting, and rolls it back if subsequent setup fails. Native context wrappers can consume `useUiColorMode()` to synchronize their toolkit service, but must not start another preference owner. They must preserve the resolved document mode and avoid default resets. See [color-mode ownership and verification](../../guides/color-mode.md). Uninterface never turns this selector into a public business-side CSS class API.


## Typography delivery

The four font choices are backend or Uninterface default, each with Network or Bundled delivery. Applications import one font.css/font-bundled.css entry from @uninterface/backend or the optional @uninterface/fonts package first, then always import @uninterface/backend/style.css. Backends do not depend on the shared font package. Font entries own --uninterface-font-set-family at document and language boundaries and supply font declarations. The stable backend stylesheet consumes that selection through native tokens, honoring application --uninterface-font-family first and falling back to system-ui, sans-serif when no set is selected. It must not overwrite the set or import font assets. Keep semantic monospace content intact. Network declarations must precede style rules in composed CSS; validate both JavaScript and CSS import forms. Document setup, CSP, local deployment, licenses and actual loaded-face verification. See the [typography guide](../../guides/typography.md).


## Native HTML content baseline

`native.content.v1` declares the complete [native HTML contract](../../contracts/native-html.md) and the canonical [business-author element table](../../guides/native-html.md#baseline-elements). Ship these defaults through the ordinary `./style.css` entry. Backends supply the document baseline without requiring a provider, generic marker class, prose wrapper or additional business import. Retain toolkit defaults where they fulfill the contract; repair reset gaps using native theme values and preserve component/utility overrides. Document native mappings and limits in the backend package.

Support includes prose rhythm, list markers, links and visible keyboard focus, text annotations, technical text with wrapping, light/dark inheritance and language/direction semantics. Respect the specified layout-versus-prose spacing ownership. Every advertised element must be exercised in the shared content fixture. Build and DOM evidence does not establish visual acceptance; record browser verification separately.


## Text-source resolution

Business definition inputs may use [UiTextSource](../types/UiTextSource.md). Core resolves them in reactive presentation before forwarding labels, descriptions, shortcut hints, feedback content, table labels and resize names. Backend text bindings remain strings: do not invoke callbacks, stringify functions, translate business content again or own its loading. Menu entry/icon and notice feedback slots receive resolved text. Verify a locale change updates visible and accessible text without replacing controls, row drafts or action nodes; retain focus and native interaction behavior. See the [authoring guide](../../guides/text-sources.md).

