import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { settleUiModalMotion } from './modalView'
import type { UiDrawerLayoutViewProps } from './index'
import { useUiZView } from '../stacking/view'
export function useUiDrawerLayoutView(props: UiDrawerLayoutViewProps) {
  const root = ref<HTMLElement>()
  useUiZView({ targets: () => (root.value ? [root.value] : []) })
  let observer: ResizeObserver | undefined
  const measure = () => {
    if (root.value)
      props.measure(root.value.clientWidth, root.value.clientHeight)
  }
  onMounted(() => {
    measure()
    observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(measure)
    if (root.value) observer?.observe(root.value)
  })
  onBeforeUnmount(() => observer?.disconnect())
  watch(() => [props.edge, props.height], measure)
  // Different edges can exchange the flexible and fixed tracks. Interpolating
  // those topologies can allocate the whole host to the drawer mid-transition.
  // Reconfigure both allocation and retained surface together, then restore
  // ordinary entry/exit motion after the native enter classes have settled.
  let reconfigure = 0
  let frame: number | undefined
  let disposed = false
  watch(
    () => props.edge,
    async () => {
      const current = ++reconfigure
      const element = root.value
      if (!element) return
      if (frame !== undefined) cancelAnimationFrame(frame)
      element.setAttribute('data-ui-drawer-reconfigure', '')
      await nextTick()
      if (disposed || current !== reconfigure) return
      const settle = (remaining: number) => {
        frame = requestAnimationFrame(() => {
          if (remaining) settle(remaining - 1)
          else {
            frame = undefined
            element.removeAttribute('data-ui-drawer-reconfigure')
          }
        })
      }
      settle(2)
    },
    { flush: 'pre' },
  )
  onBeforeUnmount(() => {
    disposed = true
    if (frame !== undefined) cancelAnimationFrame(frame)
  })
  let generation = 0
  watch(
    () => props.active,
    async () => {
      const current = ++generation
      const element = root.value
      if (!element) return
      element.setAttribute('data-ui-drawer-motion', '')
      await nextTick()
      void element.offsetWidth
      await settleUiModalMotion(element)
      if (current === generation)
        element.removeAttribute('data-ui-drawer-motion')
    },
    { flush: 'pre' },
  )
  const style = computed(() => {
    const vertical = ['top', 'bottom'].includes(props.edge),
      first = ['start', 'top'].includes(props.edge)
    return {
      display: 'grid',
      minWidth: '0',
      minHeight: '0',
      height: props.height === 'full' ? '100%' : undefined,
      gridTemplateColumns: vertical
        ? 'minmax(0, 1fr)'
        : first
          ? `${props.active ? props.extent : 0}px minmax(0, 1fr)`
          : `minmax(0, 1fr) ${props.active ? props.extent : 0}px`,
      gridTemplateRows: !vertical
        ? 'minmax(0, 1fr)'
        : first
          ? `${props.active ? props.extent : 0}px minmax(0, 1fr)`
          : `minmax(0, 1fr) ${props.active ? props.extent : 0}px`,
    }
  })
  const mainStyle = computed(() => ({
    minWidth: '0',
    minHeight: '0',
    gridColumn: ['top', 'bottom'].includes(props.edge)
      ? '1'
      : props.edge === 'start'
        ? '2'
        : '1',
    gridRow: props.edge === 'top' ? '2' : '1',
  }))
  const drawerStyle = computed(() => ({
    minWidth: '0',
    minHeight: '0',
    gridColumn: ['top', 'bottom'].includes(props.edge)
      ? '1'
      : props.edge === 'end'
        ? '2'
        : '1',
    gridRow: props.edge === 'bottom' ? '2' : '1',
  }))
  return { root, style, mainStyle, drawerStyle }
}
