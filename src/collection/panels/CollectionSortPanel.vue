<script setup lang="ts">
  import { computed, nextTick, onScopeDispose, ref, watch } from 'vue'
  import Layout from '@uninterface/backend/CollectionSortLayout.vue'
  import UiMenu from '../../components/UiMenu.vue'
  import UiButton from '../../components/UiButton.vue'
  import UiIcon from '../../components/UiIcon.vue'
  import { createUiEntryControl } from '../../entries/control'
  import type { UiCollectionSortBinding } from '../sort'
  import { useMessages } from '../../i18n/messages'
  import SortRule from './CollectionSortRule.vue'
  const props = defineProps<{ binding: UiCollectionSortBinding }>()
  const messages = useMessages('collections')
  const supportedKeys = computed(() =>
    props.binding.fields.map((field) => field.key),
  )
  const label = (key: string) =>
    props.binding.fields.find((field) => field.key === key)!.label
  const sort = computed(() => props.binding.sort)
  const available = computed(() =>
    supportedKeys.value.filter(
      (key) => !sort.value.some((rule) => rule.key === key),
    ),
  )
  const addInput = ref<InstanceType<typeof UiButton>>()
  const entries = createUiEntryControl(() =>
    available.value.map((key) => ({ key, label: () => label(key) })),
  )
  watch(available, () => {
    void entries.refresh()
  })
  function add(key: string) {
    if (
      props.binding.disabled ||
      (props.binding.mode === 'single' && sort.value.length) ||
      !available.value.includes(key)
    )
      return
    void props.binding.setSort([...sort.value, { key, direction: 'asc' }])
  }
  function direction(key: string, direction: 'asc' | 'desc') {
    if (props.binding.disabled || !supportedKeys.value.includes(key)) return
    const index = sort.value.findIndex((item) => item.key === key)
    if (index < 0 || sort.value[index].direction === direction) return
    const next = [...sort.value]
    next[index] = { key, direction }
    void props.binding.setSort(next)
  }
  function move(key: string, offset: number) {
    if (props.binding.disabled || props.binding.mode === 'single') return
    const index = sort.value.findIndex((item) => item.key === key)
    const target = index + offset
    if (index < 0 || target < 0 || target >= sort.value.length) return
    const next = [...sort.value]
    ;[next[index], next[target]] = [next[target], next[index]]
    void props.binding.setSort(next)
  }
  function remove(key: string) {
    if (props.binding.disabled || !sort.value.some((item) => item.key === key))
      return
    void props.binding.setSort(sort.value.filter((item) => item.key !== key))
    void nextTick(() => addInput.value?.focus())
  }
  onScopeDispose(() => entries.dispose())
  const messagesReady = messages.ready
</script>
<template>
  <Layout
    v-if="messagesReady"
    part="panel"
    :multiple="binding.mode === 'multiple' && sort.length > 0"
    data-ui-collection-sort-panel
    role="group"
    :aria-label="messages.collectionSort"
  >
    <SortRule
      v-for="(rule, index) in sort"
      :key="rule.key"
      :rule="rule"
      :index="index"
      :count="sort.length"
      :multiple="binding.mode === 'multiple'"
      :label="label(rule.key)"
      :disabled="binding.disabled"
      @direction="direction(rule.key, $event)"
      @move="move(rule.key, $event)"
      @remove="remove(rule.key)"
    />
    <Layout part="add">
      <UiMenu
        :control="entries"
        mode="popup"
        :aria-label="messages.collectionAddSort"
        @activate="add"
      >
        <template #host="{ buttonTrigger }">
          <UiButton
            ref="addInput"
            v-bind="buttonTrigger"
            variant="text"
            :disabled="
              binding.disabled ||
              !available.length ||
              (binding.mode === 'single' && sort.length > 0)
            "
          >
            <template #icon><UiIcon name="add" /></template>
            {{ messages.collectionAddSort }}
          </UiButton>
        </template>
      </UiMenu>
    </Layout>
  </Layout>
</template>
