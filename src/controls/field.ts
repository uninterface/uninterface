import type { UiMessageDescriptor } from '../i18n/types'
import { computed, reactive, shallowRef, toRaw, type ComputedRef } from 'vue'
import type { UiCodec, UiParseResult } from './codec'
import type { UiValidationRule } from './validation'
import { copy, uiDefaultInputEquals } from './value'

const equal = uiDefaultInputEquals

type Check = () =>
  | string
  | UiMessageDescriptor
  | null
  | Promise<string | UiMessageDescriptor | null>

export interface UiFieldControlOptions<D> {
  /** Pure draft/baseline comparison for dirty tracking only. */
  inputEquals?: (left: D, right: D) => boolean
  /** Checked drafts normally refresh feedback on change; validate defers to explicit validation. */
  revalidateOn?: 'change' | 'validate'
}

export interface UiFieldDraftChange {
  readonly origin?: 'user' | 'programmatic'
  readonly parts?: readonly string[]
}

export interface UiFieldControl<T = unknown, D = T> {
  state: {
    input: D
    issue: string | UiMessageDescriptor | null
    valid: boolean
    checked: boolean
    /** Business-owned restriction, independent of temporary operation locks. */
    disabled: boolean
    readonly effectiveDisabled: boolean
    validating: boolean
    readonly revision: number
    readonly lastDraftChange:
      | (UiFieldDraftChange & { readonly revision: number })
      | undefined
  }
  dirty: ComputedRef<boolean>
  set(input: D): Promise<void>
  notifyDraftChanged(change?: UiFieldDraftChange): void
  read(): Promise<UiParseResult<T>>
  validate(): Promise<boolean>
  reset(): void
  accept(value: T): void
  addCheck(check: Check): () => void
  trackDraft(isDirty: () => boolean): () => void
}

export interface PreparedFieldValue {
  (): void
  discard(): void
}
interface FieldValueParticipant {
  commit(): void
  discard(): void
}
type ValueKind = 'set' | 'reset' | 'accept'

// Private coordination preserves the exact validated value for submission.
// Public read() always evaluates a fresh snapshot without publishing feedback.
interface FieldSnapshot {
  result: UiParseResult<any>
  isCurrent(): boolean
}
const validationSessions = new WeakMap<
  UiFieldControl<any, any>,
  {
    inspect(input: unknown): Promise<UiParseResult<unknown>>
    validate(): Promise<FieldSnapshot | undefined>
    /** Composite parents validate private drafts without rewriting them mid-pass. */
    validateDraft(): Promise<FieldSnapshot | undefined>
    prepareAccept(value: unknown): PreparedFieldValue
    prepareReset(): PreparedFieldValue
    prepareRestore(value: unknown): PreparedFieldValue
    prepareDraft(value: unknown): PreparedFieldValue
    coordinateValues(
      prepare: (input: unknown, kind: ValueKind) => FieldValueParticipant,
    ): () => void
    useValidationParser(
      parser: (input: unknown) => Promise<UiParseResult<unknown>>,
    ): () => void
    invalidate(): void
    lock(): () => void
    publishIssue(issue: string | UiMessageDescriptor): void
    onValueChange(
      listener: (kind: 'set' | 'reset' | 'accept') => void,
    ): () => void
    /** Explicit validation of this field or a logical descendant has settled. */
    onValidated(listener: () => void | Promise<void>): () => void
    notifyValidated(): Promise<void>
  }
>()
export function fieldValidation(field: UiFieldControl<any, any>) {
  const session = validationSessions.get(toRaw(field))
  if (!session)
    throw new Error('Form fields must be created by createUiFieldControl.')
  return session
}

