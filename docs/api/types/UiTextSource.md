# UiTextSource

Import from `@uninterface/uninterface`.

## Meaning and API

```ts
export type UiTextSource = string | (() => string)
```

Supplies plain text directly or synchronously on demand for supported reusable definition properties. For example, `{ key: 'save', label: () => t('save') }` keeps entry identity separate from its translated label. See the [text-source guide](../../guides/text-sources.md) for the complete supported-property table, examples and distinction from component props and validation messages.

## Ownership and implementation

The author supplies side-effect-free functions returning strings. Reactive dependencies belong to the author; functions alone do not make ordinary variables reactive. Core evaluates sources during validation and reactive presentation, possibly repeatedly, and passes resolved strings to backends. Required labels retain nonempty-text validation. Promise results and other non-string values are invalid; optional properties may be omitted. No HTML interpretation or asynchronous loading is added.

Entry-control reads and notice bindings retain sources; use Vue `toValue` inside rendering or a computed value when reading these definitions yourself. Ordinary text props still accept strings through Vue bindings. Backend view text, projected breadcrumbs and table binding labels are resolved strings.

## Observable verification

Switch locale without rebuilding a control: labels update while selected keys, drafts, source request counts and active feedback delivery remain stable. Confirm static strings and existing property getters still work, and blank required labels/non-string function results fail. The guide lists checks for menus, selection, navigation, tables, resizing and feedback.

For translation, Uninterface provides `useUiI18n().lt(message)` (also on standalone i18n controls). It creates a text source from a literal or message descriptor; business code need not implement deferred translation. Use `useUiI18n<AppMessageKey>('app')` for core-provided namespace binding and compact typed `lt(key)` calls.
