# UiParseResult

```ts
type UiParseResult<T> = { ok: true; value: T } | { ok: false; issue: string | UiMessageDescriptor }
```

Import from `@uninterface/uninterface`. This discriminated union is the resolved result of [UiCodec](UiCodec.md).parse and [UiFieldControl](UiFieldControl.md).read. Test `ok` before using `value` or `issue`.

```ts
const result = await amount.read()
if (result.ok) useAmount(result.value)
else showIssue(result.issue)
```

Success carries a business value, including valid `false`, `0`, or empty values where permitted by rules. Failure carries actionable human-readable text; an empty issue is not useful feedback. It does not carry backend styling, a DOM reference, or pending state. Await asynchronous parsing/reading before examining it. Ordinary invalid input is a failed result, distinct from an unmet capability, which throws.

Core must preserve the union's meaning and avoid truthiness-based rejection of values. Backends present the published issue; they do not reinterpret parse results. Acceptance includes saving an unchecked checkbox as `false` and rejecting malformed amounts without truncating input.

Validation and codec issues may be literal strings or [UiMessageDescriptor](UiMessageDescriptor.md) objects. Views resolve descriptors against application resources so existing feedback changes language without revalidation. Literal strings remain unchanged.
