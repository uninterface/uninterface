# Text in reusable definitions

Use `UiTextSource` for supported text properties in reusable definitions. Use ordinary reactive Vue bindings for component text props. This keeps labels current without rebuilding controls, resending feedback or reloading business data.

```ts
import { createUiEntryControl } from '@uninterface/uninterface'

// Obtain t and lt from your application's i18n helper.

const saveOutcomes = createUiEntryControl([
  {
    key: 'success',
    label: lt('editor.success'),
  },
  {
    key: 'field-failure',
    label: lt('editor.fieldFailure'),
  },
  {
    key: 'failure',
    label: lt('editor.failure'),
  },
])
```

In entry definitions, put `key` and `label` on separate lines, with trailing commas on both properties.

Here `lt` means **lazy translation**: it returns a text function that calls the owning Uninterface i18n control's `text` when read. The translation function reads reactive locale state. The owner disposes `saveOutcomes` when its session ends. Changing locale does not require a new control. Stable keys identify business choices independently of their visible labels.

## Core-provided lazy translation

Uninterface provides `lt(message)` on its i18n control. It accepts the same literal string or `UiMessageDescriptor` as `text(message)`, and returns a `UiTextSource` without translating yet. Obtain it from the current application during setup:

```ts
import { useUiI18n } from '@uninterface/uninterface'

const { lt } = useUiI18n()
const entry = {
  key: 'success',
  label: lt({ namespace: 'editor', key: 'success' }),
}
```

Register the `editor` namespace in application resources. A plain string passed to core `lt` is literal text, just as with `text`; it is not interpreted as a dotted translation key. Translation resolves against the owning application's current locale each time the returned function is read. Destructuring `lt` is safe; no global locale service or `this` binding is needed. Await the control's `ready` before rendering application messages. Missing-key errors occur when the text function is evaluated, not when it is created.

For business code, declare the namespace and key union once. The demo uses a core definition shared by component hooks and standalone codecs:

```ts
import { defineUiI18n } from '@uninterface/uninterface'
import type en from './en'

type DemoMessageKey = keyof typeof en
export const { useI18n: useDemoI18n, msg: demoMessage } =
  defineUiI18n<DemoMessageKey>('demo')

// In component setup:
const { i18n, t, lt, msg } = useDemoI18n()
```

`defineUiI18n` runs at module scope without injection or locale state. The generated hook obtains the current application's existing control when called. Standalone `demoMessage(key, params?)` is available to codecs and validators outside Vue setup. The factory does not register or load resources; follow the [complete application-helper recipe](localization-and-icons.md#typed-application-helper).

| Operation | Result | Resolution and use |
|---|---|---|
| `t(key, params?)` | `string` | Translates immediately using the hook's application; use in Vue bindings/computed values. A string captured once stays unchanged. |
| `lt(key, params?)` | `UiTextSource` | Returns a function using the hook's application when read; use in supported reusable definitions. |
| `msg(key, params?)` | `UiMessageDescriptor` | No translation or resource lookup; store in validation/codec/upload issues for the consuming application to resolve. Standalone access needs no Vue context. |

These are different receiving contracts: descriptors are not `UiTextSource`, and ordinary text props still accept strings. The name `msg` has descriptor-authoring precedent; it is not a universal standard, macro or extraction tool. `lt` is Uninterface's selected name for lazy text.

`useUiI18n<Key>(namespace)` returns `{ i18n, t, lt, msg }`. The no-argument overload still returns the original control, whose `text` and `lt` accept literals or complete descriptors. Namespaced functions treat strings as keys. All three share compile-time key restrictions and optional string/number parameters; required parameters are not inferred per key. Neither typing nor descriptor creation proves resources exist. `t` errors on translation, `lt` when evaluated, and `msg` never looks up the message.

Descriptors and their parameter objects are retained by reference, not cloned or automatically made reactive. For changing interpolation values, use reactive parameters or an explicit function such as `() => t('cart.count', { count: count.value })`, so the value is read on each evaluation. Lazy text has the same resource, fallback and disposal semantics as reading the owning control's `text`; it does not load resources, create a session or extend its lifetime.

## Meaning and responsibilities

```ts
type UiTextSource = string | (() => string)
```

A string supplies text directly. A function supplies it synchronously when core reads presentation or validates a definition. Core evaluates presentation text inside Vue reactive computations or rendering; reactive values read by that function become dependencies. A function reading nonreactive state does not make that state reactive. No automatic timer or polling is involved.

Business authors own the words, translations, interpolation data and stable identities. Functions must be side-effect free and return strings; promises, markup objects, mutations, network requests and control creation do not belong in them. They may be evaluated more than once, including initial validation and SSR. Keep them cheap and do not depend on an exact invocation count. Errors propagate rather than being converted to display text. Where a contract requires a nonempty label, the resolved text must continue to satisfy that requirement. Optional properties may be omitted; a supplied function must still return a string.

