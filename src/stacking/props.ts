import type { PropType } from 'vue'
import type { UiZOrder, UiZParts } from './authoring'
export const zOrderProps = { zOrder: Object as PropType<UiZOrder> }
export const zLayoutProps = {
  ...zOrderProps,
  zParts: [Object, Array] as PropType<UiZParts>,
}
