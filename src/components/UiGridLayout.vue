<script lang="ts">
  import { withDirectives } from 'vue'
  import { useZAllocations } from '../stacking/allocation'
  import { useUiZView, useUiZPart } from '../stacking/view'
  import { useZComponent } from '../stacking/runtime'
  import { zLayoutProps } from '../stacking/props'

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import {
    defineComponent,
    h,
    mergeProps,
    provide,
    ref,
    type CSSProperties,
    type PropType,
    type SlotsType,
    type VNode,
  } from 'vue'
  import { uiBackend } from '@uninterface/backend'
  import { uiLayoutPresentation } from '@uninterface/backend/layout'
  import { uiLayoutDensityQuery } from '../strategy/common'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { availableHeightKey } from '../layout/hosting'
  import { layoutChildren } from '../layout/linear'
  import { resolveGrid, type UiGridLayoutProps } from '../layout/grid'

  export default defineComponent({
    name: 'UiGridLayout',
    inheritAttrs: false,
    props: {
      ...zLayoutProps,
      columns: { type: Number, required: true },
      height: String as PropType<UiGridLayoutProps['height']>,
      scroll: String as PropType<UiGridLayoutProps['scroll']>,
      ariaLabel: String,
    },
    slots: Object as SlotsType<{ default?: () => VNode[] }>,
    setup(props, { slots, attrs }) {
      const z = useZComponent()
      useUiZView({ self: true })
      const parts = useZAllocations(z.binding, () => props.zParts)
      const node = useUiStrategyNode('grid-layout')
      provideStrategyView(node)
      const density = node.query(
        uiLayoutDensityQuery,
        (value) =>
          value === 0 || !!uiLayoutPresentation.peerSpacingLevels?.[value],
      )
      provide(availableHeightKey, ref(undefined))
      assertUiCapabilities(uiBackend, ['layout.grid.v1', 'layout.spacing.v1'])
      const defaultSpacing = uiLayoutPresentation.peerSpacing
      if (
        !defaultSpacing ||
        (!defaultSpacing.class?.trim() && !defaultSpacing.gap?.trim())
      )
        throw new Error('UiGridLayout: backend must supply peer spacing.')
      const zPart = useUiZPart()
      const symbolKeys = new Map<symbol, number>()
      return () => {
        const level =
          density.value.status === 'answered' ? density.value.value : 0
        const spacing =
          (level && uiLayoutPresentation.peerSpacingLevels?.[level]) ||
          defaultSpacing
        for (const name of ['direction', 'division', 'wrap', 'align', 'width'])
          if (name in attrs)
            throw new Error(
              `UiGridLayout: ${name} is not a supported grid property.`,
            )
        if (Object.keys(slots).some((name) => name !== 'default'))
          throw new Error('UiGridLayout: only the default slot is supported.')
        const grid = resolveGrid({ ...props, 'aria-label': props.ariaLabel })
        const children = layoutChildren(slots.default?.() ?? [], symbolKeys)
        const zItems = parts.sync(children)
        const scrolling = grid.scroll !== 'none'
        const style: CSSProperties = {
          display: 'grid',
          boxSizing: 'border-box',
          width: '100%',
          height: grid.height === 'full' ? '100%' : 'auto',
          minWidth: 0,
          minHeight: 0,
          gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
          gridAutoFlow: 'row',
          gridAutoRows: 'max-content',
          alignContent: 'start',
          alignItems: 'stretch',
          justifyItems: 'stretch',
          gap: spacing.gap,
          overflowX: scrolling ? 'auto' : 'visible',
          overflowY: scrolling ? 'auto' : 'visible',
        }
        return h(
          'div',
          mergeProps(attrs, {
            class: [
              spacing.class,
              scrolling ? uiLayoutPresentation.scrollFocus.class : undefined,
            ],
            style,
            role: scrolling ? 'region' : undefined,
            'aria-label': scrolling ? props.ariaLabel : undefined,
            tabindex: scrolling ? 0 : undefined,
          }),
          children.map((child) =>
            withDirectives(
              h(
                'div',
                {
                  key: child.key,
                  style: { minWidth: 0, minHeight: 0 },
                },
                [parts.wrap(child.key, child.node)],
              ),
              [[zPart, zItems[child.key]]],
            ),
          ),
        )
      }
    },
  })
</script>
