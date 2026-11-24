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
    mergeProps,
    type PropType,
    type VNode,
    type Slots,
  } from 'vue'
  import View from '@uninterface/backend/UiBreadcrumbs.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import type {
    UiBreadcrumbsBinding,
    UiLinkBinding,
  } from '../navigation/control'
  import { ordinaryLinkActivation } from '../navigation/control'
  import type { UiBreadcrumbsViewProps } from '../backend'
  import UiBreadcrumb from './UiBreadcrumb.vue'
  import { useMessages } from '../i18n/messages'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  export default defineComponent({
    name: 'UiBreadcrumbs',
    inheritAttrs: false,
    props: {
      ...zOrderProps,
      binding: Object as PropType<UiBreadcrumbsBinding>,
      ariaLabel: String,
    },
    setup(props, { slots, attrs }) {
      const z = useZComponent()
      const zDeclarations = useZDeclarations(z.binding)
      const messages = useMessages('entries')
      assertUiCapabilities(uiBackend, ['breadcrumbs.v1'])
      provideStrategyView(useUiStrategyNode('breadcrumbs'))
      function declarations(nodes: VNode[]): VNode[] {
        return nodes.flatMap((node) => {
          if (
            node.type === Comment ||
            (node.type === Text && !String(node.children).trim())
          )
            return []
          if (node.type === Fragment)
            return declarations(node.children as VNode[])
          if (node.type !== UiBreadcrumb)
            throw new Error(
              'UiBreadcrumbs accepts UiBreadcrumb declarations only.',
            )
          return [node]
        })
      }
      return () => {
        if (!messages.ready.value) return null
        const nodes = declarations(slots.default?.() ?? [])
        if (props.binding && nodes.length)
          throw new Error(
            'UiBreadcrumbs accepts a binding or manual children, not both.',
          )
        const items = props.binding
          ? props.binding.items.map((item) => ({
              key: item.key,
              content: () => item.label,
              props: { binding: item.binding },
            }))
          : nodes.map((node, i) => ({
              key: String(node.key ?? i),
              content: () => (node.children as Slots)?.default?.(),
              props: node.props ?? {},
            }))
        if (new Set(items.map((item) => item.key)).size !== items.length)
          throw new Error('Breadcrumb keys must be unique.')
        const zItems = zDeclarations.sync(
          nodes.map((node, i) => ({ key: String(node.key ?? i), node })),
        )
        const viewItems: UiBreadcrumbsViewProps['items'] = items.map(
          (item, i) => {
            const {
              binding,
              href,
              disabled,
              zOrder: _zOrder,
              'z-order': _zOrderKebab,
              ref: _ref,
              ref_key: _refKey,
              ref_for: _refFor,
              ...attributes
            } = item.props as {
              binding?: UiLinkBinding
              href?: string
              disabled?: boolean | ''
              [key: string]: unknown
            }
            if (binding && href !== undefined)
              throw new Error('UiBreadcrumb accepts href or binding, not both.')
            const current = i === items.length - 1
            // Logical declarations are read before Vue casts Boolean props.
            const locallyDisabled = disabled === '' || Boolean(disabled)
            const unavailable = locallyDisabled || Boolean(binding?.disabled)
            return {
              key: item.key,
              z: zItems[item.key],
              current,
              actionable: !current && Boolean(binding),
              href:
                current || unavailable ? undefined : (binding?.href ?? href),
              disabled: unavailable,
              attributes: mergeProps(
                {
                  onClickCapture(event: MouseEvent) {
                    if (current || locallyDisabled || binding?.disabled) {
                      event.preventDefault()
                      event.stopImmediatePropagation()
                      return
                    }
                    if (binding && ordinaryLinkActivation(event, attributes))
                      binding.request(event)
                  },
                },
                attributes,
              ),
            }
          },
        )
        return h(
          View,
          {
            ...attrs,
            label: props.ariaLabel ?? messages.value.location,
            items: viewItems,
            status: props.binding?.status
              ? {
                  pending: props.binding.status === 'loading',
                  failed: props.binding.status === 'error',
                  retryLabel: messages.value.retry,
                  message:
                    props.binding.status === 'loading'
                      ? messages.value.loading
                      : props.binding.status === 'error'
                        ? messages.value.entriesFailed
                        : props.binding.status === 'missing'
                          ? messages.value.entriesEmpty
                          : '',
                }
              : undefined,
            retry: props.binding?.retry,
          },
          {
            default: ({
              item,
            }: {
              item: { key: string; current: boolean }
            }) => {
              return items.find((v) => v.key === item.key)!.content()
            },
          },
        )
      }
    },
  })
</script>