Core resolves text while preserving control state, source ownership and invocation behavior. Backends receive resolved strings and own markup, accessibility wiring and presentation; they do not execute business text functions. Strings are text, never HTML. Existing rich-content slots and entry render functions retain their separate contracts.

This separation prevents locale changes from becoming business operations. Do not use translated text as an entry key, route identity, selected value, column key or action key.

## Supported inputs

| Definition | Text-source properties |
|---|---|
| [UiEntry](../api/types/UiEntry.md), including groups and submenus | `label`, optional `description`; item `shortcut` is a display hint only |
| [UiNavigationLocation](../api/types/UiNavigationLocation.md) | `label` |
| [UiNavigationCrumb](../api/types/UiNavigationCrumb.md) | `label` |
| [UiRegionResizeBoundary](../api/types/UiRegionResizeBoundary.md) | `label`, the accessible name of the resize separator |
| [UiTableColumnDefinition](../api/types/UiTableColumnDefinition.md) | optional `label` |
| [UiFeedbackAction](../api/types/UiFeedbackAction.md) | `label` |
| [UiFeedbackMessage](../api/types/UiFeedbackMessage.md) | optional `title`, `message`, and each item of `details: readonly UiTextSource[]` |

A static string remains valid everywhere in this table. Existing JavaScript property getters remain valid too; the function form is the recommended concise form for dynamic text in these definitions.

A text function changes one piece of text. Use an existing whole-definition getter when the structure or other properties need to change. For example, `createUiTableColumnBinding(list, () => definition)` still owns reactive column-definition reads. Its `definition.label` output is resolved text, suitable for a string-valued component prop. A feedback source getter can change the number of details, action availability or the set of actions.

```ts
const handle = feedback.send({
  title: () => t('save.result'),
  message: () => t('save.failed'),
  details: [() => t('save.retryHelp')],
  actions: [
    { key: 'retry', label: () => t('retry'), onClick: retry },
  ],
})
```

Here `feedback` is an owned route and `retry` is the application's operation. Locale changes update the existing delivery; they neither send another delivery nor revive a dismissed one. See [feedback routing](feedback-routing.md) for its complete lifecycle and binding rules.

## Vue props and other text contracts

Ordinary component text props continue to accept strings. Vue already evaluates their bindings reactively:

```vue
<UiField :field="name" :label="t('name.label')" :help="t('name.help')">
  <UiTextInput />
</UiField>
```

This applies to titles, tooltip text, placeholders, alternative text and accessible names too. Do not pass a function to a string-valued prop or native `aria-label` attribute. Direct `UiTableColumn` label props remain strings; text sources belong to reusable column definitions supplied through a binding.

Validation/codec/upload issues retain `string | UiMessageDescriptor`. Use a descriptor to translate a stored issue when the locale changes without rerunning validation. Translation-pack `UiMessage` functions receive formatting/pluralization context and remain a distinct type. Native `Error.message`, business values, filenames, URLs, keys, locale codes and diagnostic metadata remain strings.

Search's `label(item): string` is already a callback. The current search control snapshots that label when provider results arrive; this change does not promise live translation of existing search results. Do not change its return type to another function.

## Reading definitions yourself

Entry `collection()`, `find()` and `describe()` retain author definitions, including their text sources. `UiNoticeBinding.current` likewise carries the delivered source properties. Their built-in views resolve those properties. When a business composition reads a source itself, resolve it inside its own Vue computed value or rendering:

```ts
import { computed, toValue } from 'vue'

const selectedLabel = computed(() =>
  toValue(saveOutcomes.describe(selectedKey.value)?.label) ?? selectedKey.value,
)
```

Do not resolve once during setup and cache that string if it must follow locale changes. Projected breadcrumb items, menu entry/icon slot text, table binding labels, and notice slot `feedback` text are already resolved. Backend view bindings remain string-valued.

## Observable acceptance

- Switch locale while an entry is selected: visible and accessible labels, descriptions, group names, shortcut hints and retained absent-choice labels update; selected keys and loaded collections stay unchanged.
- Keep a menu or editor mounted: text updates preserve focus targets, input drafts and entry/action identity. A text update alone issues no source or navigation request.
- Change navigation text: the confirmed location and link bindings remain stable; custom breadcrumb resolvers need not run again.
- Rename a table column or resize boundary through reactive text: labels update without replacing the row editor or resetting column/region allocation.
- Translate an active notice: title, message, details and action labels update in the same delivery; action callbacks still work. Dismissed feedback stays dismissed.
- Reject blank required labels and functions returning non-string values, including promises. Existing static strings and property getters remain usable.

See [UiTextSource](../api/types/UiTextSource.md), [localization setup](localization-and-icons.md) and the [backend contract](../api/backend/README.md) for the related APIs and responsibilities.
