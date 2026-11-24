# Entry collections, menus and selection

Entries use a shared construction contract. Entries and sources are shared across selection and menu hosts; activation, navigation and value selection retain separate contracts.

## Business meaning and construction

An entry has a string `key` stable through refresh, localization and presentation changes. Keys are unique throughout one entry control's complete tree, including groups and loaded or static submenu descendants. Duplicate keys are contract errors. An empty string is allowed, for example an explicit empty-value choice. Keys identify occurrences; typed business values can be mapped through a field codec.

`UiEntry` is a discriminated union:

| Kind | Required content | Optional content |
|---|---|---|
| `item` (default when omitted) | key, textual label | description, render function, semantic icon, shortcut hint, disabled, href |
| `submenu` | key, textual label, children source | description, render function, semantic icon, disabled |
| `group` | key, textual label, entries array | description, render function, semantic icon |
| `separator` | key | None |

A group associates its label with members at the current menu level; a submenu opens another collection. Groups can contain groups in menus. Separators and groups cannot be chosen. A submenu trigger opens children and is not also an action or selectable value. `disabled` defaults to false. Supply new data and explicitly refresh to change source results; treat published entry arrays and objects as immutable.

Labels are short, nonempty text equivalents. Descriptions provide additional explanation. Local `render()` functions or the host's `entry` slot may supply rich, non-interactive content; the text label remains available for accessible naming, type-ahead and text-only presentations. Remote providers return data, not executable content. Native selects use text fallback. Independently interactive children inside an item are outside this contract.

Icons identify semantic names and optional tones. UiMenu and UiNavMenu resolve declared icons through the application catalogue by default. Their optional `icon` slot can supply specialized artwork. UiSelect uses text fallback. Unknown catalogue names fail loudly. Shortcut strings are display hints only: they register no handlers and make no claim through `aria-keyshortcuts`. Application shortcut handling must obey the same eligibility rules.

`href` optionally supplies a native navigation destination. UiNavMenu also accepts key-only entries: the application can map activation keys to routes or other destinations. Keys do not implicitly encode URLs. Supplied links retain browser link operations; script/data URL destinations are rejected. UiMenu emits activation intent by key instead of following href.

## Sources and ownership

`createUiEntryControl(source, options?)` accepts an array or a function receiving `{ signal, query }` and returning entries immediately or asynchronously. Every submenu can independently use the same source form. Groups are supplied as part of the containing collection, not separate loaders.

The control owns collection results, query state, requests, retained descriptions and optional selection scopes. Components request loading and report interaction; backends present state and own DOM/focus/style mechanics. Business compositions own the control's lifetime and call `dispose()` when the interaction ends. View unmounting does not dispose an externally owned control. Multiple views can share a collection and selection while keeping their own open/expanded presentation session.

Collection state distinguishes idle, loading, ready, refreshing and error. Ready with zero entries means a successful empty result. Source exceptions produce observable error state; menu views provide retry, while select compositions supply source recovery controls; malformed entry results reject the operation as contract errors. Refresh retains the previous successful results for the same query. A new query clears old results instead of presenting them as new matches. Cancellation plus revisions reject obsolete completions, including providers that ignore cancellation. Disposal invalidates pending results.

`clear(parentKey?)` unloads a collection, aborts and invalidates pending work, discards descendant caches, and resets error while preserving query, selected keys and retained descriptions. It starts no request. Subsequent load also works for cleared static sources. `load()` reuses ready data and pending work. `refresh()` reloads deliberately; `search(query)` issues a new root provider request; static arrays reject search because they have no query interpretation. Submenu loading is lazy and cached until explicit refresh. Empty, loading and failed branches remain different states. Closing a view does not cancel a business-owned control's work. Pagination and automatic cache expiry are not implemented.

## Selection is separate from structure

A single selection is zero or one selected key; multiple selection is a set of selected keys. The implementation exposes readonly arrays as the set representation, removing duplicates. Scopes declare single/multiple rules and the keys they cover; omitted scope keys mean all ordinary items. Scopes cannot overlap. There are no checkbox-item or radio-item entry kinds.

Menu views derive checkbox/radio roles and indicators from the scope and selected keys. Single activation selects that key; multiple activation toggles it. Programmatic assignment can clear either mode. Different scopes in one menu have independent states. Scope definitions are fixed for a control's lifetime in this version; remotely discovered keys can participate in a single all-items scope.

Selection is not focus, submenu expansion or current navigation destination. Selecting a descendant does not select ancestors. Cascading selection, partial-parent state and selecting unloaded descendants are outside the implemented contract. Missing entries in a refreshed result do not clear selected keys. Direct `setSelectedKeys` is an explicit business assignment; user `choose` only accepts currently available, enabled ordinary items.

