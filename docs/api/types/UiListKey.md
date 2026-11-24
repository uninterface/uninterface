# UiListKey

```ts
type UiListKey = string | number
```

Import from `@uninterface/uninterface`. A list key identifies the same business item across accepted results, selection and action contexts. Strings must be nonempty; numbers must be finite. Numeric `1` and string `'1'` are distinct. Duplicate keys in a returned window fail the read atomically.

The business supplies stable keys and must not change them in-place or reuse a removed key for an unrelated entity while old action contexts remain in use. Repeated equal primitive values need distinct occurrence identities. Position and object reference are not substitutes.

Backends must preserve this identity through iteration and event routing. Verify special-character and mixed numeric/string keys, stable contexts across replacement and explicit duplicate failure. See [UiListItemContext](UiListItemContext.md).