export function createUiFieldControl<T, D = T>(
  initial: T,
  codec: UiCodec<T, D> = {
    parse: (value) => ({ ok: true, value: value as unknown as T }),
    format: (value) => value as unknown as D,
  },
  rules: UiValidationRule<T>[] = [],
  options: UiFieldControlOptions<D> = {},
): UiFieldControl<T, D> {
  const inputEquals = options.inputEquals ?? equal
  const revalidateOn = options.revalidateOn ?? 'change'
  let baseline = copy(codec.format(initial))
  const baselineState = reactive({ value: copy(baseline) })
  const locks = reactive(new Set<symbol>())
  // Publish revision and its optional detail together, including to sync watchers.
  const draftRevision = shallowRef<{
    revision: number
    change: UiFieldControl<T, D>['state']['lastDraftChange']
  }>({ revision: 0, change: undefined })
  const state = reactive({
    input: copy(baseline),
    issue: null as string | UiMessageDescriptor | null,
    valid: false,
    checked: false,
    disabled: false,
    get effectiveDisabled(): boolean {
      return this.disabled || locks.size > 0
    },
    validating: false,
    get revision() {
      return draftRevision.value.revision
    },
    get lastDraftChange() {
      return draftRevision.value.change
    },
  }) as UiFieldControl<T, D>['state']
  const checks = new Set<Check>()
  // Internal composition lifecycle, distinct from validation/draft revisions.
  const valueListeners = new Set<(kind: 'set' | 'reset' | 'accept') => void>()
  const validationListeners = new Set<() => void | Promise<void>>()
  const notifyValidated = async () => {
    await Promise.all([...validationListeners].map((listener) => listener()))
  }
  const valueChanged = (kind: 'set' | 'reset' | 'accept') => {
    for (const listener of [...valueListeners]) listener(kind)
  }
  let prepareParticipant:
    | ((input: D, kind: ValueKind) => FieldValueParticipant)
    | undefined
  const draftTrackers = new Set<() => boolean>()
  let generation = 0
  let validationParser: ((input: D) => Promise<UiParseResult<T>>) | undefined
  let active:
    | {
        normalize: boolean
        isCurrent(): boolean
        promise: Promise<FieldSnapshot | undefined>
      }
    | undefined

  function advanceRevision(change?: UiFieldDraftChange) {
    const revision = draftRevision.value.revision + 1
    draftRevision.value = {
      revision,
      change:
        change === undefined
          ? undefined
          : Object.freeze({
              revision,
              ...(change.origin === undefined ? {} : { origin: change.origin }),
              ...(change.parts?.length
                ? { parts: Object.freeze([...change.parts]) }
                : {}),
            }),
    }
  }

  function invalidate() {
    generation++
    state.valid = false
    active = undefined
    state.validating = false
  }
  async function check(
    parsed: UiParseResult<T>,
    current = () => true,
  ): Promise<UiParseResult<T>> {
    if (!parsed.ok) return parsed
    for (const rule of rules) {
      if (!current()) return parsed
      const issue = await rule(copy(parsed.value))
      if (issue) return { ok: false, issue }
    }
    for (const check of [...checks]) {
      if (!current()) return parsed
      const issue = await check()
      if (issue) return { ok: false, issue }
    }
    return parsed
  }
  async function read(): Promise<UiParseResult<T>> {
    return check(await codec.parse(copy(state.input)))
  }
  function prepareValue(
    input: D,
    kind: ValueKind,
    acceptBaseline = kind === 'accept',
  ): PreparedFieldValue {
    const formatted = copy(input)
    const participant = prepareParticipant?.(copy(formatted), kind)
    let finished = false
    const commit = () => {
      if (finished) return
      finished = true
      // Participants stage all fallible construction/formatting before this point.
      participant?.commit()
      invalidate()
      if (acceptBaseline) {
        baseline = copy(formatted)
        baselineState.value = copy(baseline) as typeof baselineState.value
      }
      state.input = copy(formatted)
      state.issue = null
      if (kind === 'reset') state.checked = false
      advanceRevision()
      valueChanged(kind)
    }
    commit.discard = () => {
      if (finished) return
      finished = true
      participant?.discard()
    }
    return commit
  }
  function prepareAccept(value: T) {
    return prepareValue(codec.format(value), 'accept')
  }
  function run(normalize: boolean): Promise<FieldSnapshot | undefined> {
    if (active?.normalize === normalize && active.isCurrent())
      return active.promise
    const id = ++generation
    let revision = state.revision
    const input = copy(state.input)
    const isCurrent = () => id === generation && revision === state.revision
    state.valid = false
    state.validating = true
    state.checked = true
    state.issue = null
    const promise = (async () => {
      try {
        // Coalesce same-turn editing and explicit validation before parsing.
        await Promise.resolve()
        if (!isCurrent()) return
        const parsed = await (validationParser ?? codec.parse)(input)
        if (!isCurrent()) return
        if (normalize && parsed.ok) {
          const formatted = copy(codec.format(parsed.value))
          if (!equal(state.input, formatted)) {
            state.input = formatted
            advanceRevision()
            revision = state.revision
          }
        }
        const result = await check(parsed, isCurrent)
        if (!isCurrent()) return
        state.valid = result.ok
        state.issue = result.ok ? null : result.issue
        if (normalize && validationListeners.size) await notifyValidated()
        return { result, isCurrent }
      } catch (error) {
        if (!isCurrent()) return
        state.checked = false
        throw error
      } finally {
        if (id === generation) {
          state.validating = false
          active = undefined
        }
      }
    })()
    active = { normalize, isCurrent, promise }
    return promise
  }
  const control: UiFieldControl<T, D> = {
    state,
    dirty: computed(() => {
      void state.revision
      return (
        !inputEquals(state.input, baselineState.value as D) ||
        [...draftTrackers].some((isDirty) => isDirty())
      )
    }),
    read,
    async validate() {
      const snapshot = await run(true)
      return Boolean(snapshot?.isCurrent() && snapshot.result.ok)
    },
    async set(input) {
      if (state.effectiveDisabled) return
      prepareValue(input, 'set')()
      if (state.checked && revalidateOn === 'change') await run(false)
    },
    notifyDraftChanged(change = {}) {
      invalidate()
      state.issue = null
      advanceRevision(change)
    },
    reset() {
      prepareValue(baseline, 'reset')()
    },
    accept(value) {
      prepareAccept(value)()
    },
    addCheck(check) {
      checks.add(check)
      invalidate()
      advanceRevision()
      return () => {
        checks.delete(check)
        invalidate()
        advanceRevision()
      }
    },
    trackDraft(isDirty) {
      draftTrackers.add(isDirty)
      invalidate()
      advanceRevision()
      return () => {
        draftTrackers.delete(isDirty)
        invalidate()
        advanceRevision()
      }
    },
  }
  validationSessions.set(control, {
    onValidated(listener) {
      validationListeners.add(listener)
      return () => {
        validationListeners.delete(listener)
      }
    },
    notifyValidated,
    onValueChange(listener) {
      valueListeners.add(listener)
      return () => {
        valueListeners.delete(listener)
      }
    },
    async inspect(input) {
      const parsed = await codec.parse(copy(input as D))
      if (!parsed.ok) return parsed
      for (const rule of rules) {
        const issue = await rule(copy(parsed.value))
        if (issue) return { ok: false, issue }
      }
      return parsed
    },
    validate: () => run(true),
    validateDraft: () => run(false),
    prepareAccept: (value) => prepareAccept(value as T),
    prepareReset: () => prepareValue(baseline, 'reset'),
    prepareRestore: (value) =>
      prepareValue(codec.format(value as T), 'reset', true),
    prepareDraft: (value) => prepareValue(codec.format(value as T), 'set'),
    coordinateValues(prepare) {
      if (prepareParticipant)
        throw new Error('A field already has a value coordinator.')
      const participant = prepare as (
        input: D,
        kind: ValueKind,
      ) => FieldValueParticipant
      prepareParticipant = participant
      return () => {
        if (prepareParticipant === participant) prepareParticipant = undefined
      }
    },
    useValidationParser(parser) {
      if (validationParser)
        throw new Error('A field already has a composite validation parser.')
      const parse = parser as (input: D) => Promise<UiParseResult<T>>
      validationParser = parse
      invalidate()
      advanceRevision()
      return () => {
        if (validationParser !== parse) return
        validationParser = undefined
        invalidate()
        advanceRevision()
      }
    },
    invalidate,
    lock() {
      const token = Symbol('field operation')
      locks.add(token)
      return () => {
        locks.delete(token)
      }
    },
    publishIssue(issue) {
      invalidate()
      state.checked = true
      state.issue = issue
    },
  })
  return control
}
