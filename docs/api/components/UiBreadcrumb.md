# UiBreadcrumb

Manual breadcrumb declaration. Import from `@uninterface/uninterface` in an application initialized by createUiApplication.

## API

Only valid directly inside UiBreadcrumbs. Optional `href?: string`, `binding?: UiLinkBinding`, and `disabled?: boolean`. Default slot provides noninteractive label content. Give repeated declarations stable Vue keys.

```vue
<UiBreadcrumb href="/records">Records</UiBreadcrumb>
```

## Ownership and implementation

The parent interprets this logical declaration. It does not mount a second view; The backend supplies preceding-item navigation with its native breadcrumb presentation. Omit both href and binding for a non-link ancestor, such as a grouping with no destination. It renders as plain text without a tab stop. The final declaration always becomes current-page text.

See the [manual breadcrumb declaration guide](../../guides/navigation-and-tooltips.md) for setup and composition.

## Observable verification

Verify declaration order, current-page text, and an explicit error outside UiBreadcrumbs.

## Stacking

`zOrder?: UiZOrder` describes outward stacking. The declaration host projects this identity onto its rendered tab or breadcrumb target. See [dynamic stacking](../../guides/dynamic-z-order.md) for scope, lifetime, pending refs and observable overlap checks. Core owns order; the backend owns rendering targets.

Declaration refs expose a stable stacking identity (`zHandle`), not a mounted component DOM API. Their ordering parent/layer belongs to the declaration host and cannot be overridden.
