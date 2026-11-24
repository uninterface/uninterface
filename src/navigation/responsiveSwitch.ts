import { readonly, ref, shallowRef, useId, watch } from 'vue'
import type { UiNavigationDrawerControl } from './drawer'

type NavigationSwitchMode = 'inline' | 'drawer'

interface NavigationSwitchOptions {
  mode: () => NavigationSwitchMode
  drawer: () => UiNavigationDrawerControl | undefined
  focusFallback: () => void
}

/** Switch the rendered navigation only after its outgoing drawer can release focus. */
export function useUiResponsiveNavigationSwitch(
  options: NavigationSwitchOptions,
) {
  const mode = ref(options.mode())
  const inlineMenu = shallowRef<{
    ownsTarget(target: Node | null): boolean
  } | null>(null)
  const drawerTrigger = shallowRef<{ focus(): Promise<boolean | null> } | null>(
    null,
  )
  const triggerId = useId()
  let focusAfterSwitch: (() => void) | undefined

  watch(
    options.mode,
    async (requested, _, onCleanup) => {
      if (requested === mode.value || typeof document === 'undefined') return
      let stale = false
      onCleanup(() => (stale = true))

      // The binding reaches the native action through the normal UiButton
      // attribute contract, including toolkits that consume focus events.
      const trigger =
        requested === 'drawer'
          ? undefined
          : Array.from(
              document.querySelectorAll<HTMLElement>(
                '[data-ui-navigation-switch-trigger]',
              ),
            ).find(
              (element) =>
                element.dataset.uiNavigationSwitchTrigger === triggerId,
            )
      const beforeClose = document.activeElement
      const surfaceId = trigger?.getAttribute('aria-controls')
      const focusWasInDrawer = Boolean(
        requested === 'inline' &&
          surfaceId &&
          document.getElementById(surfaceId)?.contains(beforeClose),
      )

      // Keep the outgoing host mounted while its own view releases modality and
      // completes the normal return focus. A new mode request can cancel the switch.
      if (requested === 'inline') await options.drawer()?.close()
      if (stale || requested !== options.mode()) return

      const outgoing = document.activeElement
      const lostDrawerFocus =
        (focusWasInDrawer || beforeClose === trigger) &&
        outgoing === document.body
      const needsFocus =
        requested === 'drawer'
          ? inlineMenu.value?.ownsTarget(outgoing)
          : outgoing === trigger || lostDrawerFocus

      focusAfterSwitch = needsFocus
        ? () => {
            // A surviving control or a destination focused by navigation takes priority.
            if (
              stale ||
              requested !== options.mode() ||
              document.activeElement !== document.body
            )
              return
            if (requested === 'drawer') void drawerTrigger.value?.focus()
            else options.focusFallback()
          }
        : undefined
      mode.value = requested
    },
    { flush: 'sync' },
  )

  // Post-render refs point to the incoming presentation. Consume the pending
  // handoff exactly once, after Vue removes the outgoing focus target.
  watch(
    mode,
    () => {
      const focus = focusAfterSwitch
      focusAfterSwitch = undefined
      focus?.()
    },
    { flush: 'post' },
  )

  return {
    mode: readonly(mode),
    inlineMenu,
    drawerTrigger,
    drawerTriggerBindings: {
      'data-ui-navigation-switch-trigger': triggerId,
    },
  }
}
