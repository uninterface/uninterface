import type { UiMessageDescriptor } from '../i18n/types'
import { computed, effectScope, reactive, ref, shallowRef, watch } from 'vue'
import {
  UiFormSubmissionError,
  UiFormSubmissionStateError,
} from './submission-error'
import { scopeButtonBinding, type UiButtonBinding } from '../bindings/button'
import {
  fieldValidation,
  type UiFieldControl,
  type PreparedFieldValue,
} from './field'
import type { UiValidationRule } from './validation'
import { copy } from './value'
import { claimFormFields } from './form-fields'

type Fields<T> = { [K in keyof T]: UiFieldControl<T[K], any> }
export function createUiFormControl<T extends Record<string, any>>(
  fields: Fields<T>,
  options: { rules?: UiValidationRule<T>[]; acceptOnSave?: boolean } = {},
) {
  const entries = Object.entries(fields) as [
    keyof T,
    UiFieldControl<any, any>,
  ][]
  const releaseFields = claimFormFields(entries)
  const effects = effectScope(true)
  try {
    return effects.run(() => {
      const state = reactive({
        pending: false,
        validating: false,
        validity: 'unchecked' as 'unchecked' | 'valid' | 'invalid',
        outcome: 'idle' as 'idle' | 'invalid' | 'saved' | 'failed',
        failure: '',
        error: shallowRef<unknown>(null),
        issues: [] as (string | UiMessageDescriptor)[],
        resetRevision: 0,
      })
      const resetListeners = new Set<() => void>()
      const disposed = ref(false)
      const bindingScope = Symbol('form buttons')
      const makeButtonBinding = (type: 'submit' | 'reset'): UiButtonBinding =>
        scopeButtonBinding(
          Object.freeze({
            target: 'button' as const,
            type,
            get disabled() {
              return disposed.value || state.pending
            },
            get loading() {
              return type === 'submit' && !disposed.value && state.pending
            },
          }),
          bindingScope,
        )
      const bindings = Object.freeze({
        submitButton: makeButtonBinding('submit'),
        resetButton: makeButtonBinding('reset'),
      })
      entries.forEach(([, field]) =>
        watch(
          () => field.state.revision,
          () => {
            state.validity = 'unchecked'
            state.issues = []
            if (!state.pending) {
              state.outcome = 'idle'
              state.failure = ''
              state.error = null
            }
          },
          { flush: 'sync' },
        ),
      )
      let releaseSubmission: (() => void) | undefined
      let validationGeneration = 0
      type ValidationSnapshot = { value: T | undefined; isCurrent(): boolean }
      let activeValidation: Promise<ValidationSnapshot | undefined> | undefined

      function runValidation(): Promise<ValidationSnapshot | undefined> {
        if (disposed.value) return Promise.resolve(undefined)
        const generation = ++validationGeneration
        state.validating = true
        state.validity = 'unchecked'
        state.issues = []
        const current = () =>
          !disposed.value && generation === validationGeneration
        const operation = (async () => {
          let resultIsCurrent = current
          try {
            if (!current()) return
            const settled = await Promise.allSettled(
              entries.map(([, field]) =>
                current() ? fieldValidation(field).validate() : undefined,
              ),
            )
            if (!current()) return
            if (
              settled.some(
                (entry) =>
                  entry.status === 'fulfilled' && !entry.value?.isCurrent(),
              )
            )
              return
            const rejected = settled.find(
              (entry) => entry.status === 'rejected',
            )
            if (rejected?.status === 'rejected') throw rejected.reason
            const snapshots = settled.map((entry) =>
              entry.status === 'fulfilled' ? entry.value : undefined,
            )
            const isCurrent = () =>
              current() && snapshots.every((snapshot) => snapshot?.isCurrent())
            resultIsCurrent = isCurrent
            if (!isCurrent()) return
            const model = {} as T
            let valid = true
            snapshots.forEach((snapshot, index) => {
              if (snapshot!.result.ok)
                model[entries[index][0]] = copy(snapshot!.result.value)
              else valid = false
            })
            const issues: (string | UiMessageDescriptor)[] = []
            if (valid)
              for (const rule of options.rules ?? []) {
                const issue = await rule(copy(model))
                if (!isCurrent()) return
                if (issue) issues.push(issue)
              }
            if (!isCurrent()) return
            state.issues = issues
            state.validity = valid && !issues.length ? 'valid' : 'invalid'
            return {
              value: state.validity === 'valid' ? model : undefined,
              isCurrent,
            }
          } catch (error) {
            if (!resultIsCurrent()) return
            throw error
          } finally {
            if (current()) state.validating = false
          }
        })()
        activeValidation = operation
        return operation
      }

      async function validate(): Promise<boolean> {
        if (disposed.value)
          throw new Error('Cannot validate a disposed form control.')
        if (!state.pending) {
          state.error = null
          state.failure = ''
          state.outcome = 'idle'
        }
        // A submission owns its validation pass; observers can await that pass.
        const snapshot = await (state.pending && activeValidation
          ? activeValidation
          : runValidation())
        return Boolean(snapshot?.isCurrent() && snapshot.value !== undefined)
      }
      const control = {
        bindings,
        fields,
        state,
        dirty: computed(() => entries.some(([, field]) => field.dirty.value)),
        validate,
        async submit<R>(
          onSubmit: (value: T) => Promise<R>,
          submission: { accept?: (result: R, submitted: T) => T } = {},
        ): Promise<R> {
          if (disposed.value) throw new UiFormSubmissionStateError('disposed')
          if (state.pending) throw new UiFormSubmissionStateError('pending')
          // Locked before validation so concurrent requests cannot dispatch twice.
          state.pending = true
          state.failure = ''
          state.error = null
          state.outcome = 'idle'
          const locks: (() => void)[] = []
          let released = false
          const release = () => {
            if (released) return
            released = true
            locks.forEach((unlock) => unlock())
          }
          releaseSubmission = release
          let isCurrent = () => !disposed.value
          let invalid = false
          let interruption: UiFormSubmissionStateError | undefined
          const obsolete = (options?: ErrorOptions) =>
            (interruption = new UiFormSubmissionStateError(
              disposed.value ? 'disposed' : 'obsolete',
              options,
            ))
          try {
            if (disposed.value) throw obsolete()
            for (const [, field] of entries) {
              if (disposed.value) throw obsolete()
              const unlock = fieldValidation(field).lock()
              // A synchronous observer may dispose while the lock is acquired.
              if (released) unlock()
              else locks.push(unlock)
            }
            const validated = await runValidation()
            if (!validated?.isCurrent()) throw obsolete()
            if (validated.value === undefined) {
              invalid = true
              throw new UiFormSubmissionError({
                stage: 'validate',
                message: '',
                fields: Object.fromEntries(
                  entries.flatMap(([name, field]) =>
                    field.state.issue === null
                      ? []
                      : [[name, [field.state.issue]]],
                  ),
                ),
              })
            }
            const snapshot = validated.value
            isCurrent = validated.isCurrent
            const result = await onSubmit(copy(snapshot))
            if (!isCurrent()) throw obsolete()
            const accepted = submission.accept
              ? copy(submission.accept(result, copy(snapshot)))
              : options.acceptOnSave
                ? snapshot
                : undefined
            if (submission.accept && accepted === undefined)
              throw new Error(
                'Canonical form acceptance requires a complete model.',
              )
            // A mapper may call application code; it cannot make an obsolete
            // request current again by returning a canonical value.
            if (!isCurrent()) throw obsolete()
            if (accepted !== undefined) {
              if (
                !accepted ||
                typeof accepted !== 'object' ||
                entries.some(([name]) => !Object.hasOwn(accepted, name))
              )
                throw new Error(
                  'Canonical form acceptance requires a complete model.',
                )
              // Format every field before changing any baseline. A malformed
              // canonical value cannot leave earlier fields partly accepted.
              const commits: PreparedFieldValue[] = []
              try {
                for (const [name, field] of entries)
                  commits.push(
                    fieldValidation(field).prepareAccept(accepted[name]),
                  )
                if (!isCurrent()) throw obsolete()
                for (const commit of commits) {
                  if (disposed.value) throw obsolete()
                  commit()
                }
              } finally {
                commits.forEach((commit) => commit.discard())
              }
            }
            state.validity = 'valid'
            state.outcome = 'saved'
            return result
          } catch (error) {
            if (interruption && error === interruption) throw error
            if (!isCurrent()) throw obsolete({ cause: error })
            state.outcome = invalid ? 'invalid' : 'failed'
            state.error = error
            state.failure =
              error instanceof UiFormSubmissionError ? error.message : ''
            if (!invalid && error instanceof UiFormSubmissionError) {
              let hasFieldIssues = false
              for (const [name, field] of entries) {
                const issue = Object.hasOwn(error.fields, name)
                  ? error.fields[name as string]?.[0]
                  : undefined
                if (issue !== undefined) {
                  fieldValidation(field).publishIssue(issue)
                  hasFieldIssues = true
                }
              }
              if (hasFieldIssues) state.validity = 'invalid'
            }
            throw error
          } finally {
            release()
            if (releaseSubmission === release) releaseSubmission = undefined
            state.pending = false
          }
        },
        /** Observe accepted resets; native and programmatic resets use this same path. */
        onReset(listener: () => void) {
          if (disposed.value)
            throw new Error('Cannot subscribe to a disposed form control.')
          resetListeners.add(listener)
          return () => {
            resetListeners.delete(listener)
          }
        },
        reset() {
          if (disposed.value)
            throw new Error('Cannot reset a disposed form control.')
          if (state.pending) return
          validationGeneration++
          state.validating = false
          const commits: PreparedFieldValue[] = []
          try {
            for (const [, field] of entries)
              commits.push(fieldValidation(field).prepareReset())
            commits.forEach((commit) => commit())
          } finally {
            commits.forEach((commit) => commit.discard())
          }
          state.validity = 'unchecked'
          state.outcome = 'idle'
          state.failure = ''
          state.error = null
          state.issues = []
          state.resetRevision++
          const errors: unknown[] = []
          for (const listener of [...resetListeners]) {
            try {
              listener()
            } catch (error) {
              errors.push(error)
            }
          }
          if (errors.length)
            throw new AggregateError(
              errors,
              'Form reset listeners failed after reset.',
            )
        },
        dispose() {
          if (disposed.value) return
          disposed.value = true
          resetListeners.clear()
          validationGeneration++
          effects.stop()
          state.validating = false
          entries.forEach(([, field]) => fieldValidation(field).invalidate())
          releaseSubmission?.()
          releaseSubmission = undefined
          state.pending = false
          releaseFields()
        },
      }
      return control
    })!
  } catch (error) {
    effects.stop()
    releaseFields()
    throw error
  }
}
export type UiFormControl<T extends Record<string, any> = any> = ReturnType<
  typeof createUiFormControl<T>
>
