# useUiI18n

Import from `@uninterface/uninterface` or `@uninterface/uninterface/i18n`.

```ts
useUiI18n(): UiI18nControl
useUiI18n<Key extends string = string>(namespace: string): UiI18nTranslator<Key>
```

Use during Vue setup to access this application's locale control. It works anywhere below the application root, including components outside UiApp and teleported native content. Missing setup throws an actionable error. It does not create or dispose a control. Outside Vue setup retain `app.ui.i18n` or pass that reference to a business-owned control.

Use `await control.setLocale('zh_Hans')` for language selection and `control.text({ namespace, key, params })` in computed/render paths for reactive translations. A copied literal string is not a reactive binding. See [the control reference](../types/UiI18nControl.md).

Acceptance: language selection updates core/native messages without recreating components or resetting fields.

The returned control provides `lt(message): UiTextSource`. For example, `const { lt } = useUiI18n()` followed by `label: lt({ namespace: "customer", key: "name" })` supplies deferred, reactive text. Core owns lazy translation; business code may wrap namespace/key mapping for compact typed calls. See [text sources](../../guides/text-sources.md).

## Namespace-bound business translation

`useUiI18n<Key>('app')` returns `{ i18n, t, lt, msg }`, using the existing application control. `t(key, params?)` translates immediately; `lt(key, params?)` creates a deferred text source; `msg(key, params?)` creates an unresolved `UiMessageDescriptor` without looking up resources. Core builds the message descriptor using the supplied namespace. Destructuring all three functions is safe. `t` and `lt` use the owning application; `msg` captures only message identity and parameters for the consuming application to resolve. `i18n` remains the original control for language selection and formatting; the translator neither owns nor disposes it.

The namespace must be nonempty. The application must register its resources before translation; descriptor creation does not require resources. The generic key union provides compile-time key checking for all three functions; it does not register resources or validate pack completeness. Immediate missing-key errors occur on `t`, deferred errors when an `lt` source is read. Parameters retain the descriptor contract and reference semantics.

```ts
import { defineUiI18n } from '@uninterface/uninterface'

export const { useI18n: useAppI18n, msg: appMessage } =
  defineUiI18n<AppMessageKey>('app')
```

Use [defineUiI18n](defineUiI18n.md) at module scope to declare the namespace/key type once and expose both the application hook and standalone descriptors for codecs. Existing wrappers around `useUiI18n<Key>(namespace)` remain valid.

See [UiI18nTranslator](../types/UiI18nTranslator.md) and the [replicable application pattern](../../guides/text-sources.md#core-provided-lazy-translation). Verify no-argument control identity, shared locale updates, namespace isolation, and matching key restrictions for `t`, `lt` and `msg`.
