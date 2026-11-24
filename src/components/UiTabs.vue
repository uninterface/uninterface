<script lang="ts">
  import { useZDeclarations } from '../stacking/declarations'
  import { useZComponent } from '../stacking/runtime'
  import { zOrderProps } from '../stacking/props'

  import {
    Comment,
    Fragment,
    Text,
    defineComponent,
    h,
    onBeforeUnmount,
    type PropType,
    type VNode,
    type Slots,
  } from 'vue'
  import View from '@uninterface/backend/UiTabs.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import type { UiTabsBinding } from '../bindings/tabs'
  import {
    declareTabs,
    releaseTabs,
    tabIdentity,
    useTabAssociationCheck,
  } from '../tabs/association'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import UiTab from './UiTab.vue'
  export default defineComponent({
    name: 'UiTabs',
    inheritAttrs: false,
    props: {
      ...zOrderProps,
      binding: { type: Object as PropType<UiTabsBinding>, required: true },
      ariaLabel: String,
      orientation: {
        type: String as PropType<'horizontal' | 'vertical'>,
        default: 'horizontal',
      },
    },
    setup(props, { slots, attrs }) {
      const z = useZComponent()
      const zDeclarations = useZDeclarations(z.binding)
      assertUiCapabilities(uiBackend, ['tabs.v1'])
      provideStrategyView(useUiStrategyNode('tabs'))
      const binding = props.binding,
        owner = {}
      onBeforeUnmount(() => releaseTabs(binding, owner))
      useTabAssociationCheck(binding)
      function declarations(nodes: VNode[]): VNode[] {
        return nodes.flatMap((node) => {
          if (
            node.type === Comment ||
            (node.type === Text && !String(node.children).trim())
          )
            return []
          if (node.type === Fragment)
            return declarations(node.children as VNode[])
          if (node.type !== UiTab)
            throw new Error(
              'UiTabs accepts UiTab declarations, fragments and v-for only.',
            )
          return [node]
        })
      }
      return () => {
        if (props.binding !== binding)
          throw new Error('Changing a tabs binding requires a keyed remount.')
        if (!props.ariaLabel?.trim())
          throw new Error('UiTabs requires a nonempty aria-label.')
        if (!['horizontal', 'vertical'].includes(props.orientation))
          throw new Error('UiTabs: unsupported orientation.')
        const nodes = declarations(slots.default?.() ?? [])
        const zItems = zDeclarations.sync(
          nodes.map((node) => ({ key: String(node.props?.value), node })),
        )
        const items = nodes.map((node) => {
          const {
            value,
            disabled,
            key: _key,
            zOrder: _zOrder,
            'z-order': _zOrderKebab,
            ref: _ref,
            ref_key: _refKey,
            ref_for: _refFor,
            ...attributes
          } = node.props ?? {}
          return {
            key: value as string,
            z: zItems[String(value)],
            ...tabIdentity(binding, String(value)),
            disabled: binding.disabled || disabled === '' || Boolean(disabled),
            selected: binding.selectedKey === value,
            attributes,
          }
        })
        declareTabs(binding, owner, items)
        return h(
          View,
          {
            ...attrs,
            items,
            label: props.ariaLabel!,
            orientation: props.orientation,
            onSelect(key: string) {
              const item = items.find((item) => item.key === key)
              if (
                !binding.disabled &&
                item &&
                !item.disabled &&
                key !== binding.selectedKey
              )
                binding.requestSelected(key)
            },
          },
          {
            default: ({ item }: { item: (typeof items)[number] }) => {
              const node = nodes.find((node) => node.props?.value === item.key)!
              return (node.children as Slots)?.default?.({
                selected: item.selected,
                disabled: item.disabled,
              })
            },
          },
        )
      }
    },
  })
</script>
