# createUiStrategyQuery

Import from `@uninterface/uninterface`. Defines a typed presentation concern and its explicit synchronous agreement. Create/export the query once for all authors and participants to share.

```ts
createUiStrategyQuery<T, Context = void>(definition: {
  name: string
  agree: (values: readonly T[], context: Context) => T | undefined
}): UiStrategyQuery<T, Context>
```

The unique symbol key is identity; equal names do not merge independently created queries. `answer(value)` creates a typed contribution. Undefined is reserved for no agreement; use another representation for an answer meaning absence. Core calls agree only with a nonempty frozen array of applicable, supported values. Agreement receives all contributions, with no automatic priority; design order-independent agreement unless the query explicitly establishes order semantics. Undefined retains the backend default and reports no-agreement. Unexpected errors or an unsupported returned value are errors.

Backend participants declare supported values and implement the result. Optional unanswered/unsupported concerns retain normal presentation. Query blocking removes every incoming contribution to this concern. See the [strategy contract](../../contracts/strategy.md#queries-and-agreement) and [backend query API](../backend/strategies.md#strategy-queries).

Verification: typed answers reject incompatible values, same-name identities stay distinct, custom agreement combines contributions correctly, unsupported inputs are filtered and errors propagate.

Queries may declare a second generic context type. Participants then provide a context getter to useUiStrategy/node.query (or a render-time snapshot to node.resolve). Agreement receives that context synchronously; reactive reads remain tracked. Existing context-free queries default to void. Collection header selection uses this to evaluate selectors before agreeing on selected adaptation identity. Verify context changes, selector dependencies and unchanged scope/block semantics.
