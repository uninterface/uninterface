import {
  computed,
  onMounted,
  onScopeDispose,
  ref,
  watchEffect,
  type CSSProperties,
  type Ref,
} from 'vue'
import {
  modalWidthExpression,
  validateModalWidthBounds,
  type ModalWidthOptions,
} from '../frame/modal-width'

/** Native-dialog geometry helper, used by the five independently rendered modal surfaces. */
export function useModalWidth(
  props: () => ModalWidthOptions,
  dialog: Ref<HTMLDialogElement | undefined>,
) {
  const viewport = ref<number>(),
    offset = ref(0),
    em = ref<number>(),
    rem = ref<number>()
  let cleanup = () => {}
  function measure() {
    const element = dialog.value
    if (!element) return
    const doc = element.ownerDocument,
      win = doc.defaultView!
    const layoutWidth = doc.documentElement.clientWidth || win.innerWidth
    viewport.value = Math.min(
      layoutWidth,
      win.visualViewport?.width ?? layoutWidth,
    )
    offset.value = Math.max(
      0,
      Math.min(
        win.visualViewport?.offsetLeft ?? 0,
        layoutWidth - viewport.value,
      ),
    )
    em.value = parseFloat(win.getComputedStyle(element).fontSize) || 16
    rem.value =
      parseFloat(win.getComputedStyle(doc.documentElement).fontSize) || 16
  }
  watchEffect(() => {
    if (em.value !== undefined && rem.value !== undefined)
      validateModalWidthBounds(props(), em.value, rem.value)
  })
  onMounted(() => {
    const element = dialog.value
    if (!element) return
    const win = element.ownerDocument.defaultView!
    const resize = win.ResizeObserver
      ? new win.ResizeObserver(measure)
      : undefined
    resize?.observe(element.ownerDocument.documentElement)
    const mutation = new win.MutationObserver(measure)
    for (
      let node: HTMLElement | null = element;
      node;
      node = node.parentElement
    )
      mutation.observe(node, {
        attributes: true,
        attributeFilter: ['class', 'style', 'dir'],
      })
    win.addEventListener('resize', measure)
    win.visualViewport?.addEventListener('resize', measure)
    win.visualViewport?.addEventListener('scroll', measure)
    cleanup = () => {
      resize?.disconnect()
      mutation.disconnect()
      win.removeEventListener('resize', measure)
      win.visualViewport?.removeEventListener('resize', measure)
      win.visualViewport?.removeEventListener('scroll', measure)
    }
    measure()
  })
  onScopeDispose(() => cleanup())
  return computed<CSSProperties>(() => ({
    '--uninterface-modal-viewport-width':
      viewport.value === undefined ? '100dvw' : `${viewport.value}px`,
    '--uninterface-modal-viewport-left': `${offset.value}px`,
    '--uninterface-modal-available-width':
      'max(0px, calc(var(--uninterface-modal-viewport-width) - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px) - 2 * var(--uninterface-modal-edge-clearance, 1rem)))',
    '--uninterface-modal-resolved-width': modalWidthExpression(props()),
    boxSizing: 'border-box',
    position: 'fixed',
    width: 'var(--uninterface-modal-resolved-width)',
    inlineSize: 'var(--uninterface-modal-resolved-width)',
    minWidth: '0px',
    minInlineSize: '0px',
    maxWidth: 'var(--uninterface-modal-available-width)',
    maxInlineSize: 'var(--uninterface-modal-available-width)',
    // Center within the usable viewport, including asymmetric safe-area insets and pinch panning.
    left: 'calc(var(--uninterface-modal-viewport-left) + env(safe-area-inset-left, 0px) + var(--uninterface-modal-edge-clearance, 1rem) + (var(--uninterface-modal-available-width) - var(--uninterface-modal-resolved-width)) / 2)',
    right: 'auto',
    marginLeft: '0px',
    marginRight: '0px',
  }))
}
