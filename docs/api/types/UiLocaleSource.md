# UiLocaleSource

Import from `@uninterface/uninterface/i18n`.

`UiLocaleSource<T = UiMessagePack>` has `resources: Readonly<Record<string, T | (() => T | Promise<T>)>>` and optional `aliases: Readonly<Record<string, string | readonly string[]>>`.

Set `lazy: true` on an application namespace to defer its selected pack until `await i18n.loadNamespace(namespace)`. The default is eager. Core and native locale sources follow their own loading rules.

Resource keys are locale tags. Aliases give ordered compatible resource candidates. Resolution prefers exact resources, aliases, compatible likely-script/language resources and then configured fallback. It validates tags and avoids alias cycles. A loader is a zero-argument function returning one resource pack; failed loads are retryable. Successful resources are cached per control. `T` permits native backend locale objects as well as ordinary message packs.

Acceptance: `zh-Hans` can map to a native `zh-CN` resource without changing the requested locale or formatting region; Traditional Chinese must not silently select Simplified Chinese.
