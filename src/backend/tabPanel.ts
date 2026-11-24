import { nextTick, ref, watch } from 'vue'
import type { UiTabPanelViewProps } from './index'
/** DOM-only focus recovery; does not select panels or move focus on ordinary activation. */
export function useUiTabPanel(props: UiTabPanelViewProps) {
  const element = ref<HTMLElement>()
  watch(
    () => props.selected,
    (selected) => {
      const panel = element.value
      const document = panel?.ownerDocument
      const previous = document?.activeElement
      if (selected || !panel || !previous || !panel.contains(previous)) return
      void nextTick(() => {
        if (props.selected || !panel.isConnected || !document) return
        // Respect a business operation which already moved focus elsewhere.
        if (
          document.activeElement !== previous &&
          document.activeElement !== document.body
        )
          return
        const target = document.getElementById(props.activeTabId)
        target?.focus()
        if (target && document.activeElement !== target) {
          const panelId = target.getAttribute('aria-controls')
          if (panelId) document.getElementById(panelId)?.focus()
        }
      })
    },
  )
  return { element }
}
