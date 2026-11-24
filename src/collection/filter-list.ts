import type { UiListBinding } from '../bindings/list'
import type { UiCollectionFilterSource } from './filter'

/** Query changes are synchronous; the list owns asynchronous loading and errors. */
export function createUiListFilterSource<T, F, S extends string>(
  binding: UiListBinding<T, F, S>,
): UiCollectionFilterSource<F> {
  return Object.freeze({
    read: () => binding.state.query.filters,
    disabled: () => binding.disabled || binding.state.disposed,
    update(transform: (current: Readonly<F>) => F) {
      if (binding.disabled || binding.state.disposed) return false
      const before = binding.state.query.filters
      const next = transform(before)
      if (next === before) return true
      // A source failure remains in the list's read/error state. This return value
      // reports query acceptance, not the eventual source result.
      void binding.setQuery({ filters: next })
      return binding.state.query.filters !== before
    },
  })
}
