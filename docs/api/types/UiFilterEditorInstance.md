# UiFilterEditorInstance

`UiFilterEditorInstance<V>` is returned by createEditor. Import the type from `@uninterface/uninterface`.

Members: stable readonly view: Vue Component; reactive readonly dirty and validating getters; validate(): Promise<{ valid: true; value: V } | { valid: false }>; replace(value: V): void; dispose(): void. Validation supplies feedback in the editor and returns the exact normalized criterion checked; raw draft format is opaque. replace resets draft and baseline without emitting changed. dispose releases custom observers/resources. The factory's owned effect scope also stops at disposal.

The view obtains operations/presentation through useUiCollectionFilter; its fields and domain-specific dependencies may be captured by the factory. Use existing codecs/controls when suitable. Custom validation must suppress obsolete feedback as well as cooperating with the outer commit generation guard. Unknown usage needs a fallback. There is no generic DOM focus method: each business view/backend input owns focus and invalid-field recovery.

Verify custom opaque drafts, external replacement, validation staleness and exactly-once disposal.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
