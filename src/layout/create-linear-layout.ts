import { useZComponent } from '../stacking/runtime'
import { useZAllocations } from '../stacking/allocation'
import { zLayoutProps } from '../stacking/props'
import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
import { defineComponent, h, provide, ref, type PropType } from 'vue'
import View from '@uninterface/backend/UiLayout.vue'
import { uiBackend } from '@uninterface/backend'
import { uiLayoutPresentation } from '@uninterface/backend/layout'
import { uiLayoutDensityQuery } from '../strategy/common'
import { assertUiCapabilities } from '../backend/capabilities'
import { availableHeightKey } from './hosting'
import { layoutChildren, resolveLayout, type UiLayoutOptions } from './linear'

// Private composition shares allocation logic without exposing spacing props.
export function createLinearLayout(spacing: 'peers' | 'none') {
  return defineComponent({
    name: spacing === 'peers' ? 'UiLayout' : 'UiRegionAllocation',
    inheritAttrs: false,
    props: {
      ...zLayoutProps,
      direction: String as PropType<UiLayoutOptions['direction']>,
      align: String as PropType<UiLayoutOptions['align']>,
      division: [String, Array] as PropType<UiLayoutOptions['division']>,
      width: String as PropType<UiLayoutOptions['width']>,
      height: String as PropType<UiLayoutOptions['height']>,
      wrap: { type: Boolean, default: undefined },
      scroll: String as PropType<UiLayoutOptions['scroll']>,
      ariaLabel: String,
    },
    setup(props, { slots, attrs }) {
      const z = useZComponent()
      const zParts = useZAllocations(z.binding, () => props.zParts)
      const node = spacing === 'peers' ? useUiStrategyNode('layout') : undefined
      if (node) provideStrategyView(node)
      const density = node?.query(
        uiLayoutDensityQuery,
        (value) =>
          value === 0 || !!uiLayoutPresentation.peerSpacingLevels?.[value],
      )
      // Children receive allocations, not the enclosing application's full offer.
      provide(availableHeightKey, ref(undefined))
      const symbolKeys = new Map<symbol, number>()
      return () => {
        const children = layoutChildren(slots.default?.() ?? [], symbolKeys)
        const resolved = resolveLayout(
          { ...props, 'aria-label': props.ariaLabel },
          children.length,
        )
        const requirements = new Set(['layout.linear.v1', 'layout.reactive.v1'])
        if (resolved.division !== 'content')
          requirements.add('layout.division.v1')
        if (resolved.wrap) requirements.add('layout.wrap.v1')
        if (props.align !== undefined) requirements.add('layout.align.v1')
        if (resolved.align === 'baseline')
          requirements.add('layout.baseline.v1')
        if (resolved.scroll !== 'none') requirements.add('layout.scroll.v1')
        assertUiCapabilities(uiBackend, [...requirements])
        const binding = {
          spacing,
          density:
            density?.value.status === 'answered'
              ? density.value.value
              : undefined,
          ...resolved,
          'aria-label': props.ariaLabel,
          items: children.map((child) => child.key),
          zItems: zParts.sync(children),
        }
        return h(
          View,
          { ...attrs, binding },
          Object.fromEntries(
            children.map((child) => [
              child.key,
              () => zParts.wrap(child.key, child.node),
            ]),
          ),
        )
      }
    },
  })
}
