import type { UiListQuery, UiListResult } from '../bindings/list'

/** Adapts complete business data without taking ownership or observing writes. */
export function createUiLocalListSource<
  T,
  F = Record<string, unknown>,
  S extends string = string,
>(options: {
  items: () => readonly T[]
  matches?: (item: T, filters: Readonly<F>) => boolean
  compare?: Partial<Record<S, (left: T, right: T) => number>>
}): (query: UiListQuery<F, S>) => UiListResult<T> {
  return (query) => {
    const pagination = query.pagination
    if (pagination?.kind === 'cursor')
      throw new Error('Local list sources require numbered pagination.')
    if (!options.matches && Object.keys(query.filters as object).length)
      throw new Error('Local list filters require a matches function.')
    for (const sort of query.sort)
      if (!options.compare?.[sort.key])
        throw new Error(`Unsupported local sort: ${sort.key}`)
    const items = options
      .items()
      .filter(
        (item) => !options.matches || options.matches(item, query.filters),
      )
      .map((item, index) => ({ item, index }))
    if (query.sort.length)
      items.sort((left, right) => {
        for (const sort of query.sort) {
          const order = options.compare![sort.key]!(left.item, right.item)
          if (!Number.isFinite(order))
            throw new Error(
              'Local list comparator must return a finite number.',
            )
          if (order) return sort.direction === 'asc' ? order : -order
        }
        return left.index - right.index
      })
    if (!pagination)
      return { items: items.map(({ item }) => item), complete: true }
    const total = items.length
    const number = Math.min(
      pagination.number,
      Math.max(1, Math.ceil(total / pagination.size)),
    )
    const start = (number - 1) * pagination.size
    return {
      items: items
        .slice(start, start + pagination.size)
        .map(({ item }) => item),
      complete: total <= pagination.size,
      pagination: { kind: 'numbered', number, size: pagination.size, total },
    }
  }
}
