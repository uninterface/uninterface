# Native HTML content baseline


Business authors can express ordinary content directly with semantic HTML. The table below is the native set business authors may safely assume when using a backend declaring `native.content.v1`, with its documented application setup and stylesheet loaded. These elements receive default presentation without application classes or CSS. It does not require a text component or an all-Uninterface component tree.

## Setup

Complete the selected backend’s setup, including `@uninterface/backend/style.css`. Font selection follows the [typography guide](typography.md); it does not enable or disable this baseline. No additional content stylesheet, wrapper or strategy is required.

For an application depending on this set, include `native.content.v1` in the `requires` passed to [createUiApplication](../api/functions/createUiApplication.md). This checks backend support once during assembly; individual native elements need no Uninterface import. The capability is a declared contract, not runtime detection of missing CSS. Exact browser verification remains documented separately.

## Baseline elements

| Purpose | Elements | Default guarantee |
|---|---|---|
| Ordinary text | Text nodes, Vue interpolations, `span` | Inherit surrounding typography and foreground color |
| Headings | `h1`–`h6` | Recognizable heading hierarchy and appropriate spacing |
| Paragraphs | `p` | Readable prose and paragraph separation |
| Importance and emphasis | `strong`, `em` | Distinct treatment preserving their respective meanings |
| Secondary remarks | `small` | Readable side comments, qualifications and legal wording |
| Links | `a` with `href` | Recognizable links, native keyboard operation and visible focus |
| Lists | `ul`, `ol`, `li` | Visible markers, nesting and readable separation |
| Technical text | `code`, `pre`, `kbd`, `samp` | Appropriate monospace treatment; `pre` preserves spaces and line breaks, with long lines wrapping to fit |
| Text annotations | `mark`, `del`, `ins`, `sub`, `sup` | Highlighting, edits and scientific notation |
| Meaningful breaks | `br`, `wbr`, `hr` | Line breaks, optional break opportunities and thematic separation |
| Language and direction | `bdi`, `bdo`; `lang` and `dir` attributes | Mixed-language and bidirectional content |
| Machine-readable meaning | `time`, `data`, `abbr` | Preserve native semantics without requiring special visual treatment |
| Calculation or action results | `output` | Readable inherited typography and native result/status semantics; no special decoration required |

Text includes bare text and `{{ value }}`; there is no general-purpose HTML `text` element. Use heading ranks according to document structure, including ranks four through six when needed. Rank is not a font-size selector.

## Component-owned content

Prefer [UiKeyValueList](../api/components/UiKeyValueList.md) and [UiKeyValueItem](../api/components/UiKeyValueItem.md) for name–value and term–description content. Raw `dl`, `dt` and `dd` are outside this native presentation baseline. Backends may use these elements to implement the components; this boundary is an authoring preference, not a prohibition on native markup. See [feedback and record details](feedback-and-details.md) for implemented usage.

Quotation presentation belongs in corresponding Uninterface components to be created. Raw `blockquote`, `q` and `cite` are outside this baseline. Component naming, block versus inline composition, attribution/source representation and presentation guarantees still need definition. No quotation component API or implementation is established here.

These boundaries let Uninterface own the arrangement and presentation of compound content while keeping ordinary prose directly authorable in HTML.

## Ownership and use

Business authors own content, localization, meaningful heading ranks, list structure, destinations and appropriate semantic attributes. Use `br` for a meaningful line break, not repeated spacing. Supply already formatted display text for dates and values; `time` and `data` do not perform formatting. An abbreviation's essential explanation must remain available to readers without depending solely on a hover tooltip.

Use `output` for the result of a calculation or user action, such as a calculated quantity or a saved result. Application code owns the calculation and displayed value; the element does not calculate, validate or submit that value. For ordinary displayed information, text or `span` remains sufficient. Supply a meaningful label or surrounding context. HTML's `for` attribute can identify contributing controls by their document-unique IDs; it does not wire up calculation logic. The element has an implicit `status` role, so updates may be announced without moving focus; actual announcements depend on browser and assistive-technology support. No redundant `role="status"`, custom live region or special decoration is required by this baseline. See the [HTML output definition](https://html.spec.whatwg.org/multipage/form-elements.html#the-output-element) and [HTML accessibility mapping](https://www.w3.org/TR/html-aam-1.0/#el-output).

Backend assembly supplies the document baseline, including typography, colors and element presentation. Exact font sizes, spacing, link treatments and annotation colors remain backend/theme-owned. Light/dark presentation, language/direction support, and usable wrapping are part of the baseline. Bare `pre` uses `white-space: pre-wrap`: authored spaces and newlines remain, while long lines wrap instead of requiring a horizontal scroll interaction. Exact unwrapped source viewers need a separately specified scrolling composition. Identical pixels across backends are not required.

