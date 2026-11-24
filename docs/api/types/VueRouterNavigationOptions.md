# VueRouterNavigationOptions

Import this type from `@uninterface/uninterface/vue-router`.

```ts
interface VueRouterNavigationOptions {
  current?(route: RouteLocationNormalizedLoaded): string | undefined
  target?(key: string): RouteLocationRaw
}
```

Mapping callbacks belong to the application. Without them, string route names are keys and `{ name: key }` is the target. Use both callbacks for parameterized destinations so confirmed keys and generated hrefs agree. They do not alter breadcrumb hierarchy or establish a second routing owner.

Verify direct routes and redirects map to the actual confirmed destination. See [createVueRouterNavigationDriver](../functions/createVueRouterNavigationDriver.md).
