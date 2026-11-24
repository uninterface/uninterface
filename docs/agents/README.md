# Agent development guide

Uninterface is designed for human developers and software-development agents
working from the same documented UI language. These guides give agents a
standard operating procedure for application development and a compliance
checklist for backend implementation. Human authors and reviewers can use
the same procedures.

The objective is to complete a business task using documented components,
controls and presentation defaults. Routine decisions about CSS, concrete
colors, spacing and toolkit internals belong to the implementation, so an
agent should not need to redesign each interface it builds.

## Choose a workflow

| Task | Procedure | Expected result |
| --- | --- | --- |
| Build or change a business interface | [Application development SOP](application-development.md) | A semantic Vue composition with explicit data, control and lifecycle ownership, verified against the business task. |
| Implement or review a presentation backend | [Backend compliance checklist](backend-compliance.md) | Documented feature mappings, declared support and evidence that the adapter fulfills the shared contracts using its toolkit appropriately. |
| Set up an application | [Getting started](../getting-started.md) and the selected backend's setup guide | One statically selected backend with its required styles and integration hooks. |
| Resolve an API or behavior question | [API reference](../api/README.md), [contracts](../contracts/README.md) and [usage guides](../guides/README.md) | A decision grounded in the installed API and its documented responsibilities. |

## Read before making decisions

1. Read the [project scope](../../README.md) and
   [current implementation](../api/README.md). A design
   requirement or conceptual contract does not establish an available API.
2. Read the reference for each component or export involved, the relevant
   semantic contract, and the selected backend's documented limits.
3. Follow the workflow for your role. Inspect source or official toolkit
   documentation when behavior is uncertain; do not infer implementation
   guarantees from a component name or a screenshot.
4. Verify the resulting behavior and report the scope of the evidence.

**Uninterface sets the rules; backends fulfill them.** Native toolkit features
should implement those rules wherever compatible. Neither a toolkit default
nor a current adapter shortcut is sufficient reason to change the public
meaning of an Uninterface component.

These are public product-usage procedures, not instructions for a particular
agent runtime. They complement project-specific instructions and do not
authorize unrelated changes, publication or deployment. They introduce no
additional runtime API and no separate definition of conformance: the linked
contracts and export references define the guarantees.

## Evidence and completion

Distinguish requirements, source findings, observed behavior and proposals.
Check factual premises even when a recommendation comes from a human or an
agent. Explain a gap at the layer that owns it before choosing a workaround.

A successful build establishes neither visual fidelity nor accessibility.
The [test-kit contract](../contracts/test-kit.md) requires shared scenarios
and observable acceptance criteria; browser and manual review complement
control and DOM checks. State what passed, failed, was blocked, or remains
unverified. Never mark an unexecuted check as passed.

When an API or guarantee changes, update its export reference, semantic
contract, relevant usage examples and affected checklist items together.
Keep public instructions self-contained and describe supported behavior and
limitations without relying on private development notes.
