# Test business workflows

Use `@uninterface/testing/playwright` for backend-independent select and checkbox operations. Configure the backend's testing adapter once in your Playwright fixture, then identify controls by their accessible names or application test IDs. Ordinary Playwright locators remain appropriate for native HTML, business output, buttons and other components.

See the **testing package setup and example** in `@uninterface/testing` (`README.md`) and its **per-export reference** in `@uninterface/testing` (`docs/api/README.md`).

## Configure the fixture

First configure Playwright with a running application and `use.baseURL`. In the test process, resolve `@uninterface/testing`, its Playwright peer dependency, and the same `@uninterface/backend` alias used by the application.

```ts
// fixtures.ts
import { test as base } from '@playwright/test'
import { createUiTest, type UiTest } from '@uninterface/testing/playwright'
import { uiTestAdapter } from '@uninterface/backend/testing'

export const test = base.extend<{ ui: UiTest }>({
  ui: async ({ page }, use) => {
    await use(createUiTest(page, uiTestAdapter))
  },
})
```

In a business test, import `test` from this fixture and interact with a rendered field through `await ui.select({ name: 'Category' }).choose({ key: 'services' })`. Supply your application’s route, fixture data and saved-result assertion; the harness does not supply a demo server or business data.

## Interaction and ownership

`{ name }` discovers the semantic control by role and accessible name. Prefer it over a broad `getByLabel(...)` locator: label-text matching can include decorative annotations, and an overlay may share the control's accessible label. An explicit locator must identify only the semantic editor throughout the operation. Application test IDs are another option for repeated or translated compositions.

Business tests own fixture data, network stubs, operations and outcome assertions. They should not expose editing controls outside a reusable business component merely to drive tests. `choose({ key })` selects a semantic entry key without requiring its translated label; verify the submitted or saved business value independently. `within(scope)` disambiguates repeated business compositions, including widgets whose popups teleport outside that scope.

Backend authors own mappings to actual pointer targets and popup surfaces. Shared conformance tests use the same harness, with additional keyboard, focus, presentation and accessibility checks. Backend-specific suites verify native integration without relaxing shared rules. See the **mapping contract** in `@uninterface/testing` (`docs/adapter-contract.md`) and [compatibility test-kit contract](../contracts/test-kit.md).

The package supports single/multiple selection, radio/checkbox groups and binary/tristate checkboxes. Multiple-selection actions and assertions close composite popups after use; open/candidates deliberately leave them open for inspection. Keys identify choices independently of localized labels. `await ui.field(editor)` additionally maps a single editor's active label, label pointer target, control surface and required decorations. The backend supplies actual parts; shared tests retain actions and assertions. A label with pointer events disabled can pass clicks through to its native field; the painted label and its pointer receiver remain separate mappings. Re-resolve those parts after strategy changes and wait for native transitions before measuring geometry or colors. See `UiFieldTestParts` in the testing package API. Native selection uses Playwright's select API; native OS popup visuals are outside that API's evidence. Composite actions use normal click actionability. Neither action path bypasses disabled controls or calls model setters. Loading/error observation separates source state from validation and retains native wording. Business outcome assertions remain essential: a visible label alone cannot prove the saved key when labels repeat.

Use `clickUiFieldLabel(await ui.field(editor))` from
`@uninterface/testing/playwright` to activate a visible label at its rendered
position. Assert the resulting focus and editor value. For a segmented editor,
pass its named radio-group locator to `ui.field()` and verify focus on the
intended option independently of the selection.

The package does not introduce a universal accessibility acceptance policy or automatically accept any contrast findings. Applications choose and enforce their own policy.

`await ui.modal(dialog)` maps a rendered `UiModal` to its body and actions
locators. The actions locator covers either the `#actions` slot or the
custom `#footer` slot and remains empty when the modal has no footer.
Use the mapped regions to verify that a named action stays outside the
scrolling body, submits the intended form, and produces the expected business
result.

## Application tests and backend conformance

Application tests assert business outcomes. Backend conformance tests verify shared component rules and may add native integration checks supplied by the backend package. Both can use the same component harness, but application tests do not inherit backend-specific acceptance exceptions.

Suite registration and candidate selection belong to test orchestration, not business components. For backend mapping and suite metadata, see [backend testing integration](../api/backend/assembly.md#browser-testing-integration). Configure suite discovery, a running application and report locations in your own test environment; core does not install these.

For navigation, `ui.navigationEntry({ name: 'Editor', kind: 'submenu' })` discovers the submenu trigger, and `ui.navigationEntry({ name: 'General', kind: 'destination' })` discovers an href destination. Use ordinary Playwright clicks after opening the parent and assert URL/history or business outcomes. The backend owns button/link/menuitem differences; shared scenarios need no backend-name branch. `within()` uses DOM scope; teleported branches require their own popup scope or unique names in page scope. This is entry discovery, not a generalized menu traversal or keyboard-testing engine.

Choice groups use `ui.radioGroup({ name }).choose(key)` and `ui.checkboxGroup({ name }).setChecked(key, checked)`. `option(key)` returns the semantic target for keyboard/state assertions. Backends supply optional choice mappings; business tests never branch on toolkit DOM.

## Mounted DOM tests

Use `@uninterface/testing/dom` to interact with a mounted `UiSelect` by
business key and check its rendered label, available choices, and source
feedback. Configure the selected backend's `./testing/dom` adapter in your
fixture and supply the semantic control element. The fixture owns mounting and
flushing DOM updates. See the **DOM select testing reference** in
`@uninterface/testing` (`docs/api/dom.md`). Use Playwright to verify browser
actionability and presentation.
