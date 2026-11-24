<script lang="ts">
  import { useUiZView } from '../stacking/view'
  import { useZComponent } from '../stacking/runtime'
  import { zOrderProps } from '../stacking/props'

  import {
    defineComponent,
    h,
    inject,
    ref,
    type PropType,
    type SlotsType,
    type VNode,
  } from 'vue'
  import UiButton from './internal/UiCollectionActionButton.vue'
  import type { UiButtonBinding } from '../bindings/button'
  import type { UiThemeColor } from '../presentation/theme'
  import type { UiButtonVariant } from '../presentation/button'
  import { collectionButtonPresentation } from './internal/collection-fields'
  import { hasRegionContent } from '../layout/regions'
  export default defineComponent({
    name: 'UiCollectionButton',
    inheritAttrs: false,
    props: {
      ...zOrderProps,
      binding: Object as PropType<UiButtonBinding>,
      form: String,
      type: String as PropType<'button' | 'submit' | 'reset'>,
      color: String as PropType<UiThemeColor>,
      variant: String as PropType<UiButtonVariant>,
      defaultVariant: String as PropType<UiButtonVariant>,
      disabled: { type: Boolean, default: undefined },
      loading: { type: Boolean, default: undefined },
      presentation: String as PropType<'text' | 'icon' | 'icon+text'>,
    },
    slots: Object as SlotsType<{
      default?: () => VNode[]
      icon?: () => VNode[]
    }>,
    setup(props, { slots, attrs, expose }) {
      useZComponent()
      useUiZView({ self: true })
      const preference = inject(collectionButtonPresentation, undefined)
      if (!preference)
        throw new Error('UiCollectionButton requires UiCollectionView.')
      const button = ref<InstanceType<typeof UiButton>>()
      expose({ focus: () => button.value?.focus() })
      return () => {
        for (const name of ['variant', 'defaultVariant'] as const) {
          const value = props[name]
          if (
            value !== undefined &&
            !['filled', 'outline', 'neutral', 'soft', 'text', 'icon'].includes(
              value,
            )
          )
            throw new Error(`Unsupported collection button ${name}: ${value}`)
        }
        const mode = props.presentation ?? preference.value
        if (!['text', 'icon', 'icon+text'].includes(mode))
          throw new Error('Unsupported collection button presentation.')
        const label = slots.default?.() ?? []
        if (!hasRegionContent(label))
          throw new Error(
            'UiCollectionButton requires a label in its default slot.',
          )
        const icon = mode === 'text' ? [] : (slots.icon?.() ?? [])
        const hasIcon = hasRegionContent(icon)
        const { presentation: _, zOrder: _zOrder, ...buttonProps } = props
        return h(
          UiButton,
          {
            ...attrs,
            ...buttonProps,
            ref: button,
            iconOnly: mode === 'icon' && hasIcon,
            defaultVariant:
              props.defaultVariant ??
              (mode === 'icon' && hasIcon ? 'icon' : 'text'),
            variant: props.variant === 'icon' ? undefined : props.variant,
          },
          { default: () => label, ...(hasIcon ? { icon: () => icon } : {}) },
        )
      }
    },
  })
</script>
