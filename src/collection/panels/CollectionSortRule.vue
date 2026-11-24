<script setup lang="ts">
  import { nextTick, ref, watch } from 'vue'
  import Layout from '@uninterface/backend/CollectionSortLayout.vue'
  import UiButton from '../../components/UiButton.vue'
  import UiIcon from '../../components/UiIcon.vue'
  import UiField from '../../components/UiField.vue'
  import UiInputFrame from '../../components/UiInputFrame.vue'
  import UiTextInput from '../../components/UiTextInput.vue'
  import { createUiFieldControl } from '../../controls/field'
  import UiStrategy from '../../components/UiStrategy.vue'
  import { uiFieldLabels } from '../../strategy/common'
  import type { UiListQuery } from '../../bindings/list'
  import { useMessages } from '../../i18n/messages'
  const props = defineProps<{
    rule: UiListQuery['sort'][number]
    index: number
    count: number
    disabled: boolean
    multiple: boolean
    label: string
  }>()
  const emit = defineEmits<{
    direction: [direction: 'asc' | 'desc']
    move: [offset: number]
    remove: []
  }>()
  const hiddenLabel = uiFieldLabels('hidden')
  const fieldName = createUiFieldControl(props.label)
  watch(
    () => props.label,
    (label) => fieldName.accept(label),
    { flush: 'sync' },
  )
  const messages = useMessages('collections')
  const directionButton = ref<InstanceType<typeof UiButton>>()
  const earlierButton = ref<InstanceType<typeof UiButton>>()
  const laterButton = ref<InstanceType<typeof UiButton>>()
  const named = (action: string) => `${props.label}: ${action}`
  function toggleDirection() {
    if (!props.disabled)
      emit('direction', props.rule.direction === 'asc' ? 'desc' : 'asc')
  }
  async function move(offset: number) {
    if (
      props.disabled ||
      !props.multiple ||
      props.index + offset < 0 ||
      props.index + offset >= props.count
    )
      return
    emit('move', offset)
    await nextTick()
    // Moving keyed DOM can clear focus; keep it on the moved rule and an enabled action.
    const target =
      offset < 0
        ? props.index > 0
          ? earlierButton.value
          : laterButton.value
        : props.index < props.count - 1
          ? laterButton.value
          : earlierButton.value
    if (props.count > 1) void target?.focus()
    else void directionButton.value?.focus()
  }
  const messagesReady = messages.ready
</script>
<template>
  <Layout
    v-if="messagesReady"
    part="row"
    role="group"
    :aria-label="label"
    :data-ui-collection-sort-rule="rule.key"
  >
    <Layout
      v-if="multiple"
      part="movement"
      data-ui-sort-movement
    >
      <UiButton
        ref="earlierButton"
        variant="icon"
        :disabled="disabled || index === 0"
        data-ui-sort-earlier
        @click="move(-1)"
      >
        <template #icon><UiIcon name="move-up" /></template>
        {{ named(messages.collectionSortEarlier) }}
      </UiButton>
      <UiButton
        ref="laterButton"
        variant="icon"
        :disabled="disabled || index === count - 1"
        data-ui-sort-later
        @click="move(1)"
      >
        <template #icon><UiIcon name="move-down" /></template>
        {{ named(messages.collectionSortLater) }}
      </UiButton>
    </Layout>
    <Layout part="field">
      <UiStrategy :use="hiddenLabel">
        <UiField
          :field="fieldName"
          :label="label"
          :disabled="disabled"
        >
          <UiInputFrame
            readonly
            data-ui-sort-criterion
          >
            <UiTextInput data-ui-sort-field />
            <template #trailing>
              <UiButton
                ref="directionButton"
                variant="icon"
                allow-when-readonly
                :disabled="disabled"
                :data-ui-sort-direction="rule.direction"
                @click="toggleDirection"
              >
                <template #icon>
                  <UiIcon
                    :name="
                      rule.direction === 'asc'
                        ? 'sort-ascending'
                        : 'sort-descending'
                    "
                  />
                </template>
                {{
                  named(
                    rule.direction === 'asc'
                      ? messages.collectionSortAscending
                      : messages.collectionSortDescending,
                  )
                }}
              </UiButton>
            </template>
          </UiInputFrame>
        </UiField>
      </UiStrategy>
    </Layout>
    <Layout part="remove">
      <UiButton
        variant="icon"
        :disabled="disabled"
        color="danger"
        data-ui-sort-remove
        @click="!disabled && emit('remove')"
      >
        <template #icon><UiIcon name="delete" /></template>
        {{ named(messages.collectionRemoveSort) }}
      </UiButton>
    </Layout>
  </Layout>
</template>
