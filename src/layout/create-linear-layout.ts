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
import { flowSpacer } from './flow'
import { layoutChildren, resolveLayout, type UiLayoutOptions } from './linear'
import { hasRegionContent } from './regions'
import { layoutSeparator } from './separator'

const startEndGroups = ['start', 'end'] as const

// Private composition shares allocation logic without exposing spacing props.
export function createLinearLayout(
  spacing: 'peers' | 'none',
  arrangement?: 'flow' | 'start-end',
) {
  const startEnd = arrangement === 'start-end'
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
      const zParts = useZAllocations(
        z.binding,
        () => props.zParts,
        startEnd ? startEndGroups : undefined,
      )
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
        const declared = startEnd
          ? startEndGroups.flatMap((name) => {
              const nodes = slots[name]?.() ?? []
              return hasRegionContent(nodes) ? [{ key: name, name, nodes }] : []
            })
          : layoutChildren(slots.default?.() ?? [], symbolKeys)
        const isSeparator = (child: (typeof declared)[number]) =>
          'node' in child &&
          (child.node.type as { [layoutSeparator]?: boolean })[layoutSeparator]
        const hasSeparators = declared.some(isSeparator)
        const children = declared.filter((child) => !isSeparator(child))
        const spacers =
          arrangement === 'flow'
            ? children
                .filter(
                  (child) =>
                    'node' in child &&
                    (child.node.type as { [flowSpacer]?: boolean })[flowSpacer],
                )
                .map(({ key }) => key)
            : []
        const spacerKeys = new Set(spacers)
        const separators: { first: string; second: string }[] = []
        let previous: string | undefined
        let boundary = false
        for (const child of declared) {
          if (isSeparator(child)) {
            boundary = true
          } else {
            const key = spacerKeys.has(child.key) ? undefined : child.key
            if (boundary && previous && key)
              separators.push({ first: previous, second: key })
            previous = key
            boundary = false
          }
        }
        const resolved = resolveLayout(
          { ...props, 'aria-label': props.ariaLabel },
          children.length,
        )
        const requirements = new Set(['layout.linear.v1', 'layout.reactive.v1'])
        if (startEnd) requirements.add('layout.start-end.v1')
        if (hasSeparators) requirements.add('layout.separator.v1')
        if (spacers.length) requirements.add('layout.flow-spacer.v1')
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
          startEnd: startEnd || undefined,
          spacers: spacers.length ? spacers : undefined,
          separators: separators.length ? separators : undefined,
          zItems: zParts.sync(children),
        }
        return h(
          View,
          { ...attrs, binding },
          Object.fromEntries(
            children
              .filter(({ key }) => !spacerKeys.has(key))
              .map((child) => [
                child.key,
                () =>
                  zParts.wrap(
                    child.key,
                    'node' in child ? child.node : child.nodes,
                  ),
              ]),
          ),
        )
      }
    },
  })
}
