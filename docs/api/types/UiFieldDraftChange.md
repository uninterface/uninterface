# UiFieldDraftChange

Optional context describing an internal draft change reported by a business composition. Import this type from `@uninterface/uninterface`; it is a type-only interface.

```ts
interface UiFieldDraftChange {
  readonly origin?: 'user' | 'programmatic'
  readonly parts?: readonly string[]
}
```

Pass it to [UiFieldControl.notifyDraftChanged()](UiFieldControl.md#internal-draft-changes):

```ts
field.notifyDraftChanged({
  origin: 'user',
  parts: ['unfinishedText'],
})
```

| Property | Meaning |
|---|---|
| `origin` | Initiating user interaction or programmatic workflow change; omitted means unknown. Every method call uses JavaScript, but that alone does not make its origin programmatic. |
| `parts` | Composition-defined logical draft portions, such as unfinishedText or selection. Omitted/empty means unspecified scope. These are not DOM selectors, model paths or standardized keys. |

The composition owns the draft and metadata meaning. Core invalidates the entire field snapshot regardless of metadata; these properties never select validation rules, authorize editing or establish validity. No old/new value is required because unfinished input may not have a valid business value. Do not use this object to carry live draft references, native events or validation results.

Core copies the declared metadata, freezes its snapshot and parts array, and attaches a generated `revision` in read-only `field.state.lastDraftChange`. The observation is initially undefined. Calling without arguments publishes a revision-only observation; a later field revision without matching notification detail clears it. Revision and metadata update together. It is a latest-change observation, and Vue may batch changes; it does not promise an audit history or delivery of every event. Backends do not interpret metadata or become draft owners.

Acceptance: caller mutations cannot alter recorded metadata; observations carry the matching core revision; omitted origin is not inferred; parts never permit partial validation reuse; later unrelated revisions cannot display stale detail. See the [validation guide](../../guides/validation.md#internal-draft-notification) for attachment, change, reset and cleanup obligations.
