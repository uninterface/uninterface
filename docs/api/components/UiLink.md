# UiLink

Navigation link. Import from `@uninterface/uninterface` in an application initialized by createUiApplication.

## API

Choose `href?: string` or `binding?: UiLinkBinding`, never both. Optional `color?: UiThemeColor` requests semantic color; `disabled?: boolean` adds a restriction. Default slot supplies link content; optional icon slot supplies an icon. Standard anchor attributes, including target and download, are forwarded.

```vue
<UiLink href="/records">Records</UiLink>
```

## Ownership and implementation

The binding owner handles application navigation. Ordinary same-window activation requests navigation; modifier/new-tab/download behavior stays native. Backends supply real anchor semantics and native link presentation. Disabled links have no active href.

See the [navigation link guide](../../guides/navigation-and-tooltips.md) for setup and composition.

## Observable verification

Verify modified clicks are not intercepted, disabled links cannot navigate, and current binding state has current-page semantics.

An entry-navigation binding may omit href for an application-only destination. In that case UiLink exposes button semantics with Enter/Space activation and no invented URL. Native link operations require an href.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
