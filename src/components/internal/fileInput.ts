import {
  computed,
  nextTick,
  inject,
  onScopeDispose,
  shallowRef,
  useAttrs,
  useId,
  watch,
} from 'vue'
import { fieldKey, controlBinding } from '../../controls/context'
import { fieldValidation } from '../../controls/field'
import {
  createUiFileDescriptorFromFile,
  type UiFileDescriptor,
} from '../../files/control'
import { useUiI18n } from '../../i18n/context'
import { retainCoreMessages } from '../../i18n/control'
import { useMessages } from '../../i18n/messages'
import { corePackForMessage } from '../../i18n/packs'
export interface FileInputProps {
  file?: UiFileDescriptor<File> | null
  disabled?: boolean
  readonly?: boolean
  accept?: string
  capture?: 'user' | 'environment'
  validateFile?: (
    file: UiFileDescriptor<File>,
  ) => string | null | Promise<string | null>
}
export function useFileInput(
  props: FileInputProps,
  emit: {
    (event: 'update:file', value: UiFileDescriptor<File> | null): void
    (event: 'reject', value: string): void
  },
  onAccepted?: (file: UiFileDescriptor<File>) => void,
) {
  const context = inject(fieldKey, undefined),
    id = useId(),
    attrs = useAttrs(),
    i18n = useUiI18n(),
    messages = useMessages('files')
  const rejection = shallowRef<string | null>(null),
    pending = shallowRef(false)
  let generation = 0
  const file = computed(
    () => context?.value.field.state.input ?? props.file ?? null,
  )
  const binding = computed(() =>
    context
      ? controlBinding(context.value, props.disabled)
      : {
          id,
          disabled: Boolean(props.disabled),
          invalid: !!rejection.value,
          validating: pending.value,
        },
  )
  watch(
    () => [props.file, attrs.multiple, attrs.webkitdirectory],
    () => {
      if (context && props.file !== undefined)
        throw new Error(
          'File input accepts field ownership or v-model:file, not both.',
        )
      if (attrs.multiple !== undefined || attrs.webkitdirectory !== undefined)
        throw new Error(
          'File inputs are single-file; multiple and directories are unsupported.',
        )
    },
    { immediate: true },
  )
  watch(
    () => [file.value, context?.value.field.state.revision],
    () => {
      generation++
      pending.value = false
      rejection.value = null
    },
    { flush: 'sync' },
  )
  function reject(issue: string) {
    rejection.value = issue
    emit('reject', issue)
  }
  async function select(files: readonly File[]) {
    if (binding.value.disabled || props.readonly) return
    if (files.length !== 1) {
      reject(messages.value.singleFile)
      return
    }
    const token = ++generation,
      candidate = createUiFileDescriptorFromFile(files[0]!)
    pending.value = true
    try {
      const issue = await props.validateFile?.(candidate)
      const result =
        !issue && context
          ? await fieldValidation(context.value.field).inspect(candidate)
          : undefined
      if (token !== generation || binding.value.disabled || props.readonly)
        return
      if (issue) {
        reject(issue)
        return
      }
      if (result && !result.ok) {
        const pack =
          typeof result.issue === 'string'
            ? undefined
            : corePackForMessage(result.issue)
        const retained =
          pack &&
          !Object.hasOwn(i18n.state.value.resolved, `uninterface.${pack}`) &&
          retainCoreMessages.get(i18n)!([pack])
        try {
          if (retained) await retained.ready
          if (
            token === generation &&
            !binding.value.disabled &&
            !props.readonly
          )
            reject(i18n.text(result.issue))
        } finally {
          if (retained) retained.release()
        }
        return
      }
      rejection.value = null
      if (context) {
        await context.value.field.set(candidate)
        await context.value.field.validate()
      } else emit('update:file', candidate)
      // The accepted write itself advances the generation; stale selection was checked before it.
      await nextTick()
      if (
        file.value?.key === candidate.key &&
        !binding.value.disabled &&
        !props.readonly
      )
        onAccepted?.(candidate)
    } catch (error) {
      if (token === generation)
        reject(
          error instanceof Error ? error.message : messages.value.fileRejected,
        )
    } finally {
      if (token === generation) pending.value = false
    }
  }
  async function clear() {
    if (binding.value.disabled || props.readonly) return
    generation++
    rejection.value = null
    if (context) {
      await context.value.field.set(null)
      await context.value.field.validate()
    } else emit('update:file', null)
  }
  onScopeDispose(() => generation++)
  return {
    label: computed(
      () => context?.value.label ?? String(attrs['aria-label'] ?? ''),
    ),
    file,
    binding,
    rejection,
    pending,
    select,
    clear,
  }
}
