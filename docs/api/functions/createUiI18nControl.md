# createUiI18nControl

Import from `@uninterface/uninterface/i18n`.

`createUiI18nControl(options?: UiI18nOptions, native?: { source: UiLocaleSource<unknown>; commit(resource: unknown, locale: string): void }): UiI18nControl`

Creates a standalone application-owned locale control. Ordinary Vue applications receive one through createUiApplication; this factory supports independent controls and integration tests. Await `ready` before consuming initially selected non-English or application resources. `dispose()` cancels pending activation, releases cached resources and prevents further updates.

The optional native bridge prepares resources with core before committing; its commit must be synchronous, nonthrowing and free of external side effects. Application setup normally owns it. The control never reads navigator/document or guesses currency/time zone. See [UiI18nControl](../types/UiI18nControl.md) for methods and error behavior.

Acceptance: a failed native/resource load leaves the active language intact; a superseded request cannot overwrite newer state; independent instances do not share mutable language/resources.

The returned control also provides `lt(message)` to create a lazy text source outside Vue setup. It resolves through this instance on each read and shares the same resource and lifetime semantics as `text(message)`. See [text sources](../../guides/text-sources.md).
