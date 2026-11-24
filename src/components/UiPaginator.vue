<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { computed } from 'vue'
  import View from '@uninterface/backend/UiPaginator.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import type { UiPaginatorBinding } from '../bindings/list'
  import type { UiPaginatorViewProps } from '../backend/collection'
  import { useMessages } from '../i18n/messages'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiZOrderProps & {
      binding: UiPaginatorBinding
      ariaLabel?: string
    }
  >()
  provideStrategyView(useUiStrategyNode('paginator'))
  assertUiCapabilities(uiBackend, ['paginator.view.v1'])
  const messages = useMessages('collections')
  const view = computed<UiPaginatorViewProps>(() => {
    const b = props.binding,
      m = messages.value
    if (b.target !== 'paginator')
      throw new Error('UiPaginator requires a paginator binding.')
    if (!props.ariaLabel?.trim())
      throw new Error('UiPaginator requires a meaningful aria-label.')
    const page =
      b.accepted?.kind === 'numbered' && b.pageCount !== 0
        ? b.accepted.number
        : undefined
    return {
      label: props.ariaLabel,
      pending: b.pending,
      firstLabel: m.pageFirst,
      previousLabel: m.pagePrevious,
      nextLabel: m.pageNext,
      lastLabel: m.pageLast,
      pageLabel:
        page === undefined ? '' : m.pageNumber.replace('{page}', String(page)),
      canFirst:
        b.canFirst &&
        !b.pending &&
        (page !== undefined
          ? page > 1
          : b.accepted?.kind === 'cursor'
            ? b.accepted.cursor !== null || b.error !== null
            : b.error !== null),
      canLast:
        b.canJump &&
        !b.pending &&
        page !== undefined &&
        b.pageCount !== undefined &&
        page < b.pageCount,
      canPrevious: b.canPrevious,
      canNext: b.canNext,
      canJump: b.canJump && b.accepted !== undefined && b.pageCount !== 0,
      page,
      pageCount: b.pageCount,
      total: b.total,
      acceptedPageSize: b.accepted?.size ?? b.requested.size,
      first: () => (b.pending ? Promise.resolve(false) : b.first()),
      previous: () => b.previous(),
      next: () => b.next(),
      last: () =>
        b.pending ||
        !b.canJump ||
        b.pageCount === undefined ||
        b.pageCount === 0 ||
        (b.accepted?.kind === 'numbered' && b.accepted.number === b.pageCount)
          ? Promise.resolve(false)
          : b.goTo(b.pageCount),
      goTo: (page) =>
        b.pending ||
        (b.accepted?.kind === 'numbered' && page === b.accepted.number)
          ? Promise.resolve(false)
          : b.goTo(page),
      pageName: (page) => m.pageNumber.replace('{page}', String(page)),
    }
  })
  const messagesReady = messages.ready
</script>
<template>
  <View
    v-if="messagesReady"
    v-bind="{ ...$attrs, ...view }"
  />
</template>
