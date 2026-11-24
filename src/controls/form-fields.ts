import { toRaw } from 'vue'
import { fieldValidation, type UiFieldControl } from './field'

// Coordination claims do not transfer the business owner's field lifetime.
const children = new WeakMap<
  UiFieldControl<any, any>,
  Set<UiFieldControl<any, any>>
>()
export function isFieldClaimed(field: UiFieldControl<any, any>) {
  return owners.has(toRaw(field))
}

const owners = new WeakMap<UiFieldControl<any, any>, symbol>()

export function claimFormFields(
  entries: readonly (readonly [PropertyKey, UiFieldControl<any, any>])[],
  parent?: UiFieldControl<any, any>,
): () => void {
  const fields = new Map<UiFieldControl<any, any>, PropertyKey>()
  // Check every candidate before installing any claim.
  for (const [name, candidate] of entries) {
    const field = toRaw(candidate)
    fieldValidation(field)
    if (fields.has(field))
      throw new Error(
        `Form field "${String(name)}" duplicates "${String(fields.get(field))}".`,
      )
    if (owners.has(field))
      throw new Error(
        `Form field "${String(name)}" already participates in another form.`,
      )
    if (parent) {
      const target = toRaw(parent)
      const seen = new Set<UiFieldControl<any, any>>()
      const reaches = (node: UiFieldControl<any, any>): boolean => {
        if (node === target) return true
        if (seen.has(node)) return false
        seen.add(node)
        return [...(children.get(node) ?? [])].some(reaches)
      }
      if (reaches(field)) throw new Error('Cyclic field participation.')
    }
    fields.set(field, name)
  }
  const owner = Symbol('form field participation')
  for (const field of fields.keys()) owners.set(field, owner)
  const parentField = parent && toRaw(parent)
  if (parentField) {
    const descendants = children.get(parentField) ?? new Set()
    for (const field of fields.keys()) descendants.add(field)
    children.set(parentField, descendants)
  }
  let released = false
  return () => {
    if (released) return
    released = true
    for (const field of fields.keys())
      if (owners.get(field) === owner) {
        owners.delete(field)
        if (parentField) children.get(parentField)?.delete(field)
      }
  }
}