UiSelect's field is the sole owner of its selected editing value. Its entry control supplies candidates and must have no applicable selection scope. Use the current candidate label when available, otherwise a retained description, otherwise the raw selected key. Unknown keys do not require an extra label or lookup before rendering. Known descriptions are retained across refresh, clear and search. Displaying a newly available label never changes the field value. An absent selected entry remains displayed but cannot be newly chosen. Field validation decides business validity, not source absence. UiSelect only accepts new choices from a ready collection. Retained cached results on refresh failure are not selectable candidates. Idle, loading/refreshing, failure and successful empty results appear as nonselectable status content in the opened picker. Native selects use disabled options; composite toolkits may use their loading/empty/status areas. Loading appearance and wording belong to the backend: use native toolkit behavior when available and core's localized message as a fallback for manual presentation. Loading must remain perceivable and accessible, but visible text or a particular phrase is not required. They never replace the selected value or its collapsed label. The placeholder and retained absent selections stay out of selectable candidates; native selects realize this with hidden disabled options. Source state never disables the select itself; only explicit field disablement does. UiSelect renders no recovery button; business compositions can request another load or refresh through source controls. UiSelect loads automatically by default; `autoLoad: false` defers initial loading. Pointer or keyboard selection intent loads an idle source; explicit business loading is also supported. Failed sources remain inspectable and require explicit loading rather than retrying on every opening.

## Presentations

- UiSelect: single selection through a native or composite toolkit picker, static/async candidates, one level of labelled groups, disabled choices, pending/error/empty state and recovery through source controls. Rich content falls back to text; separators are omitted. Submenus and nested groups fail loudly. Editable combobox search uses the separate search binding; see the [search guide](../guides/search.md). UiMultiSelect supplies a separate field-owned string-array selection surface with full-array codecs, retained missing selections and disabled-membership locks; see the [multiple selection guide](../guides/multiple-selection.md).
- UiMenu: inline or popup root presentation; actions, selection scopes, nested groups and lazy submenus. Popup hosts supply their own button/content through scoped buttonTrigger and contextTrigger bindings. Context use includes right-click, ContextMenu/Shift+F10 and a visible button for pointer/touch access. Submenus open attached floating surfaces, including when the root is inline. Backends own concrete placement and viewport adaptation; opening must not insert submenu content into parent flow.
- UiNavMenu: navigation-oriented menu presentation, nested groups/submenus and async sources. `modelValue` expresses the application-confirmed current key independently of selection. Activation emits a key; it never assigns the current key or selects a scope. Hrefs are optional. Use UiNavbar when a navigation landmark is appropriate. Current destination does not imply an open popup. Model changes and activation close submenu sessions.

Backends use native async feedback when available. For menus without a native async facility, adapters supply pending/failure/empty/retry feedback in the menu surface. Native loading wording follows the toolkit locale; generated core wording is a fallback, not a business-authored override.

Menu activation of an ordinary action closes a popup; selecting a scoped item keeps it open. Inline menus remain present. Escape closes the nearest submenu or root popup, restoring focus. Arrow keys, Home/End and text type-ahead operate menus; Tab retains document navigation. Disabled commands may receive menu focus but cannot activate. Navigation uses the backend's appropriate accessible pattern: native toolkit menubar/menuitem behavior or link/disclosure navigation. Menu roles require corresponding keyboard/focus support; they are not forbidden by the shared contract. Backends keep popup geometry within the viewport, restore focus and clean up listeners. When Vue KeepAlive deactivates a menu view, core closes its popup session and backends release floating surfaces and global listeners without focusing the inactive page. Reactivation leaves the popup closed. Entry controls and their selections/cached sources remain business-owned; deactivation alone does not dispose them.

## Acceptance obligations

Use the same application fixture against each candidate backend. Verify stable key lookup, duplicate rejection, independent selection scopes, disabled activation guards, stale-response protection, separate branch loading, failure/retry versus empty, selection retention, and disposal. Rendered tests verify semantic roles, rich content, label associations, keyboard requests and callback/state integration. Real-browser checks additionally cover popup bounds, focus traversal, scrolling, accessibility and touch/pointer interaction; DOM simulation is not evidence of visual conformance.

Backends choose native browser facilities or toolkit overlays for popup placement. They must preserve theme/direction and logical ownership across any teleport, and document browser API requirements. Neither a particular hosting mechanism nor a fixed numeric z-index is part of the contract. General mobile stacked-submenu navigation and hover opening are not implemented in the reference backends.

UiNavMenu supports horizontal, vertical-tree, vertical-popup and icon-popup presentations. A navigation projection ignores command selection and shortcut metadata recursively without mutating the entry control. A bound navigation controller supplies confirmed current/path and requests; manual ownership remains supported. Persistent hierarchies reveal current ancestry; floating menus do not open from current changes. See the [navigation guide](../guides/navigation-menus.md).

## Reactive text definitions

Entry labels, descriptions and item shortcut hints accept `UiTextSource = string | (() => string)`. Functions are synchronous, side-effect free and return plain text. Required labels remain nonempty. Core retains sources in entry-control definitions and resolves them in reactive host projections, including remembered descriptions for absent selected items. Text changes do not reload sources or change entry identity, selected keys or expansion. Backend views and menu entry/icon slots consume resolved text. See the [implemented text-source guide](../guides/text-sources.md).
