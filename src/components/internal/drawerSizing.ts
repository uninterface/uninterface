import {
  computed,
  inject,
  onActivated,
  onDeactivated,
  onUnmounted,
  ref,
  watch,
  watchPostEffect,
} from 'vue'
import {
  drawerHostKey,
  resolveDrawerExtent,
  type UiDrawerMode,
  type UiDrawerSizingProps,
} from '../../layout/drawer'
import type { UiDrawerEdge } from '../../presentation/overlay'
import { resolveUiText } from '../../text/source'
import type { UiDrawerSizingBinding } from '../../backend/drawer'

export function useDrawerSizing(
  props: UiDrawerSizingProps & { mode?: UiDrawerMode; edge: UiDrawerEdge },
  id: string,
  active: () => boolean,
  disabled: () => boolean,
) {
  const host = inject(drawerHostKey, undefined)
  const available = ref(1024),
    font = ref(16),
    root = ref(16)
  const memory = ref<Partial<Record<'overlay' | 'docked', number>>>({})
  const docked = computed(() => props.mode === 'docked')
  const metrics = computed(() => {
    if (docked.value) {
      if (!host)
        throw new Error('UiDrawer docked mode requires UiDrawerLayout.')
      const value = host.available.value
      return Math.max(
        0,
        (['start', 'end'].includes(props.edge) ? value.width : value.height) -
          value.minMain,
      )
    }
    return available.value
  })
  const resolved = computed(() =>
    resolveDrawerExtent(
      props,
      metrics.value,
      memory.value[docked.value ? 'docked' : 'overlay'],
      font.value,
      root.value,
    ),
  )
  const sizing = computed<UiDrawerSizingBinding | undefined>(() => {
    const enabled = !!props.resizable
    const label =
      props.resizeLabel === undefined
        ? ''
        : (resolveUiText(props.resizeLabel) ?? '')
    if (enabled && !label.trim())
      throw new Error('Resizable UiDrawer requires resizeLabel.')
    return {
      ...resolved.value,
      label,
      enabled: enabled && active() && !disabled(),
      measure(value, em, rem) {
        available.value = value
        font.value = em
        root.value = rem
      },
      resize(value) {
        if (
          !props.resizable ||
          !active() ||
          disabled() ||
          !Number.isFinite(value)
        )
          return
        const { min, max } = resolved.value
        memory.value = {
          ...memory.value,
          [docked.value ? 'docked' : 'overlay']: Math.max(
            min,
            Math.min(value, max),
          ),
        }
      },
    }
  })
  watch(
    () => [props.preferredExtent, props.edge],
    () => {
      memory.value = {}
    },
  )
  if (host && props.mode !== undefined && props.mode !== 'modal') {
    let release: (() => void) | undefined
    const enabled = ref(true)
    const unregister = () => {
      release?.()
      release = undefined
    }
    onDeactivated(() => {
      enabled.value = false
      unregister()
    })
    onActivated(() => {
      enabled.value = true
    })
    // Overlay-only drawers do not consume a docking allocation. In particular,
    // unrelated page overlays must not compete with a retained docked drawer.
    // Deactivation releases ownership before the incoming page's post-render
    // registration. Cached drawers retain their extent and expansion privately.
    watchPostEffect((cleanup) => {
      if (!docked.value || !enabled.value) return
      release = host.register(
        id,
        computed(() => ({
          edge: props.edge,
          active: active(),
          extent: resolved.value.extent,
        })),
      )
      cleanup(unregister)
    })
    onUnmounted(unregister)
  }
  return { sizing, docked }
}
