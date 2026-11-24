# Plugin contract

Conceptual scope: Two intended extension forms are defined: extensions of a specific backend and higher-level composed controls. The composition form is expected to cover more common usage. APIs, packaging, registration, and declaration schemas remain open.

## Business concept

Plugins add optional capabilities, such as specialized editors or project-specific controls, through the same business-facing language as other Uninterface components. Authors use the control's semantic contract without needing to manage its internal rendering engine or vendor-specific wiring.

## Two forms of extension

| Form | What it supplies | Dependency declaration |
|---|---|---|
| Backend extension | Additional support implemented for a particular backend | Explicitly identifies the backend it depends on, together with its provided and required capabilities |
| Higher-level composition | A control built from shared Uninterface contracts, possibly using an independent engine internally | Identifies its actual shared capability and engine dependencies; no per-backend adapter is required merely because it is a plugin |

A backend extension might add a specialized field presentation using that backend's primitives. Its declaration must make the dependency on that backend clear enough for matching and requirement checking.

A composed rich-text editor can present itself externally as an input control while using ProseMirror internally. Its external contract describes its value, editing behavior, form participation, and relevant state; the engine implements internal editing mechanics. ProseMirror is an illustrative engine, not a selected dependency.

The second form is intended to avoid requiring plugin authors to repeat the same integration for every backend. Backend independence here concerns UI backend supplies within the initial Vue compatibility scope; it does not promise cross-framework portability.

## Responsibilities and integration

- The plugin declares the capabilities it provides and the dependencies it actually needs under the [capability contract](capability.md). A backend-specific dependency must not be hidden behind a generic control name.
- An input-like plugin participates in the applicable [form contract](form.md), including value association, validation integration, naming, feedback, and editing availability. Its data representation and codec needs belong to its documented contract; rich content need not be modeled as plain text.
- Controls maintain state, views present it, and business code decides control lifetime under the [UI state contract](ui-state.md). The plugin documents how it connects its internal engine to those responsibilities.
- Relevant theme, strategy, responsiveness, dark-mode, [accessibility](accessibility.md), and [i18n](i18n.md) obligations apply to the assembled plugin. An independent engine does not automatically fulfill those obligations; shared compositions should supply reusable integration where possible.
- The plugin and its engine remain optional dependencies. The integration must preserve selective inclusion and tree shaking instead of requiring every plugin or backend to load.

Reusing a shared contract should avoid duplicating its implementation in each plugin. A composed editor can reuse field and feedback integration while supplying only the editor-specific behavior and its engine bridge. Exact integration APIs remain open.

## Capability checking

A declared backend extension used without its required backend has an unmet dependency: compilation must fail when the mismatch is detected there, and runtime detection must fail loudly. A composed control is checked against its declared capability requirements rather than being required to provide a separate implementation for each named backend.

An independent engine is not proof of universal support. A plugin may have additional requirements, which must remain explicit. This preserves accurate matching without imposing a universal backend-support matrix on every plugin author.

## Current limits and unspecified behavior

A general plugin API, registration convention and dependency-resolution protocol are not implemented. The two extension forms describe intended integration boundaries; they do not require runtime discovery, a marketplace or an adapter for every backend. Ordinary Vue composition and the documented control contracts remain available independently.

Control-frame integration is available independently of general plugin registration: [delegated control frames](../guides/control-frames.md) documents parent-owned presentation, participant focus registration and owned-popup engagement through `@uninterface/uninterface/backend`. A plugin must explicitly fulfill this contract; backend-independent editing logic alone does not suppress native toolkit highlights.
