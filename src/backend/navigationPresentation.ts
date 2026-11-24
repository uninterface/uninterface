import {
  computed,
  shallowRef,
  nextTick,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  onDeactivated,
  onActivated,
  ref,
  useId,
  watch,
  type Ref,
} from 'vue'
import type { UiNavMenuViewBinding, UiEntryViewNode } from './index'
import { useUiMenuPopup } from './menuView'
import { useUiTooltipAnchorVisibility } from './tooltipGeometry'

/** Optional backend mechanics: animate actual allocation changes, retain focus,
 * and expose a labelled rail hint. Concrete markup and theme stay backend-owned. */
export function useUiNavigationPresentation(
  binding: () => UiNavMenuViewBinding,
  surface: Ref<HTMLElement | undefined>,
) {
  const ownedSurfaces = useUiMenuPopup(surface)
  let previous = binding().presentation
  let size: { width: number; height: number } | undefined
  let focusPath: string[] = []
  let animation: Animation | undefined
  let revision = 0
  const hint = ref<{ label: string; x: number; y: number }>()
  const hintId = useId()
  const hinted = shallowRef<HTMLElement>()
  const hintVisible = useUiTooltipAnchorVisibility(
    () => hinted.value,
    () => Boolean(hint.value),
  )
  let oldDescription: string | null = null
  let dismissing = false
  function restoreDescription(row: HTMLElement) {
    if (oldDescription === null) row.removeAttribute('aria-describedby')
    else row.setAttribute('aria-describedby', oldDescription)
  }
  function hideHint() {
    if (hinted.value) restoreDescription(hinted.value)
    hinted.value = undefined
    hint.value = undefined
  }
  watch(
    [hinted, hintVisible],
    ([row, visible]) => {
      if (!row) return
      if (visible)
        row.setAttribute(
          'aria-describedby',
          [oldDescription, hintId].filter(Boolean).join(' '),
        )
      else restoreDescription(row)
    },
    { flush: 'post' },
  )
  function showHint(event: Event) {
    if (dismissing || binding().presentation !== 'icon-popup') return
    const row = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-entry-key]',
    )
    if (!row || !surface.value?.contains(row) || row.closest('[data-parent]'))
      return
    if (expandedRoot(row)) {
      hideHint()
      return
    }
    const label = row.getAttribute('aria-label') ?? row.textContent?.trim()
    if (!label) return
    hideHint()
    hinted.value = row
    oldDescription = row.getAttribute('aria-describedby')
    const box = row.getBoundingClientRect()
    hint.value = {
      label,
      x: Math.max(8, Math.min(box.left, window.innerWidth - 208)),
      y: box.bottom + 4,
    }
    void nextTick(() => {
      if (hinted.value !== row || !hint.value) return
      const bounds = document.getElementById(hintId)?.getBoundingClientRect()
      if (!bounds) return
      hint.value = {
        ...hint.value,
        x: Math.max(
          8,
          Math.min(hint.value.x, window.innerWidth - bounds.width - 8),
        ),
        y: Math.max(
          8,
          Math.min(hint.value.y, window.innerHeight - bounds.height - 8),
        ),
      }
    })
  }
  function dismissHint(event: KeyboardEvent) {
    if (
      event.key === 'Escape' &&
      hint.value &&
      surface.value?.contains(event.target as Node)
    ) {
      dismissing = true
      hideHint()
      void nextTick(() => {
        dismissing = false
      })
    }
  }
  const events = {
    onPointerover: showHint,
    onPointerleave: hideHint,
    onFocusin: showHint,
    onFocusout: hideHint,
  }
  function expandedRoot(row: HTMLElement) {
    const find = (nodes: readonly UiEntryViewNode[]): boolean =>
      nodes.some((node) =>
        node.entry.kind === 'group'
          ? find(node.children ?? [])
          : node.entry.key === row.dataset.entryKey && Boolean(node.expanded),
      )
    return find(binding().entries)
  }
  function path(
    nodes: readonly UiEntryViewNode[],
    key: string,
    ancestors: string[] = [],
  ): string[] {
    for (const node of nodes) {
      const next =
        node.entry.kind === 'group' ? ancestors : [...ancestors, node.entry.key]
      if (node.entry.key === key) return next
      const found = path(node.children ?? [], key, next)
      if (found.length) return found
    }
    return []
  }
  onBeforeUpdate(() => {
    // Native hover/click expansion can occur after the label has appeared.
    // The open submenu replaces that hint; returning to its trigger must not
    // bring the hint back over the popup.
    if (hinted.value && expandedRoot(hinted.value)) hideHint()
    if (binding().presentation === previous) return
    const bounds = surface.value?.getBoundingClientRect()
    size = bounds && { width: bounds.width, height: bounds.height }
    animation?.cancel()
    hideHint()
    const active = document.activeElement as HTMLElement | null
    focusPath =
      active && ownedSurfaces.contains(active)
        ? path(
            binding().entries,
            active.closest<HTMLElement>('[data-entry-key]')?.dataset.entryKey ??
              '',
          )
        : []
    previous = binding().presentation
  })
  onUpdated(async () => {
    if (size === undefined) return
    const before = size
    size = undefined
    const token = ++revision
    await nextTick()
    const root = surface.value
    if (!root || token !== revision) return
    const after = root.getBoundingClientRect()
    if (
      root.animate &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches &&
      (Math.abs(before.width - after.width) > 1 ||
        Math.abs(before.height - after.height) > 1)
    )
      animation = root.animate(
        [
          { width: `${before.width}px`, height: `${before.height}px` },
          { width: `${after.width}px`, height: `${after.height}px` },
        ],
        { duration: 180, easing: 'ease-out' },
      )
    if (
      focusPath.length &&
      (!document.activeElement ||
        document.activeElement === document.body ||
        root.contains(document.activeElement))
    ) {
      const rows = [...root.querySelectorAll<HTMLElement>('[data-entry-key]')]
      for (const key of focusPath.reverse()) {
        const row = rows.find(
          (row) =>
            row.dataset.entryKey === key &&
            !row.closest('[hidden], [inert], [style*="display: none"]'),
        )
        if (row) {
          row.focus({ preventScroll: true })
          break
        }
      }
    }
    focusPath = []
  })
  function cleanup() {
    revision++
    animation?.cancel()
    hideHint()
  }
  function listen() {
    window.addEventListener('scroll', hideHint, true)
    window.addEventListener('keydown', dismissHint, true)
  }
  function unlisten() {
    cleanup()
    window.removeEventListener('scroll', hideHint, true)
    window.removeEventListener('keydown', dismissHint, true)
  }
  onMounted(listen)
  onActivated(listen)
  onDeactivated(unlisten)
  onBeforeUnmount(unlisten)
  return {
    hint: computed(() => (hintVisible.value ? hint.value : undefined)),
    hintId,
    hintAnchor: hinted,
    events,
  }
}
