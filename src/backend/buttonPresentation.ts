import type { UiCollectionActionVariant } from '../collection/action-variant'
import type { UiButtonVariant } from '../presentation/button'
import { Comment, computed, inject, useAttrs, useSlots, isVNode } from 'vue'
import { buttonDefaultVariantKey } from '../presentation/buttonDefaults'
import { useUiStrategy } from '../strategy/context'
import {
  uiButtonVariantQuery,
  uiButtonWidthQuery,
  uiCollectionActionVariantQuery,
} from '../strategy/common'
import type { UiButtonViewProps } from './index'

/** Shared button intent; backend views own native markup, layout and treatment. */
export function useUiButtonPresentation(
  props: UiButtonViewProps,
  defaults: { collectionActionVariant: UiCollectionActionVariant } = {
    collectionActionVariant: 'bordered',
  },
) {
  const slots = useSlots()
  const attrs = useAttrs()
  const defaultVariant = inject(buttonDefaultVariantKey, undefined)
  const preference = useUiStrategy(uiButtonVariantQuery, [
    'filled',
    'outline',
    'neutral',
    'soft',
    'text',
    'icon',
  ])
  const collectionPreference = useUiStrategy(uiCollectionActionVariantQuery, [
    'bordered',
    'soft',
    'text',
  ])
  const widthPreference = useUiStrategy(uiButtonWidthQuery, ['content', 'full'])
  const requested = computed(
    () =>
      props.variant ??
      (props.collectionAction ? collectionVariant() : undefined) ??
      (preference.value.status === 'answered'
        ? preference.value.value
        : props.frame?.owner === 'parent'
          ? 'text'
          : defaultVariant),
  )
  function collectionVariant(): UiButtonVariant {
    const bordered = props.collectionAction!.defaultVariant
    const surface = (value: UiCollectionActionVariant): UiButtonVariant =>
      value === 'bordered' ? bordered : value
    const fallback = surface(defaults.collectionActionVariant)
    const specific =
      collectionPreference.value.status === 'answered'
        ? surface(collectionPreference.value.value)
        : undefined
    const general =
      preference.value.status === 'answered'
        ? preference.value.value === 'icon'
          ? undefined
          : preference.value.value
        : undefined
    if (
      collectionPreference.value.status === 'unanswered' &&
      collectionPreference.value.reason === 'no-agreement'
    )
      return fallback
    if (
      preference.value.status === 'unanswered' &&
      preference.value.reason === 'no-agreement'
    )
      return fallback
    return specific && general && specific !== general
      ? fallback
      : (specific ?? general ?? fallback)
  }
  // These functions run during render so changing slots/text are not cached.
  const variant = () =>
    requested.value === 'icon' && !slots.icon ? 'text' : requested.value
  const iconOnly = () =>
    props.collectionAction?.iconOnly ?? variant() === 'icon'
  const hint = () =>
    (typeof attrs.title === 'string' ? attrs.title : undefined) ??
    (iconOnly()
      ? text(slots.default?.() ?? []).trim() ||
        (typeof attrs['aria-label'] === 'string'
          ? attrs['aria-label']
          : undefined)
      : undefined)
  const width = () =>
    iconOnly() || props.frame?.owner === 'parent'
      ? undefined
      : widthPreference.value.status === 'answered'
        ? widthPreference.value.value
        : undefined
  return { variant, iconOnly, hint, width }
}

function text(nodes: readonly unknown[]): string {
  return nodes
    .map((node) => {
      if (typeof node === 'string' || typeof node === 'number')
        return String(node)
      if (!isVNode(node) || node.type === Comment) return ''
      return typeof node.children === 'string'
        ? node.children
        : Array.isArray(node.children)
          ? text(node.children)
          : ''
    })
    .join('')
}
