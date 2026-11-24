# UiChoiceFilterEditorBinding

Import type from `@uninterface/uninterface`. `UiChoiceFilterEditorBinding<V>` exposes the choice pattern's existing field/entry controls to a view. It has readonly pattern='choice' and these members: field: UiFieldControl<V, V>; choices: UiEntryControl; selection: single/multiple; optional applyLabel and clearLabel (UiTextSource).

Readonly properties preserve the references; controls retain their existing editing API. Custom views edit the field through its normal APIs and use UiFilterViewContext.submit/clear for completion. They must not recreate validation, overwrite the business query or infer clear availability from text. The owning filter control retains draft lifetime and disposes resources. See [filter adaptations](../../guides/filter-adaptations.md) for a custom component example and acceptance checks. Verify typed draft edits, state/validation reactivity, localization, availability and owner disposal.
