import type { UiListBinding } from '../../bindings/list'

/** Header intent edits one clause without taking query ownership from the list. */
export function cycleTableSort<T, F, S extends string>(
  binding: UiListBinding<T, F, S>,
  key: S,
  order?: 'ascending' | 'descending' | null,
): Promise<boolean> {
  if (binding.disabled || !binding.sorting.keys.includes(key))
    return Promise.resolve(false)
  const sort = [...binding.state.query.sort]
  const index = sort.findIndex((clause) => clause.key === key)
  const direction =
    order === undefined
      ? index < 0
        ? 'asc'
        : sort[index].direction === 'asc'
          ? 'desc'
          : undefined
      : order === 'ascending'
        ? 'asc'
        : order === 'descending'
          ? 'desc'
          : undefined
  if (direction === undefined) {
    if (index < 0) return Promise.resolve(false)
    sort.splice(index, 1)
  } else if (index < 0) sort.push({ key, direction })
  else {
    if (sort[index].direction === direction) return Promise.resolve(false)
    sort[index] = { key, direction }
  }
  return binding.setQuery({
    sort:
      binding.sorting.mode === 'single' && direction
        ? [{ key, direction }]
        : sort,
  })
}
