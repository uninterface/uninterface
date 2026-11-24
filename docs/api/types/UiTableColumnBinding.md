# UiTableColumnBinding

```ts
interface UiTableColumnBinding<T, F = Record<string, unknown>, S extends string = string> {
  readonly target: 'table-column'
  readonly list: UiListBinding<T, F, S>
  readonly definition: UiTableColumnDefinition<S, Extract<keyof F, string>> & { readonly label?: string }
}
```

Import from `@uninterface/uninterface`; create with [createUiTableColumnBinding](../functions/createUiTableColumnBinding.md). This optional producer contract encapsulates a reusable column's identity, label and query associations. The list remains the sole collection/query owner. Multiple column definitions may borrow it without requests or new lifetimes.

The type transports the concrete item/filter/sort vocabulary into a bound declaration. Direct declarations remain valid without a pre-created binding; their Vue generic type arguments must be explicit because a parent's prop type does not automatically type a child component's slots.

An implementation must compare the original list binding identity and reject cross-session bindings. Bound columns cannot also supply local identity, label or query-association props; label/cell/filter slots remain supported. The binding has no content accessor, editor lifetime, independent row projection or disposal method.

This producer, UiTableColumn and UiTable are implemented. Verify cross-session rejection, stable binding identity and concrete slot inference in the [declaration contract](../../contracts/list-api.md#async-records-control-and-table).

The factory accepts a definition whose label is [UiTextSource](UiTextSource.md), and exposes a resolved string from `definition.label` on each reactive read. Custom producers fulfill the same resolved-label contract. Changes to text do not change the binding or list session.
