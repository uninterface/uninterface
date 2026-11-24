# defineUiI18n

Import from `@uninterface/uninterface` or `@uninterface/uninterface/i18n`.

Declare one namespace and key vocabulary for a reusable business component or application. The definition supplies a Vue hook and a standalone descriptor builder, so codecs and components share message identity without repeating namespace mapping.

## API

```ts
defineUiI18n<Key extends string = string>(namespace: string): UiI18nDefinition<Key>

const { useI18n: useAppI18n, msg: appMessage } =
  defineUiI18n<AppMessageKey>('app')

// During component setup:
const { i18n, t, lt, msg } = useAppI18n()

// Outside Vue setup, including module scope:
const issue = appMessage('nameRequired')
```

The namespace must be nonempty after checking whitespace; a blank namespace throws at definition time. Nonblank namespaces are used exactly as supplied, without trimming or normalization. The generic restricts keys at compile time; it does not validate resource completeness. All three operations accept the same optional `Readonly<Record<string, string | number>>` parameters. Required parameter names are not inferred per key.

## Ownership and implementation

Core creates descriptors using the same builder for standalone and hook `msg`, and for `t`/`lt`. `msg` returns `{ namespace, key, params }` without injection, resource lookup, translation or locale capture. Parameters remain referenced, not cloned or made reactive. The descriptor is resolved by its consumer's application; it is not tied to the application that created it.

The factory is safe at module scope. Only the generated `useI18n()` hook obtains the current application's existing control, using the same injection rules as [useUiI18n](useUiI18n.md). Missing application setup throws. The hook's `t` and `lt` retain that application's control; `t` translates now, while `lt` returns a text source resolved when read. Missing-message errors occur on translation, never descriptor creation.

Applications register resources during setup, await readiness before translating, and own the normal service lifetime. Definitions neither register/load resources nor create/dispose controls. One definition can be shared across applications and SSR requests; it stores no mutable application state. Existing direct `useUiI18n(namespace)` and no-argument access remain supported.

See [UiI18nDefinition](../types/UiI18nDefinition.md), [UiI18nTranslator](../types/UiI18nTranslator.md), and the [complete application recipe](../../guides/localization-and-icons.md#typed-application-helper).

## Observable verification

Create a descriptor before any application exists, then resolve it under two applications with different locales. Verify independent translations using the same module-level definition, matching namespace/key/parameter behavior through both builder paths, and compile-time rejection of unknown keys and non-string/number parameters. Switch language with a stored validation issue: its displayed message updates without rerunning validation or changing the editing session.
