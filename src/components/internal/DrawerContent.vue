<script setup lang="ts">
  import { provide } from 'vue'
  import { navigationBoundaryKey } from '../../navigation/boundary'
  import type { UiDrawerEdge } from '../../presentation/overlay'

  const props = defineProps<{ edge: UiDrawerEdge }>()
  // The drawer frame paints its outward boundary. Matching root navigation
  // relinquishes its standalone edge; the host button stays outside this scope.
  provide(navigationBoundaryKey, () => ({
    axis: ['start', 'end'].includes(props.edge) ? 'vertical' : 'horizontal',
    edge:
      props.edge === 'start'
        ? 'inline-end'
        : props.edge === 'end'
          ? 'inline-start'
          : props.edge === 'top'
            ? 'block-end'
            : 'block-start',
  }))
</script>

<template><slot /></template>
