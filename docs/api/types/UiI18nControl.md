# UiI18nControl

Import from `@uninterface/uninterface/i18n`. Application-owned UI language state.

- `state: ComputedRef`: `locale` (active canonical tag), `requestedLocale`, `formattingLocale`, `direction`, `pending`, `error`, and `resolved` (effective resource locale by namespace, including backend).
- `ready: Promise<void>`: readiness of the common core pack, any preloaded core packs, application resources and native locale. Await before mounting or rendering.
- `setLocale(locale): Promise<void>`: asynchronously prepare and activate resources. Failed active requests reject and preserve active packs; superseded requests finish without activation. Pending/error state is observable.
- `loadNamespace(namespace: string): Promise<void>`: load a named core or registered application pack for synchronous lookup. It follows language changes until disposal. Eager application namespaces are already covered by `ready`.
- `setFormattingLocale(locale): void`: explicit formatting update; the application owns safe transitions for unfinished input.
- `text(string | UiMessageDescriptor): string`: literals pass through; descriptors resolve current resources. Await readiness before looking up an explicitly loaded feature pack. The `uninterface` namespace still resolves each legacy key from its owning core pack. Missing keys throw.
- `lt(string | UiMessageDescriptor): UiTextSource`: creates a synchronous text function without translating yet. Each evaluation calls this control's `text` using the current locale; literal strings pass through and missing keys throw at evaluation. Safe to destructure. Descriptors/parameters are retained by reference; no cloning, automatic reactivity or resource loading is added.
- `number(number, Intl.NumberFormatOptions?): string`, `date(Date | number, Intl.DateTimeFormatOptions?): string`: explicit formatting context. Currency/time zone are not inferred from language.
- `dispose(): void`: prevents future updates and invalidates pending activation.

The built-in Arabic locale `ar` (العربية) and regional requests such as `ar-EG` use script-derived `direction: 'rtl'`. See the [localization guide](../../guides/localization-and-icons.md#arabic-and-rtl) for application resources, native mapping and verification obligations.

Instances are created per app/request. Select the language through `setLocale`. The native commit and core activation happen after the resources needed by mounted and retained views, explicit preloads and the application prepare. Verification covers isolation, failure/race behavior, and preserving visible drafts.

Use core `lt` for supported text-source properties in reusable definitions; see [text sources](../../guides/text-sources.md) for direct use and typed business-key adapters. Verify that creation is deferred, locale changes update a computed label, and independent controls stay isolated.
