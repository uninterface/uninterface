# Logical node contract

This contract defines node categories and concept-specific relationships. Controls maintain interaction state across views, and the business decides control lifetime. Strategies apply to their attached node and logical descendants, subject to their own limits. Renderless strategy attachment, logical role registration, scope limits and synchronous typed queries are implemented; see the [strategy contract](strategy.md). Broader relationship rules, lifecycle operations and general identification mechanisms remain open.

## Business concept

A logical node represents a component or meaningful grouping in an interface's business-level composition. Logical nodes include:

| Category | Meaning | Illustrative examples |
|---|---|---|
| Base components | The fundamental components used to describe an interface | Forms, fields, frames, layouts, containers, and controls |
| Component specializations | Components that specialize another component for a particular purpose | A money field or a named `ModalBodyLayout` |
| Business logical groups | Parts associated as a unit because of business meaning | Billing details or delivery preferences |

The examples are non-exhaustive. Logical grouping is itself sufficient to qualify as a node; it does not require a new base component type.

For example, an author can describe a “Billing details” group containing a specialized tax-identifier field and other fields. The group, the specialized field, and the other field components all qualify as logical nodes. The group's business meaning can be expressed without specifying borders, padding, or a vendor component.

## Relationships have specific meanings

Relationships between nodes are defined by the concepts involved. There is no universal meaning of “belongs to” that determines every responsibility.

Child composition commonly establishes a relationship: fields can participate in a form through being its children. Some concepts add a more specific role: content in `ModalBodyLayout` is a child assigned to its main, header, or footer slot, whose contract determines how that content is arranged.

Field meaning is independent of form participation: a field represents an editable business value and may also be used on its own. The current form API establishes participation through the explicit field-control collection passed to [createUiFormControl](../api/functions/createUiFormControl.md). Child-based association above describes a possible relationship mechanism, not automatic registration implemented by `UiField` or `UiForm` today.

Other relationships do not require child composition. A tooltip or popup can be visually anchored to another node without being its child. This visual attachment identifies its positioning reference; it does not by itself establish state ownership, form participation, or lifecycle behavior.

| Example | Meaning of the relationship |
|---|---|
| Fields within a form | Child composition can establish form participation |
| Content in `ModalBodyLayout`'s main slot | Child composition plus a named slot role with layout guarantees |
| Tooltip or popup anchored to a control | Visual attachment, without a requirement to be the control's child |

Each concept's contract must describe its relationships and their effects. The examples do not impose one parent rule or one relationship vocabulary across every component. Rules for indirect descendants, intervening groups, and explicit associations remain to be defined by the relevant contracts.

## Implementation responsibilities

The logical model must accommodate all three categories. Specializations and business groups must be representable as nodes in their own right, rather than only through the base components they contain or use.

A component or grouping's documentation must explain its business meaning and composition. Being a node alone does not specify a particular visible treatment or settle whether it owns state or creates a lifecycle boundary. An attached strategy applies to that node and its logical descendants, subject to the strategy's own scope, level limits, and reset encounters; see the [strategy contract](strategy.md).

Implementations must preserve the meaning of each declared relationship. They must not require visual attachment to imply child composition or treat slot roles as interchangeable when the layout contract distinguishes them.

## Control-owned state and presentation

The [UI state contract](ui-state.md) assigns state maintenance to controls. A list control maintains filters and selection while its view changes between a table and cards. Whether two forms editing the same record share changes is an application decision. The business also decides control lifetime: view visibility or removal does not itself determine retention, reset, or disposal.

These behaviors are defined through the control/view boundary, rather than a universal logical-node identity rule. Node identification may still be needed for implementation or item matching; it must not decide business synchronization policy.

## Decisions still open

This definition does not yet establish:

- Identification mechanisms needed by particular concepts, such as matching reordered list items.
- Detailed rules for each concept's composition, associations, and state ownership.
- Whether and how a specialization exposes its internal nodes.
- The operations and guarantees through which controls fulfill business decisions about creation, retention, reuse, reset, and disposal.
- Strategy negotiation beyond the implemented synchronous query agreements, including richer reset behavior. The [strategy contract](strategy.md) defines current role registration, depth counting, blocking and agreement.
- How logical nodes map to Vue components and rendered elements.

Those contracts must be specified separately; the three categories do not imply a one-to-one mapping to DOM elements or Vue component instances.
