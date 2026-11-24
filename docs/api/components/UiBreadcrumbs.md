# UiBreadcrumbs

Hierarchical location trail. Import from `@uninterface/uninterface` in an application initialized by createUiApplication.

## API

Use `binding?: UiBreadcrumbsBinding` or direct UiBreadcrumb declarations. Optional `aria-label` names the navigation landmark; the default is localized Location. The final item is the current location and is non-navigable. Default slot accepts only UiBreadcrumb declarations, fragments and whitespace.

```vue
<UiBreadcrumbs><UiBreadcrumb href="/">Home</UiBreadcrumb><UiBreadcrumb>Record</UiBreadcrumb></UiBreadcrumbs>
```

## Ownership and implementation

Core resolves manual or bound hierarchy. Backends own the landmark, ordered trail, link/text targets and decorative separators. Native breadcrumb themes determine link, hover and current-location presentation. Core passes label content and guarded navigation attributes; it does not insert generic UiLink views into native items. This component has no routing or selected-value state.

See the [hierarchical location trail guide](../../guides/navigation-and-tooltips.md) for setup and composition.

## Observable verification

Verify the final item has aria-current=page, preceding links retain their destinations, duplicate keys fail, and binding/manual ownership cannot be mixed.

Entry-based navigation bindings also support text-only intermediate crumbs and loading/missing/error feedback. Failed resolution exposes Retry. A nonfinal key-only destination renders an operable button; the final crumb remains current text. No prior endpoint is presented as current while new metadata is unresolved. See [navigation menus](../../guides/navigation-menus.md).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
