import { shallowReactive, toRaw } from 'vue'

type Features = { sort: boolean; filter: boolean }
const presentations = new WeakMap<object, Map<object, Features>>()
function entries(binding: object) {
  const key = toRaw(binding)
  let value = presentations.get(key)
  if (!value) {
    value = shallowReactive(new Map<object, Features>())
    presentations.set(key, value)
  }
  return value
}

/** Internal view reports; never change the query or issue source requests. */
export function reportColumnPresentation(
  binding: object,
  owner: object,
  value?: Features,
) {
  const views = entries(binding)
  const previous = views.get(owner)
  // Slot/layout updates can report the same presentation repeatedly. Publishing
  // a fresh object would invalidate the business render that consumes the flags,
  // update its slots, then cause another identical report indefinitely.
  if (value) {
    if (previous?.sort === value.sort && previous?.filter === value.filter)
      return
    views.set(owner, value)
  } else views.delete(owner)
}

export function hasColumnPresentation(
  binding: object,
  feature: keyof Features,
) {
  return [...entries(binding).values()].some((value) => value[feature])
}
