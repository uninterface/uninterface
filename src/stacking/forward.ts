import { defineComponent, provide, type InjectionKey, type PropType } from 'vue'
import type { ZBinding } from './runtime'
export const zForwardKey: InjectionKey<ZBinding | undefined> =
  Symbol('z-forward')
export const ZDeclarationBinding = defineComponent({
  name: 'UiZDeclarationBinding',
  props: { binding: Object as PropType<ZBinding> },
  setup(props, { slots }) {
    provide(zForwardKey, props.binding)
    return () => slots.default?.()
  },
})
