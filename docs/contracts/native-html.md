# Native HTML content

Backends declare `native.content.v1` for this stylesheet contract; see the [usage guide](../guides/native-html.md) for current limits.

## Meaning and supported set

The [canonical element table](../guides/native-html.md#baseline-elements) is the native set business authors may assume after supported backend setup. It includes text nodes/interpolations and semantic HTML content. It does not require new Vue exports for text or headings. Backends fulfill this set through their ordinary stylesheet and document integration.

The same guide defines exclusions: prefer UiKeyValueList/Item for name–value and term–description content; quotation presentation belongs to corresponding future components. Native structural containers retain their HTML semantics without acquiring layout or frame guarantees. Images, static tables and native interactive controls have no additional presentation guarantees under this capability.

## Obligations

- Business authors supply meaningful content, localization, heading ranks, destinations and semantic attributes. Native time/data elements do not perform business formatting. HTML content models and accessibility obligations still apply.
- Application assembly loads one backend’s required styles and theme setup. It may require `native.content.v1` through the existing capability mechanism; no per-element registration, CSS class or strategy is needed.
- Backends provide readable default typography, prose separation, list markers, link presentation/focus, annotations and technical text. They preserve HTML meaning, native keyboard behavior, language and direction. Exact typography and colors remain theme-owned.
- Bare preformatted content preserves spaces and explicit line breaks while long lines wrap within the available width. An unwrapped source viewer is a separate scrolling composition.
- Native `output` represents a calculation or action result. Authors own the result and its context; backends preserve inherited readable typography and native result/status semantics without requiring special decoration. This capability adds no calculation, validation or submission behavior.
- Ordinary prose owns its margins within a content group. When one classless native block is the sole root of an ordinary UiLayout/UiFlowLayout allocation, layout gap owns peer separation and the block’s outer block margins are zero. Nested prose, content insets and named framed regions retain their respective responsibilities.
- Styles apply at document scope without a provider or generic marker gate. Baseline rules must preserve explicit component styling and toolkit component/utility precedence; they do not create a second state owner or style all native controls.

## Acceptance

Use the [observable checks](../guides/native-html.md#observable-acceptance) and the native-content showcase to verify the full set. Build checks establish that public style imports include the baseline. DOM checks establish semantic markup, attributes, locale updates and retained content. Real-browser checks establish geometry, wrapping, list markers, visible emphasis/focus, and light/dark/RTL presentation inside and outside Uninterface surfaces.

Capability declarations are support commitments, not test results. Document backend-specific mappings and verification limits in each backend package. Preserve the established accessibility testing policy; this content capability does not itself establish WCAG conformance.
