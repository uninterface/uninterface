# uiCoreCapabilities

`uiCoreCapabilities` is the array of literal capability identifiers supplied by the core implementation, exported from `@uninterface/uninterface/backend` and sourced from the package's `capabilities.json`.

`table.column-binding.v1` covers the optional typed column producer, without claiming a table view. `form.save.canonical.v1` covers explicit guarded canonical model acceptance, including forwarding through UiForm.

`list.control.v1` covers the documented list source/control/binding subset: requested and accepted queries, local processing, pagination/accumulation, selection and confirmed operations. It does not declare list/table/paginator view support or a parent-form value bridge; see [list sessions](../../guides/lists.md).

The array includes field/form controls and validation, button bindings, responsive context/profiles, layout compositions, entry controls, and the public body-margin styling utility. Consult `capabilities.json` for the exact identifiers. Treat the array as read-only shared metadata. Backend rendering capabilities are declared separately.

Use it to inspect the declared core surface; use [assertUiCapabilities](../functions/assertUiCapabilities.md) to check a requirement set against core plus a selected backend. These declarations are claims to verify with acceptance tests, not evidence of accessibility or browser compatibility.

The manifest subpath `@uninterface/uninterface/capabilities.json` exposes `{ schemaVersion, name, provides, requires }` for build tools. Schema version 1 uses string arrays and literal matching; it has no range/dependency negotiation. Core's current `requires` is empty. A change to supported behavior must update documentation, manifest, and test coverage together.

The field validation capability covers asynchronous parsing, field rules/checks, pending state and stale-result protection. The form validation capability covers coordinated field/form checks and submission of the validated snapshot. Immediate-return callbacks are also supported.
