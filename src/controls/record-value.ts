import { effectScope, watch } from 'vue'
import {
  createUiFieldControl,
  fieldValidation,
  type UiFieldControl,
  type PreparedFieldValue,
} from './field'
import { claimFormFields } from './form-fields'
import { copy } from './value'
import type { UiParseResult } from './codec'

export interface UiRecordValueControl<T extends Record<string, any>> {
  readonly field: UiFieldControl<T>
  readonly fields: { readonly [K in keyof T]: UiFieldControl<T[K], any> }
  dispose(): void
}

/** A fixed business record contributes one field to its parent, not a nested form. */
export function createUiRecordValueControl<T extends Record<string, any>>(
  initialValue: T,
  fields: { [K in keyof T]: UiFieldControl<NoInfer<T[K]>, any> },
): UiRecordValueControl<T> {
  const entries = Object.entries(fields) as [
    keyof T,
    UiFieldControl<any, any>,
  ][]
  const effects = effectScope(true)
  let disposed = false,
    synchronizing = false
  async function parse(publish: boolean): Promise<UiParseResult<T>> {
    if (disposed)
      return {
        ok: false,
        issue: { namespace: 'uninterface', key: 'listValueChanged' },
      }
    const revision = field.state.revision
    const results = await Promise.all(
      entries.map(async ([, child]) => {
        if (publish) return fieldValidation(child).validateDraft()
        const revision = child.state.revision
        const result = await child.read()
        return { result, isCurrent: () => revision === child.state.revision }
      }),
    )
    if (
      disposed ||
      revision !== field.state.revision ||
      results.some((result) => !result?.isCurrent())
    )
      return {
        ok: false,
        issue: { namespace: 'uninterface', key: 'listValueChanged' },
      }
    const value = {} as T
    let failure: UiParseResult<T> | undefined
    results.forEach((result, index) => {
      if (result!.result.ok)
        value[entries[index][0]] = copy(result!.result.value)
      else failure ??= result!.result
    })
    return failure ?? { ok: true, value }
  }
  const field = createUiFieldControl(initialValue, {
    format(value) {
      if (
        !value ||
        typeof value !== 'object' ||
        entries.some(([name]) => !Object.hasOwn(value, name))
      )
        throw new Error('A record value must supply every composed field.')
      return copy(value)
    },
    parse: () => parse(false),
  })
  const releaseClaim = claimFormFields(entries, field)
  const stopParser = fieldValidation(field).useValidationParser(() =>
    parse(true),
  )
  const stopDirty = field.trackDraft(() =>
    entries.some(([, child]) => child.dirty.value),
  )
  const locks = new Map<UiFieldControl<any, any>, () => void>()
  const validationStops: (() => void)[] = []
  fieldValidation(field).coordinateValues((value, kind) => {
    if (disposed) throw new Error('Record value control has been disposed.')
    if (
      !value ||
      typeof value !== 'object' ||
      entries.some(([name]) => !Object.hasOwn(value, name))
    )
      throw new Error('A record value must supply every composed field.')
    const commits: PreparedFieldValue[] = []
    try {
      for (const [name, child] of entries)
        commits.push(
          kind === 'set'
            ? fieldValidation(child).prepareDraft((value as T)[name])
            : kind === 'reset'
              ? fieldValidation(child).prepareRestore((value as T)[name])
              : fieldValidation(child).prepareAccept((value as T)[name]),
        )
    } catch (error) {
      commits.forEach((commit) => commit.discard())
      throw error
    }
    return {
      discard: () => commits.forEach((commit) => commit.discard()),
      commit() {
        synchronizing = true
        try {
          commits.forEach((commit) => commit())
          if (kind === 'reset')
            entries.forEach(([, child]) => {
              child.state.checked = false
            })
        } finally {
          synchronizing = false
        }
      },
    }
  })
  function dispose() {
    if (disposed) return
    disposed = true
    effects.stop()
    validationStops.forEach((stop) => stop())
    stopParser()
    stopDirty()
    fieldValidation(field).invalidate()
    fieldValidation(field).lock()
    for (const [, child] of entries) {
      locks.get(child)?.()
      fieldValidation(child).invalidate()
    }
    locks.clear()
    releaseClaim()
  }
  try {
    field.accept(initialValue)
    effects.run(() => {
      for (const [key, child] of entries) {
        validationStops.push(
          fieldValidation(child).onValidated(() => {
            if (!disposed) return fieldValidation(field).notifyValidated()
          }),
        )
        watch(
          () => child.state.revision,
          () => {
            if (!synchronizing && !disposed)
              field.notifyDraftChanged({
                parts: [String(key)],
                origin: child.state.lastDraftChange?.origin,
              })
          },
          { flush: 'sync' },
        )
      }
      watch(
        () => field.state.effectiveDisabled,
        (disabled) => {
          for (const [, child] of entries) {
            if (disabled && !locks.has(child))
              locks.set(child, fieldValidation(child).lock())
            else if (!disabled && locks.has(child)) {
              locks.get(child)!()
              locks.delete(child)
            }
          }
        },
        { flush: 'sync' },
      )
    })
  } catch (error) {
    dispose()
    throw error
  }
  return Object.freeze({ field, fields: Object.freeze({ ...fields }), dispose })
}
