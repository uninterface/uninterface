# UiValidationRule

```ts
type UiValidationRule<T> = (value: T) => string | UiMessageDescriptor | null | Promise<string | UiMessageDescriptor | null>
```

Import from `@uninterface/uninterface`. A rule checks an already parsed value and returns `null` when acceptable, or a nonempty, human-readable issue when invalid.

```ts
const positive: UiValidationRule<number> = value => value > 0 ? null : 'Use an amount greater than zero.'
```

Rules supplied to `createUiFieldControl` check that field's business value in order, stopping at the first issue. Rules supplied to `createUiFormControl` receive the complete parsed model only after all fields pass, and all form-level issues are collected. A rule may return immediately or resolve asynchronously, including after an external check. It must tolerate repeated evaluation. It must not modify the draft, trigger persistence, or depend on a backend's validation conventions.

Business code owns rule meaning and translated text. Core controls execution and feedback timing. Backend implementations display the resulting feedback with the correct associations. Thrown exceptions or rejected promises mean validation could not complete; return an issue for ordinary invalid user input. Core awaits rules and rejects obsolete results. Automatic cross-field dependency scheduling, debouncing, caching, and request cancellation are not implemented. Field rules receive copies of the parsed value; form rules receive copies of the same validated model snapshot.

Acceptance: field failures block form-level rules; a relationship rule can reject an otherwise valid model; rules never dispatch save themselves.

For an asynchronous service-check example and error handling, see [asynchronous validation](../../guides/validation.md).

Validation and codec issues may be literal strings or [UiMessageDescriptor](UiMessageDescriptor.md) objects. Views resolve descriptors against application resources so existing feedback changes language without revalidation. Literal strings remain unchanged.
