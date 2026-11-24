<script setup lang="ts">
  import { computed, nextTick, onScopeDispose, ref, watch } from 'vue'
  import UiLayout from '../../components/UiLayout.vue'
  import UiField from '../../components/UiField.vue'
  import UiSelect from '../../components/UiSelect.vue'
  import UiButton from '../../components/UiButton.vue'
  import UiIcon from '../../components/UiIcon.vue'
  import UiStrategy from '../../components/UiStrategy.vue'
  import { uiFieldLabels } from '../../strategy/common'
  import { createUiFieldControl } from '../../controls/field'
  import { createUiEntryControl } from '../../entries/control'
  import type { UiCollectionSortBinding } from '../sort'
  import { useMessages } from '../../i18n/messages'

  const props = defineProps<{ binding: UiCollectionSortBinding }>()
  const messages = useMessages('collections')
  const hiddenLabel = uiFieldLabels('hidden')
  const picker = ref<InstanceType<typeof UiSelect>>()
  let mounted = true
  // Encoded option keys leave every source key (including empty strings) available.
  const selected = computed(() => props.binding.sort[0])
  const value = () =>
    selected.value ? JSON.stringify([selected.value.key]) : 'none'
  const field = createUiFieldControl(value())
  const choices = createUiEntryControl(() => [
    { key: 'none', label: () => messages.value.collectionNoSort },
    ...props.binding.fields.map((item) => ({
      key: JSON.stringify([item.key]),
      label: item.label,
    })),
  ])
  watch(
    () => [props.binding.fields, messages.value.collectionNoSort],
    () => void choices.refresh(),
  )
  let syncing = false
  function sync() {
    syncing = true
    field.accept(value())
    syncing = false
  }
  watch(() => [props.binding, value()], sync, { flush: 'sync' })
  watch(
    () => field.state.input,
    (next) => {
      if (syncing) return
      const binding = props.binding
      const entry = binding.fields.find(
        (item) => JSON.stringify([item.key]) === next,
      )
      if (
        binding.disabled ||
        binding.mode !== 'single' ||
        (next !== 'none' && !entry)
      ) {
        sync()
        return
      }
      const sort = entry
        ? [
            {
              key: entry.key,
              direction: selected.value?.direction ?? ('asc' as const),
            },
          ]
        : []
      // Source state remains authoritative, including rejected operations.
      void binding.setSort(sort).then(sync, sync)
    },
    { flush: 'sync' },
  )
  function toggle() {
    const rule = selected.value
    if (
      props.binding.disabled ||
      props.binding.mode !== 'single' ||
      !rule ||
      !props.binding.fields.some((field) => field.key === rule.key)
    )
      return
    void props.binding.setSort([
      { key: rule.key, direction: rule.direction === 'asc' ? 'desc' : 'asc' },
    ])
  }
  function remove() {
    const binding = props.binding
    if (binding.disabled || binding.mode !== 'single' || !selected.value) return
    void binding.setSort([]).then(sync, sync)
    void nextTick(() => {
      if (mounted && props.binding === binding && !selected.value)
        void picker.value?.focus()
    })
  }
  onScopeDispose(() => {
    mounted = false
    choices.dispose()
  })
  const messagesReady = messages.ready
</script>
<template>
  <UiStrategy
    v-if="messagesReady"
    :use="hiddenLabel"
    :block="uiFieldLabels"
  >
    <UiField
      :field="field"
      :label="messages.collectionSortBy"
      :disabled="binding.disabled || binding.mode !== 'single'"
      data-ui-collection-sort-select
    >
      <UiLayout
        direction="horizontal"
        align="center"
        :division="
          selected ? ['content', 1, 'content', 'content'] : ['content', 1]
        "
        data-ui-sort-editor-row
      >
        <span data-ui-sort-label>{{ messages.collectionSortBy }}</span>
        <UiSelect
          ref="picker"
          :control="choices"
        />
        <UiButton
          v-if="selected"
          variant="icon"
          :disabled="binding.disabled || binding.mode !== 'single'"
          :data-ui-sort-direction="selected.direction"
          @click="toggle"
        >
          <template #icon>
            <UiIcon
              :name="
                selected.direction === 'asc'
                  ? 'sort-ascending'
                  : 'sort-descending'
              "
            />
          </template>
          {{ binding.fields.find((item) => item.key === selected.key)?.label }}:
          {{
            selected.direction === 'asc'
              ? messages.collectionSortAscending
              : messages.collectionSortDescending
          }}
        </UiButton>
        <UiButton
          v-if="selected"
          variant="icon"
          color="danger"
          :disabled="binding.disabled || binding.mode !== 'single'"
          data-ui-sort-remove
          @click="remove"
        >
          <template #icon><UiIcon name="delete" /></template>
          {{ binding.fields.find((item) => item.key === selected.key)?.label }}:
          {{ messages.collectionRemoveSort }}
        </UiButton>
      </UiLayout>
    </UiField>
  </UiStrategy>
</template>
