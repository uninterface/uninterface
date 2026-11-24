<script setup lang="ts">
  import {
    computed,
    ref,
    inject,
    provide,
    onActivated,
    onDeactivated,
    onScopeDispose,
    watchEffect,
  } from 'vue'
  import type { UiZOrderProps } from '../stacking/authoring'
  import { useZComponent } from '../stacking/runtime'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import {
    filterInternals,
    type UiCollectionFilterBinding,
    type UiFilterPresentationContext,
    type UiFilterCommitResult,
  } from '../collection/filter'
  import {
    filterViewKey,
    filterHostKey,
    defaultFilterPresentation,
    type UiCollectionFilterViewContext,
  } from '../collection/filter-context'
  defineOptions({ inheritAttrs: false })
  useZComponent()
  provideStrategyView(useUiStrategyNode('collection-filter'))
  const props = defineProps<
    UiZOrderProps & {
      binding: UiCollectionFilterBinding
      presentation?: Partial<UiFilterPresentationContext>
    }
  >()
  const emit = defineEmits<{ applied: [result: 'committed' | 'unchanged'] }>()
  defineSlots<{ default?(context: UiCollectionFilterViewContext): unknown }>()
  const host = inject(filterHostKey, undefined)
  const presentation = computed(() => {
    const value = {
      ...(host?.presentation ?? defaultFilterPresentation),
      ...props.presentation,
    }
    if (value.submission !== 'individual')
      throw new Error('Grouped filter submission is not implemented.')
    return Object.freeze(value)
  })
  const native = computed(() => filterInternals(props.binding))
  const owner = Symbol('filter view')
  const visible = ref(true)
  let generation = 0
  watchEffect(
    (cleanup) => {
      if (!visible.value) return
      const release = native.value.claim(owner)
      const unregister = host?.register(props.binding)
      cleanup(() => {
        generation++
        release()
        unregister?.()
      })
    },
    { flush: 'sync' },
  )
  onDeactivated(() => {
    visible.value = false
  })
  onActivated(() => {
    visible.value = true
  })
  onScopeDispose(() => {
    generation++
    visible.value = false
  })
  function applied(result: UiFilterCommitResult) {
    if (visible.value && (result === 'committed' || result === 'unchanged'))
      emit('applied', result)
    return result
  }
  const context: UiCollectionFilterViewContext = Object.freeze({
    get binding() {
      return props.binding
    },
    get editor() {
      return native.value.view
    },
    get presentation() {
      return presentation.value
    },
    async submit() {
      const revision = generation
      const result = await props.binding.commit()
      return revision === generation ? applied(result) : result
    },
    clear() {
      return applied(props.binding.clear())
    },
  })
  provide(filterViewKey, context)
</script>
<template>
  <slot v-bind="context">
    <component
      :is="native.view"
      v-bind="$attrs"
    />
  </slot>
</template>
