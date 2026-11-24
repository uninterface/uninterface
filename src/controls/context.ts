import {
  inject,
  getCurrentInstance,
  onActivated,
  onDeactivated,
  onMounted,
  onScopeDispose,
  type ComputedRef,
  type InjectionKey,
} from 'vue'
import type { UiFieldControl } from './field'
import type { UiControlViewBinding } from '../backend'
import { collectionEditorViewKey } from '../collection/editor-protocol'

export interface FieldContext {
  field: UiFieldControl<any, any>
  id: string
  describedBy?: string
  group?: boolean
  label: string
  required?: boolean
  disabled?: boolean
}
export const fieldKey: InjectionKey<ComputedRef<FieldContext>> =
  Symbol('uninterface.field')
export const checkableFieldKey: InjectionKey<{ register(): () => void }> =
  Symbol('uninterface.checkable-field')
/** Declare a field presentation category without inspecting editor internals. */
export function useCheckableField() {
  const field = inject(checkableFieldKey, undefined)
  let release: (() => void) | undefined
  onMounted(() => {
    release = field?.register()
  })
  onScopeDispose(() => release?.())
}
export function useField() {
  const value = inject(fieldKey)
  if (!value) throw new Error('Input components must be placed in UiField.')
  const editor = inject(collectionEditorViewKey, undefined)
  const instance = getCurrentInstance()
  if (editor && instance) {
    let active = true
    let release: (() => void) | undefined
    onActivated(() => {
      active = true
    })
    onDeactivated(() => {
      active = false
    })
    onMounted(() => {
      // Use the editor's public focus handle, never backend DOM structure.
      release = editor.register(
        () => value.value.field,
        async () =>
          active ? ((await instance.exposed?.focus?.()) ?? false) : false,
      )
    })
    onScopeDispose(() => {
      active = false
      release?.()
    })
  }
  return value
}
export function controlBinding(
  context: FieldContext,
  disabled = false,
): UiControlViewBinding {
  return {
    id: context.id,
    describedBy: context.describedBy,
    required: context.required,
    validating: context.field.state.validating,
    invalid: Boolean(context.field.state.issue),
    disabled: Boolean(
      context.field.state.effectiveDisabled || context.disabled || disabled,
    ),
  }
}
