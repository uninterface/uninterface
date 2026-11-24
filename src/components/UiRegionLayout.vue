<script lang="ts">
  import { useZDecoration } from '../stacking/decoration'
  import { useZAllocations } from '../stacking/allocation'
  import { useZComponent } from '../stacking/runtime'
  import { zLayoutProps } from '../stacking/props'

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import {
    defineComponent,
    inject,
    provide,
    ref,
    shallowRef,
    onUnmounted,
    h,
    type PropType,
    type SlotsType,
    type VNode,
  } from 'vue'
  import {
    navigationBoundaryKey,
    type NavigationBoundaryHost,
  } from '../navigation/boundary'
  import View from '@uninterface/backend/UiLayout.vue'
  import { resolveLayout } from '../layout/linear'
  import { fitVerticalResize } from '../layout/vertical-resize'
  import {
    resolveRegionFraming,
    resolveResizeBoundaries,
    resizeRegionBoundary,
  } from '../layout/region-boundaries'
  import { uiLayoutFramingQuery } from '../strategy/layout-framing'
  import {
    isLayoutFraming,
    resolveLayoutFraming,
  } from '../presentation/layout-framing'
  import type { UiLayoutViewBinding } from '../backend'
  import GroupView from '@uninterface/backend/UiRegionLayout.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { availableHeightKey } from '../layout/hosting'
  import { resolveScrollPolicy } from '../layout/scroll-policy'
  import {
    hasRegionContent,
    regionNames,
    resolveRegions,
    type UiRegionLayoutProps,
  } from '../layout/regions'

  // One component child is one UiLayout allocation, even with multiple roots.
  const RegionContent = defineComponent({
    name: 'UiRegionContent',
    props: { navigationBoundary: Object as PropType<NavigationBoundaryHost> },
    setup(props, { slots }) {
      // Region content does not inherit the entire outer host's allocation.
      provide(availableHeightKey, ref(undefined))
      provide(navigationBoundaryKey, () => props.navigationBoundary)
      return () => slots.default?.()
    },
  })

  export default defineComponent({
    name: 'UiRegionLayout',
    inheritAttrs: false,
    props: {
      ...zLayoutProps,
      navigationRegion: String as PropType<
        UiRegionLayoutProps['navigationRegion']
      >,
      direction: String as PropType<UiRegionLayoutProps['direction']>,
      align: String as PropType<UiRegionLayoutProps['align']>,
      division: Object as PropType<UiRegionLayoutProps['division']>,
      width: String as PropType<UiRegionLayoutProps['width']>,
      height: String as PropType<UiRegionLayoutProps['height']>,
      scroll: String as PropType<UiRegionLayoutProps['scroll']>,
      ariaLabel: String,
      scrollPolicy: Object as PropType<UiRegionLayoutProps['scrollPolicy']>,
      resizeBoundaries: Array as PropType<
        UiRegionLayoutProps['resizeBoundaries']
      >,
    },
    slots: Object as SlotsType<{
      start?: () => VNode[]
      main: () => VNode[]
      end?: () => VNode[]
    }>,
    setup(props, { slots, attrs }) {
      const z = useZComponent()
      const zDecoration = useZDecoration(z.binding)
      const zParts = useZAllocations(z.binding, () => props.zParts, regionNames)
      const node = useUiStrategyNode('region-layout')
      provideStrategyView(node)
      const framing = node.query(
        uiLayoutFramingQuery,
        (value) =>
          isLayoutFraming(value) &&
          Object.keys(value.regions ?? {}).every((name) =>
            regionNames.includes(name as (typeof regionNames)[number]),
          ),
      )
      const adjusted = shallowRef<{
        signature: string
        shares: (number | 'content')[]
      }>()
      const geometry = shallowRef<{
        signature: string
        available: number
        minimum: Readonly<Record<string, number>>
      }>()
      let signature = ''
      let allocationKey = ''
      let allocationRevision = 0
      let alive = true
      onUnmounted(() => {
        alive = false
      })
      const availableHeight = inject(availableHeightKey, ref(undefined))
      let topology: string | undefined
      return () => {
        if (!slots.main)
          throw new Error('UiRegionLayout: a main slot is required.')
        for (const name of Object.keys(slots)) {
          if (!regionNames.includes(name as (typeof regionNames)[number]))
            throw new Error(`UiRegionLayout: unsupported slot ${name}.`)
        }
        if (
          props.navigationRegion !== undefined &&
          !['start', 'end'].includes(props.navigationRegion)
        )
          throw new Error(
            'UiRegionLayout: navigationRegion must be start or end.',
          )
        if ((props.align as string) === 'baseline')
          throw new Error(
            'UiRegionLayout: baseline alignment is only supported by UiLayout and UiFlowLayout.',
          )
        const regions = regionNames
          .map((name) => ({ name, nodes: slots[name]?.() ?? [] }))
          .filter(
            ({ name, nodes }) => name === 'main' || hasRegionContent(nodes),
          )
        const group = resolveScrollPolicy({
          ...props,
          'aria-label': props.ariaLabel,
        })
        const currentTopology = group
          ? JSON.stringify([group.id, group.regions])
          : 'flow'
        if (topology !== undefined && topology !== currentTopology)
          throw new Error(
            'UiRegionLayout: changing scroll group membership requires a new layout instance.',
          )
        topology = currentTopology
        const presentation = resolveLayoutFraming(
          framing.value.status === 'answered'
            ? framing.value.value
            : props.navigationRegion
              ? { separators: 'visible' }
              : {},
        )
        const zItems = zParts.sync(
          regions.map((r) => ({ key: r.name, name: r.name })),
        )
        const hasFraming =
          framing.value.status === 'answered' || Boolean(props.navigationRegion)
        const hasExtensions =
          hasFraming || Boolean(props.resizeBoundaries?.length)
        if (group) {
          if (hasExtensions)
            throw new Error(
              'UiRegionLayout: framing and resizing currently require an ordinary region arrangement.',
            )
          assertUiCapabilities(uiBackend, ['layout.region-scroll.v1'])
          if (availableHeight.value === undefined)
            throw new Error(
              'UiRegionLayout: scroll-policy requires a bounded space offer from its host.',
            )
          return h(
            GroupView,
            {
              ...attrs,
              binding: {
                height: availableHeight.value,
                regions: regions.map(({ name }) => name),
                group,
                zItems,
                'aria-label': props.ariaLabel!,
              },
            },
            Object.fromEntries(
              regions.map(({ name, nodes }) => [
                name,
                () =>
                  h(
                    RegionContent,
                    { key: name },
                    { default: () => zParts.wrap(name, nodes) },
                  ),
              ]),
            ),
          )
        }
        const names = regions.map(({ name }) => name)
        const initialDivision = resolveRegions(props, names)
        // The declaration, not an incidental rerender or translated label, resets adjustment.
        const nextAllocationKey = JSON.stringify([
          names,
          props.direction,
          props.width,
          props.height,
          initialDivision,
          props.resizeBoundaries?.map(({ between, min, max }) => [
            between,
            min,
            max,
          ]),
        ])
        if (nextAllocationKey !== allocationKey) {
          allocationKey = nextAllocationKey
          signature = String(++allocationRevision)
        }
        const currentShares = () =>
          adjusted.value?.signature === signature
            ? adjusted.value.shares
            : initialDivision
        // Validate declared limits before using them to propagate content minima.
        resolveResizeBoundaries(props, names, initialDivision)
        const fitted = () =>
          geometry.value?.signature === signature &&
          props.direction !== 'horizontal' &&
          Object.keys(geometry.value.minimum).length > 0 &&
          props.resizeBoundaries?.length
            ? fitVerticalResize(
                props,
                names,
                currentShares(),
                geometry.value.available,
                geometry.value.minimum,
              )
            : undefined
        const sizing = fitted()
        const division = sizing?.shares ?? currentShares()
        const resolved = resolveLayout(
          { ...props, division, 'aria-label': props.ariaLabel },
          names.length,
        )
        const boundaries = resolveResizeBoundaries(
          props,
          names,
          division,
          sizing?.minimumShares,
        )
        if (boundaries.length && resolved.align !== 'stretch')
          throw new Error(
            'UiRegionLayout: resizing requires stretched region allocations.',
          )
        const requirements = [
          'layout.regions.v1',
          'layout.linear.v1',
          'layout.reactive.v1',
          'layout.division.v1',
        ]
        if (props.align !== undefined) requirements.push('layout.align.v1')
        if (resolved.scroll !== 'none' || sizing?.overflow)
          requirements.push('layout.scroll.v1')
        if (hasFraming) requirements.push('layout.framing.v1')
        if (boundaries.length) requirements.push('layout.resize.v1')
        assertUiCapabilities(uiBackend, requirements)
        const currentSignature = signature
        const binding: UiLayoutViewBinding = {
          ...resolved,
          spacing: 'none',
          zItems,
          zResize: zDecoration(boundaries.length > 0),
          items: names,
          'aria-label':
            props.ariaLabel ??
            (sizing?.overflow
              ? boundaries.map((b) => b.label).join(', ')
              : undefined),
          framing: hasExtensions
            ? resolveRegionFraming(
                names,
                presentation,
                Object.fromEntries(
                  regionNames.map((name) => [
                    name,
                    zItems[name]?.resolved()?.elevation ?? 0,
                  ]),
                ) as Record<(typeof regionNames)[number], number>,
              )
            : undefined,
          resizeIdentity: signature,
          resizeSizes: sizing?.sizes,
          resizeOverflow: sizing?.overflow,
          measureResize:
            boundaries.length && resolved.direction === 'vertical'
              ? (available, minimum) => {
                  if (
                    !alive ||
                    signature !== currentSignature ||
                    !Number.isFinite(available) ||
                    available < 0 ||
                    Object.values(minimum).some(
                      (value) => !Number.isFinite(value) || value < 0,
                    )
                  )
                    return
                  const next = { signature, available, minimum }
                  if (JSON.stringify(geometry.value) !== JSON.stringify(next))
                    geometry.value = next
                }
              : undefined,
          resizeBoundaries: boundaries.map((boundary) => ({
            ...boundary,
            resize(value: number) {
              if (
                !alive ||
                signature !== currentSignature ||
                !Number.isFinite(value)
              )
                return
              const currentSizing = fitted()
              const shares = currentSizing?.shares ?? currentShares()
              adjusted.value = {
                signature,
                shares: resizeRegionBoundary(
                  props,
                  names,
                  shares,
                  boundary.key,
                  value,
                  currentSizing?.minimumShares,
                ),
              }
            },
          })),
        }
        const navigationBoundary = (
          name: (typeof regionNames)[number],
        ): NavigationBoundaryHost | undefined => {
          if (name !== props.navigationRegion) return undefined
          const horizontal = resolved.direction === 'horizontal'
          return {
            axis: horizontal ? 'vertical' : 'horizontal',
            edge: horizontal
              ? name === 'start'
                ? 'inline-end'
                : 'inline-start'
              : name === 'start'
                ? 'block-end'
                : 'block-start',
          }
        }
        return h(
          View,
          { ...attrs, binding },
          Object.fromEntries(
            regions.map(({ name, nodes }) => [
              name,
              () =>
                h(
                  RegionContent,
                  { key: name, navigationBoundary: navigationBoundary(name) },
                  { default: () => zParts.wrap(name, nodes) },
                ),
            ]),
          ),
        )
      }
    },
  })
</script>
