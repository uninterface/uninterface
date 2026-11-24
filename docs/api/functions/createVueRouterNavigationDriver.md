# createVueRouterNavigationDriver

Import from `@uninterface/uninterface/vue-router`; install the optional `vue-router` peer (^4.6.4). Ordinary core imports do not import Vue Router.

```ts
createVueRouterNavigationDriver(router: Router, options?: VueRouterNavigationOptions): UiNavigationDriver
```

Defaults use string route names as destination keys. `current` observes confirmed matched routes; `href` uses router.resolve; requests await readiness and use router.push. Provide `current(route)` and `target(key)` for parameters, unnamed/symbol routes or different business keys. Route nesting does not define menu hierarchy.

Aborted guards return blocked; cancelled requests return cancelled; duplicates return unchanged; successful redirects return completed with current read from the resulting route. Unexpected errors return failed. AbortSignal invalidates adapter work; Vue Router does not support rolling back an issued push through that signal. The application must initiate the initial route and owns router lifetime.

Verification uses real Vue Router memory history, guards, redirects, duplicates, cancellation and Back/Forward. See the [navigation menu guide](../../guides/navigation-menus.md).
