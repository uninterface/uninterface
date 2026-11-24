import type { UiListBinding, UiListQuery } from '../bindings/list'
import { requireUiText, type UiTextSource } from '../text/source'

/** Presentation borrows the source-backed query; it never owns a second sort model. */
export interface UiCollectionSortBinding {
  readonly target: 'collection-sort'
  readonly mode: 'single' | 'multiple'
  readonly fields: readonly { readonly key: string; readonly label: string }[]
  readonly sort: UiListQuery['sort']
  readonly disabled: boolean
  setSort(sort: UiListQuery['sort']): Promise<boolean>
}

/** Supply business labels for the source's allowed keys; no read or session is started. */
export function createUiCollectionSortBinding<T, F, S extends string>(
  list: UiListBinding<T, F, S>,
  labels: Readonly<Record<S, UiTextSource>>,
): UiCollectionSortBinding {
  const fields = () =>
    Object.freeze(
      list.sorting.keys.map((key) =>
        Object.freeze({
          key,
          label: requireUiText(
            labels[key],
            `A sort label is required for ${key}.`,
          ),
        }),
      ),
    )
  fields()
  return Object.freeze({
    target: 'collection-sort' as const,
    get mode() {
      return list.sorting.mode
    },
    get fields() {
      return fields()
    },
    get sort() {
      return list.state.query.sort
    },
    get disabled() {
      return list.disabled || list.state.disposed
    },
    setSort(sort: UiListQuery['sort']) {
      if (list.disabled || list.state.disposed) return Promise.resolve(false)
      return list.setQuery({ sort: sort as UiListQuery<F, S>['sort'] })
    },
  })
}
