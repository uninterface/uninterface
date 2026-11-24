import { computed } from 'vue'
import {
  isNavigationFailure,
  NavigationFailureType,
  type Router,
  type RouteLocationNormalizedLoaded,
  type RouteLocationRaw,
} from 'vue-router'
import type { UiNavigationDriver } from './menu'

/** Explicit mappings for unnamed/symbol routes or destinations with parameters. */
export interface VueRouterNavigationOptions {
  current?(route: RouteLocationNormalizedLoaded): string | undefined
  target?(key: string): RouteLocationRaw
}

/** Observe confirmed routes; navigation failures never become optimistic current state. */
export function createVueRouterNavigationDriver(
  router: Router,
  options: VueRouterNavigationOptions = {},
): UiNavigationDriver {
  return {
    current: computed(() => {
      const route = router.currentRoute.value
      if (!route.matched.length) return undefined
      return options.current
        ? options.current(route)
        : typeof route.name === 'string'
          ? route.name
          : undefined
    }),
    href(key) {
      return router.resolve(options.target?.(key) ?? { name: key }).href
    },
    async navigate(key, { signal }) {
      try {
        await router.isReady()
        if (signal.aborted) return { status: 'cancelled' }
        const failure = await router.push(
          options.target?.(key) ?? { name: key },
        )
        if (
          signal.aborted ||
          isNavigationFailure(failure, NavigationFailureType.cancelled)
        )
          return { status: 'cancelled' }
        if (isNavigationFailure(failure, NavigationFailureType.aborted))
          return { status: 'blocked' }
        if (isNavigationFailure(failure, NavigationFailureType.duplicated))
          return { status: 'unchanged' }
        return { status: 'completed' }
      } catch (error) {
        return signal.aborted
          ? { status: 'cancelled' }
          : { status: 'failed', error }
      }
    },
  }
}