Baseline support must not require a new provider, generic styling marker or mandatory `UiContent` wrapper. `UiContent` continues to own explicit insets and optional scrolling; it is not the typography owner. Element-specific styles must respect opaque components and backend control presentation. Ordinary prose owns paragraph/list/heading margins within a content group. When a single classless native block (`h1`–`h6`, `p`, `ul`, `ol`, `pre`, or `hr`) is the sole root of an ordinary `UiLayout`/`UiFlowLayout` item, the layout owns peer separation and that block’s outer block margins are zero. This rule does not remove margins inside a nested `section`, change explicit `UiContent` insets, or apply to named framed-region allocations. Group related prose inside a semantic container; use layout components to arrange independent groups.

This example needs no presentation classes or local CSS:

```vue
<section aria-labelledby="review-heading">
  <h2 id="review-heading">Review the invoice</h2>
  <p>Check the <strong>amount and due date</strong> before approval.</p>
  <ul>
    <li>Verify the supplier.</li>
    <li>Read the <a href="/approval-policy">approval policy</a>.</li>
  </ul>
</section>
```

Use document-unique IDs and localize the content in an actual application. The structural `section` above preserves native meaning; it does not request a card, inset or layout treatment.

## Mixed-direction technical content

Content authors know which text is a date, reference or complete formula. Keep localized prose in the surrounding language's direction, and tightly wrap a known LTR expression with `dir="ltr"`. An existing element such as `del`, `ins` or `data` can own that boundary; a phrase spanning `sup`, `sub`, `kbd` or `output` needs a common inline boundary. These semantic elements do not establish direction by themselves. Backends preserve the supplied direction and own typography; they cannot infer which arbitrary business text should read LTR.

```html
<p dir="rtl">
  تاريخ التسليم المحدّث:
  <del dir="ltr">2026-10-20</del> <ins dir="ltr">2026-10-21</ins>
</p>
<p dir="rtl">أبعاد العبوة: <span dir="ltr">2 m<sup>2</sup>; H<sub>2</sub>O</span></p>
```

Each date retains its internal year-month-day order while the two values follow the surrounding sentence direction. Keep real separation between revisions and no unintended spaces inside a formula or around `wbr` break opportunities. Template compilers and formatters can remove or introduce whitespace: verify rendered text rather than relying on source indentation. In Vue, an explicit `{{ ' ' }}` between adjacent revision elements preserves a separator; keep whitespace-sensitive formula markup intact when formatting.

Use `bdi`/`dir="auto"` for inserted content whose direction is unknown. Use explicit LTR for known numeric ISO dates, which have no strong letter for automatic direction detection. Localized Arabic dates and sentences should retain their natural direction; do not force every `time`, `samp`, `code` or paragraph LTR globally. `bdo` deliberately overrides character order and is inappropriate for ordinary formula isolation. See [W3C inline bidi guidance](https://www.w3.org/International/articles/inline-bidi-markup/index.en.html).

Verify Arabic and LTR contexts at ordinary and narrow widths: dates remain separate with intact internal order, leading quantities stay with their units, subscripts/superscripts remain attached, equations retain their authored sequence, and long references wrap without changing their text. Exact text and semantic-boundary checks complement browser checks of physical ordering and wrapping.

## Adjacent scope

Ordinary structural containers (`div`, `main`, `section`, `article`, `header`, `footer`, `nav`, `aside`) remain available with native semantics and no implied layout or surface treatment.

A static landmark used as a navigation focus destination can explicitly use [uninterface-navigation-focus-target](../api/styling-classes/uninterface-navigation-focus-target.md). This core styling utility preserves focus without an enclosing outline; it is separate from the native-content baseline and must not be applied to operational scroll regions or controls.

Images/figures and static tables remain candidates for additional baseline guarantees; their sizing and narrow-screen overflow policies are not settled here. Native interactive elements remain permitted through appropriate integration boundaries, but this content baseline does not confer Uninterface control, form, disclosure or dialog behavior on them.

## Observable acceptance

Backend acceptance must verify a representative content fixture with nested headings/lists, paragraphs, annotations, links, technical text and mixed-language values:

- Defaults remain readable and meaningfully differentiated without author CSS or toolkit classes, including under toolkit resets.
- Links work by keyboard and show focus; semantic elements and supplied attributes survive composition.
- Long prose and preformatted lines wrap at narrow widths and zoom, without accidental clipping.
- Light/dark modes and LTR/RTL content retain legible foregrounds, markers, annotations and ordering.
- Content inside cards, modal bodies and layouts retains the intended typography, without compounded prose/layout spacing or interference with controls.

DOM checks establish semantics; real-browser inspection establishes wrapping, spacing and focus paint. Existing backend accessibility audit policies still apply; this baseline does not itself claim WCAG conformance. Implementation and verification results must be recorded separately from this agreed scope.
