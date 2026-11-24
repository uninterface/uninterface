import { toRaw, toValue, type MaybeRefOrGetter } from 'vue'
import type { UiFieldControl } from '../controls/field'

/** A named string editing target belonging to one authoritative field. */
export interface UiInputProjection {
  readonly key: string
  readonly label: string
}

interface ProjectionData {
  field(): UiFieldControl<any, any>
  read(): string
  write(value: string): Promise<void>
  invalid(): boolean
}
const projections = new WeakMap<UiInputProjection, ProjectionData>()

/** Define a string property projection once inside a business composition. */
export function createUiInputProjection<
  T,
  D extends object,
  K extends Extract<
    { [P in keyof D]-?: D[P] extends string ? P : never }[keyof D],
    string
  >,
>(
  field: MaybeRefOrGetter<UiFieldControl<T, D>>,
  key: K,
  options: { label: MaybeRefOrGetter<string>; invalid?: () => boolean },
): UiInputProjection {
  if (!key) throw new Error('An input projection requires a nonempty key.')
  const projection = Object.freeze({
    key,
    get label() {
      return toValue(options.label)
    },
  })
  projections.set(projection, {
    field: () => toRaw(toValue(field)),
    read: () => {
      const value = toValue(field).state.input[key]
      if (typeof value !== 'string')
        throw new Error(`Input projection ${key} requires a string draft.`)
      return value
    },
    write: (value) => {
      const owner = toValue(field)
      // Read the current draft at invocation, never a captured sibling snapshot.
      return owner.set({ ...owner.state.input, [key]: value })
    },
    invalid: () => options.invalid?.() ?? true,
  })
  return projection
}

export function inputProjectionData(projection: UiInputProjection) {
  const data = projections.get(toRaw(projection))
  if (!data)
    throw new Error(
      'Use createUiInputProjection to create an input projection.',
    )
  return data
}
