<script setup lang="ts">
  import { computed, nextTick, onScopeDispose, ref, watch } from 'vue'
  import Badge from '@uninterface/backend/CollectionQueryBadge.vue'
  import UiLayout from '../../components/UiLayout.vue'
  import UiStrategy from '../../components/UiStrategy.vue'
  import { uiLayoutDensity } from '../../strategy/common'
  import UiMenu from '../../components/UiMenu.vue'
  import UiButton from '../../components/UiButton.vue'
  import UiIcon from '../../components/UiIcon.vue'
  import { createUiEntryControl } from '../../entries/control'
  import type { UiCollectionSortBinding } from '../sort'
  import { useMessages } from '../../i18n/messages'
  const props = defineProps<{ binding: UiCollectionSortBinding }>()
  const messages = useMessages('collections')
  const compact = uiLayoutDensity(-1)
  const addButton = ref<InstanceType<typeof UiButton>>()
  const available = computed(() =>
    props.binding.fields.filter(
      (field) => !props.binding.sort.some((rule) => rule.key === field.key),
    ),
  )
  const canAdd = computed(
    () =>
      !props.binding.disabled &&
      available.value.length > 0 &&
      (props.binding.mode === 'multiple' || !props.binding.sort.length),
  )
  const entries = createUiEntryControl(() =>
    available.value.map((field) => ({
      key: field.key,
      label: field.label,
      kind: 'submenu' as const,
      children: (['asc', 'desc'] as const).map((direction) => ({
        key: JSON.stringify([field.key, direction]),
        label:
          direction === 'asc'
            ? messages.value.collectionSortAscending
            : messages.value.collectionSortDescending,
        icon: {
          name: direction === 'asc' ? 'sort-ascending' : 'sort-descending',
        },
      })),
    })),
  )
  watch(
    () => [available.value, messages.value],
    () => {
      void entries.refresh()
    },
  )
  function add(value: string) {
    const [key, direction] = JSON.parse(value)
    if (
      !canAdd.value ||
      !available.value.some((field) => field.key === key) ||
      !['asc', 'desc'].includes(direction)
    )
      return
    void props.binding.setSort([...props.binding.sort, { key, direction }])
  }
  const label = (key: string) =>
    props.binding.fields.find((field) => field.key === key)?.label ?? key
  const summary = (key: string, direction: string) =>
    `${label(key)}: ${direction === 'asc' ? messages.value.collectionSortAscending : messages.value.collectionSortDescending}`
  async function move(key: string, target: number) {
    const index = props.binding.sort.findIndex((rule) => rule.key === key)
    if (
      props.binding.disabled ||
      props.binding.mode !== 'multiple' ||
      index < 0 ||
      index === target ||
      target < 0 ||
      target >= props.binding.sort.length
    )
      return false
    const next = [...props.binding.sort]
    const [rule] = next.splice(index, 1)
    next.splice(target, 0, rule)
    return props.binding.setSort(next)
  }
  async function remove(key: string) {
    if (
      props.binding.disabled ||
      !props.binding.sort.some((rule) => rule.key === key)
    )
      return
    await props.binding.setSort(
      props.binding.sort.filter((rule) => rule.key !== key),
    )
    await nextTick()
    void addButton.value?.focus()
  }
  onScopeDispose(() => entries.dispose())
  const messagesReady = messages.ready
</script>
<template>
  <UiStrategy
    v-if="messagesReady"
    :use="compact"
  >
    <UiLayout
      direction="horizontal"
      wrap
      align="center"
      role="group"
      :aria-label="messages.collectionSort"
      data-ui-collection-sort-badges
    >
      <Badge
        v-for="(rule, index) in binding.sort"
        :key="rule.key"
        :label="summary(rule.key, rule.direction)"
        :remove-label="`${label(rule.key)}: ${messages.collectionRemoveSort}`"
        :disabled="binding.disabled"
        :reorder="
          binding.mode === 'multiple' && binding.sort.length > 1
            ? {
                key: rule.key,
                keys: binding.sort.map((item) => item.key),
                label: messages.collectionSortPosition
                  .replace('{label}', summary(rule.key, rule.direction))
                  .replace('{position}', String(index + 1))
                  .replace('{count}', String(binding.sort.length)),
                hint: messages.collectionSortReorderHint,
                move: (target: number) => move(rule.key, target),
              }
            : undefined
        "
        :data-ui-sort-badge="rule.key"
        :data-ui-sort-direction="rule.direction"
        @remove="remove(rule.key)"
      >
        <span>{{ label(rule.key) }}</span>
        <UiIcon
          :name="
            rule.direction === 'asc' ? 'sort-ascending' : 'sort-descending'
          "
        />
        <template #remove><UiIcon name="close" /></template>
      </Badge>
      <UiMenu
        :control="entries"
        mode="popup"
        :aria-label="messages.collectionAddSort"
        @activate="add"
      >
        <template #host="{ buttonTrigger }">
          <UiButton
            ref="addButton"
            v-bind="buttonTrigger"
            variant="text"
            :disabled="!canAdd"
          >
            <template #icon><UiIcon name="add" /></template>
            {{ messages.collectionAddSort }}
          </UiButton>
        </template>
      </UiMenu>
    </UiLayout>
  </UiStrategy>
</template>
