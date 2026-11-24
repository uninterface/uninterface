# Application development SOP

[Agent guide and index](README.md)

Use this procedure when an agent creates or changes an application using
Uninterface. Its output is a working business composition and evidence that
the requested workflow is fulfilled. Detailed API signatures remain in the
[API reference](../api/README.md).

## 1. Define the task and ownership

Identify the data being viewed or edited, actions and outcomes, domain rules,
failure behavior and required accessibility. Keep changes tied to that task;
do not add decorative treatments or extra workflows merely to fill space.

Write down the owners of these concerns before implementing a stateful flow:

| Concern | Owner |
| --- | --- |
| Domain data, authorization, business validation rules and persistence | Application or business component |
| Drafts, validation execution, submission and source-loading state | The applicable Uninterface control |
| Control creation, retention, reset policy and disposal | The business composition that owns the session |
| Layout intent, labels and action meaning | Business composition |
| Concrete markup, spacing, visual feedback and focus mechanics | Backend |
| Backend installation and supported environment configuration | Application assembly |

A reusable editor normally accepts typed data and a persistence operation;
it encapsulates fields, codecs and workflow wiring. Lift its control outside
the component only when retention or coordination requires it. A new model
object, hidden view or responsive transition is not implicit permission to
discard a draft. See [business components](../guides/business-components.md).

## 2. Check the actual supported surface

- Read [getting started](../getting-started.md), the selected backend's setup
  guide and the references for the required components and controls.
- Use public package entry points. Business components normally import from
  `@uninterface/uninterface`; assembly imports backend styles and required setup/build
  hooks. Do not depend on private core or backend source paths.
- Declare required capabilities, including requirements in responsive or
  conditional branches. Check support rather than assuming that a TypeScript
  name or installed package proves compatibility.
- Use [getUiRuntime](../api/functions/getUiRuntime.md) for supported runtime
  inspection; it does not provide a general mutable configuration service.
- Follow the current [application setup](../api/functions/createUiApplication.md) contract
  where message context is required. Do not give it styling, control ownership
  or runtime backend-switching responsibilities.

The [implementation summary](../api/README.md) distinguishes
working APIs from research. In particular, additional locale packs require native mapping and acceptance, color-mode support requires the backend capability and explicit application ownership or host inheritance, and
strategy use must follow the implemented [UiStrategy API](../api/components/UiStrategy.md) and its backend support limits.

Missing required support is an error. Report the requirement and affected
backend; do not silently substitute weaker behavior or invent a public prop.

## 3. Compose the workflow

Use the relevant guide for the task:

| Task | Required approach | Details |
| --- | --- | --- |
| Edit and save data | Keep fields/codecs inside the business composition. Supply domain rules and a save operation; let the form control coordinate validation and submission. | [Business components](../guides/business-components.md) |
| Create/edit in a modal | Use one footer for Save and Cancel, explicitly associate the footer submit button with the body form, and define save/retry/dismissal policy. Add Reset only for a business requirement. | [Form-integrated modals](../guides/form-modals.md) |
| Browse a collection | Prefer shared field/action declarations for conventional table/card presentations. Own queries and selection once; retain editor sessions outside replaceable views. | [Collection views](../guides/collection-views.md) |
| Connect submit/reset actions | Pass `control.bindings.submitButton` or `control.bindings.resetButton` intact to UiButton within its matching UiForm, or use explicit native form association for external actions. Avoid duplicate click handlers and independently maintained busy flags. | [Control bindings](../guides/control-bindings.md) |
| Validate or normalize input | Await field/form validation. Parsing and rules may be asynchronous; formatting is synchronous. Normalize through the documented parse-and-format flow, without an invented codec method. | [Validation](../guides/validation.md) |
| Arrange content | Use UiLayout, UiFlowLayout or UiRegionLayout for supported arrangements; UiContent owns content insets. State the scroll owner and provide the required accessible name. | [Application layouts](../guides/application-layouts.md) |
| Adapt to environment | Observe responsive context and derive layout props. Keep detection and breakpoint mechanics outside business compositions. Preserve control state when presentation changes. | [Responsive layouts](../guides/responsive-layouts.md) |
| Choose or navigate entries | Keep entry-source, selection, current navigation and popup state distinct. Use the documented async state and model-value behavior; application routing remains application-owned. | [Menus and choices](../guides/menus-and-choices.md) |
| Express color meaning | Use supported semantic roles. Theme color and button treatment are separate; exact colors remain with the theme. | [Theme colors](../guides/theme-colors.md) |

Native HTML and other Vue components remain appropriate for ordinary content
and specialized concerns. Document how a custom editor participates in field
state and accessibility; do not install a second validation or submission
owner. Application-specific branding may own its design, including readable
light/dark treatments, without dictating shared component presentation.

## 4. Resolve gaps at their owning layer

Before adding CSS, a wrapper, a watcher or another state variable, establish
which documented requirement it serves:

- A missing business rule belongs to the business composition.
- Repeated control-flow logic may indicate a missing control or binding.
- A widget displaying existing state incorrectly is a backend integration
  problem. Inspect native facilities before adding a business-side patch.
- A recurring semantic requirement outside the implemented surface needs a
  contract proposal and explicit support, not an undocumented abstraction.
- Bespoke visual identity can remain in a custom component. This does not
  justify restyling Uninterface controls through descendant selectors.

Use supported defaults unless the task requires a documented choice. Do not
add backend-specific branches or toolkit classes to a portable business
composition to make one adapter pass. If a temporary workaround is necessary,
state its scope and limitation explicitly rather than claiming portability.

## 5. Verify and report

Write meaningful acceptance cases from the task and applicable contracts,
before implementation whenever possible. Do not generate tests that merely
repeat markup choices, and do not assume the entire framework suite must run
for a documentation-only edit.

- [ ] The consumer can use the composition through its documented typed inputs
  and operations, without reconstructing private field wiring.
- [ ] Happy path, invalid input, asynchronous failure and relevant recovery
  paths work through the actual composition.
- [ ] Submit validates once through the supported form flow; pending work
  cannot produce duplicate persistence through buttons or implicit submission.
- [ ] Reset, prop updates, navigation and disposal follow the declared session
  policy; late results cannot corrupt a replacement session.
- [ ] Keyboard operation, label/feedback associations and visible focus work.
- [ ] Applicable responsive transitions preserve drafts, selection and focus;
  browser checks verify actual scrolling and allocation.
- [ ] Required capabilities are checked and unsupported requirements remain
  visible errors. Conditional paths have been exercised.
- [ ] Required locale/theme behavior is verified to the extent supported, with
  unsupported behavior reported explicitly rather than inferred from CSS.
- [ ] Documentation covers inputs, outputs, units, ownership, lifetime,
  failure behavior and supported usage without prescribing backend CSS.

Use the [test-kit contract](../contracts/test-kit.md) and
[application testing guide](../guides/testing.md) to select assertions.
Run them through your project’s configured test commands; core does not
install a test runner or application fixtures.

Report the behavior changed, why it belongs at that layer, checks performed,
and remaining limitations. Separate automated results from browser/manual
observations. A blocked check remains unverified.

For author-supplied native links and custom focus targets, use [reusable focus presentation](../guides/focus-presentation.md). Keep focusability and interaction with their semantic owner; do not introduce container-specific CSS or backend classes merely to draw a focus indicator. Existing controls and contextual menu bindings already own their focus presentation.
