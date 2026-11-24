import { watch, type Component } from 'vue'
import { fieldValidation, type UiFieldControl } from '../controls/field'
import type { UiFilterEditorContext, UiFilterEditorInstance } from './filter'

/** Adapt an existing compound or scalar field without a second validation engine. */
export function createUiFilterFieldEditor<V, D>(
  context: UiFilterEditorContext<V>,
  field: UiFieldControl<V, D>,
  view: Component,
): UiFilterEditorInstance<V> {
  let replacing = false
  const changed = () => {
    if (!replacing) context.changed()
  }
  const stopValue = fieldValidation(field).onValueChange((kind) => {
    if (kind === 'set') changed()
  })
  // Composite input edits notify directly. Normalization/check registration
  // revisions are not user edits and must not reschedule live validation.
  const stop = watch(
    () => field.state.lastDraftChange,
    (change) => {
      if (change) changed()
    },
    { flush: 'sync' },
  )
  return {
    view,
    get dirty() {
      return field.dirty.value
    },
    get validating() {
      return field.state.validating
    },
    async validate() {
      // Reuse the same pass as native choice/blur validation. Keep its exact
      // parsed value; normalization is not a user-change notification.
      const snapshot = await fieldValidation(field).validate()
      return snapshot?.isCurrent() && snapshot.result.ok
        ? { valid: true, value: snapshot.result.value as V }
        : { valid: false }
    },
    replace(value) {
      replacing = true
      try {
        field.accept(value)
      } finally {
        replacing = false
      }
    },
    dispose() {
      stop()
      stopValue()
      fieldValidation(field).invalidate()
    },
  }
}
