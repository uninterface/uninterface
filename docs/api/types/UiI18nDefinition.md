# UiI18nDefinition

Import this type from `@uninterface/uninterface/i18n`. Returned by [defineUiI18n](../functions/defineUiI18n.md), it describes a namespace vocabulary shared by component hooks and standalone business utilities.

## API

```ts
interface UiI18nDefinition<Key extends string = string> {
  useI18n(): UiI18nTranslator<Key>
  msg(key: Key, params?: UiMessageDescriptor['params']): UiMessageDescriptor
}
```

Both members are safe to destructure or alias. `useI18n` runs in the application's Vue injection context and returns `i18n`, `t`, `lt` and `msg`. `msg` works without a Vue context or registered resources and returns an unresolved descriptor. All operations retain the declared key restriction and existing string/number parameter dictionary; parameters are not inferred per key.

## Ownership and implementation

Core owns descriptor mapping and hook construction. The definition holds the namespace, not a locale or application control. Each hook invocation obtains the current application's control; each descriptor resolves against its consumer's application. Applications register resources, supply their key union and own service lifetimes. Parameter objects are retained by reference without automatic reactivity. Definitions have no disposal operation or service lifetime of their own.

See the [application helper recipe](../../guides/localization-and-icons.md#typed-application-helper) for resource registration, components and standalone codecs.

## Observable verification

Use one module-level definition in separate application/SSR contexts and verify no locale leakage. Create descriptors before setup; assert hook and standalone descriptors agree, preserve parameter references and reject invalid keys at compile time. Existing translator/control ownership remains unchanged.
