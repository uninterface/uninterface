import type { UiButtonBinding } from './button'

/** Source capabilities, optionally narrowed by its business integration. */
export interface UiListSorting<S extends string = string> {
  readonly mode: 'single' | 'multiple'
  readonly keys: readonly S[]
}

/** Stable business identity; numeric and string keys remain distinct. */
export type UiListKey = string | number

export interface UiListQuery<
  F = Record<string, unknown>,
  S extends string = string,
> {
  readonly filters: Readonly<F>
  readonly sort: readonly {
    readonly key: S
    readonly direction: 'asc' | 'desc'
  }[]
  readonly pagination?:
    | {
        readonly kind: 'numbered'
        readonly number: number
        readonly size: number
      }
    | {
        readonly kind: 'cursor'
        readonly cursor: string | null
        readonly size: number
      }
}

export type UiListPaginationResult =
  | {
      readonly kind: 'numbered'
      readonly number: number
      readonly size: number
      readonly total?: number
      /** Required when total is unknown. */
      readonly hasNext?: boolean
    }
  | {
      readonly kind: 'cursor'
      readonly cursor: string | null
      readonly size: number
      /** null means the source has declared completion. */
      readonly next: string | null
      readonly previous?: string | null
      readonly total?: number
      readonly offset?: number
    }

export interface UiListResult<T> {
  readonly items: readonly T[]
  /** Complete matching collection, as opposed to a window or partial result. */
  readonly complete: boolean
  readonly pagination?: UiListPaginationResult
}

export interface UiListState<
  T,
  F = Record<string, unknown>,
  S extends string = string,
> {
  readonly query: UiListQuery<F, S>
  readonly result?: UiListResult<T> & { readonly query: UiListQuery<F, S> }
  readonly activity: 'idle' | 'loading' | 'refreshing' | 'appending'
  /** Current failed read; absent when no failure or unspecified by a custom producer. */
  readonly failedRead?: 'initial' | 'replacement' | 'append'
  readonly error: unknown | null
  readonly stale: boolean
  readonly disposed: boolean
  readonly selectedKeys: readonly UiListKey[]
}

export interface UiListItemContext<T> {
  readonly key: UiListKey
  readonly item: T | undefined
  readonly selected: boolean
  readonly selectable: boolean
  readonly disabled: boolean
  readonly pending: boolean
  readonly error: unknown | null
  readonly bindings: {
    readonly removeButton?: UiButtonBinding
    readonly activateButton?: UiButtonBinding
  }
  requestSelected(selected: boolean): void
}

/** Views borrow this contract; they never load on mount or dispose its owner. */
export interface UiListBinding<
  T,
  F = Record<string, unknown>,
  S extends string = string,
> {
  readonly target: 'list'
  readonly sorting: UiListSorting<S>
  /** Explicit capability, available even before the first result. */
  readonly continuation: 'none' | 'accumulate'
  /** Increments when a replacement read starts; appends retain their generation. */
  readonly generation: number
  readonly state: UiListState<T, F, S>
  readonly items: readonly T[]
  readonly selection: 'none' | 'single' | 'multiple'
  readonly disabled: boolean
  readonly canLoadMore: boolean
  readonly hasMore: boolean
  readonly canRetry: boolean
  itemKey(item: T): UiListKey
  context(key: UiListKey): UiListItemContext<T>
  setQuery(
    query: Partial<Pick<UiListQuery<F, S>, 'filters' | 'sort'>>,
  ): Promise<boolean>
  selectPage(selected: boolean): void
  retry(): Promise<boolean>
  /** Automatic requests stop on failure; explicit retry remains available. */
  loadMore(): Promise<boolean>
}

export interface UiPaginatorBinding {
  readonly target: 'paginator'
  readonly kind: 'numbered' | 'cursor'
  readonly requested: NonNullable<UiListQuery['pagination']>
  readonly accepted?: UiListPaginationResult
  readonly total?: number
  readonly pageCount?: number
  readonly range?: { readonly start: number; readonly end: number }
  readonly pageSizes: readonly number[]
  readonly pending: boolean
  readonly disabled: boolean
  readonly error: unknown | null
  readonly canNext: boolean
  readonly canPrevious: boolean
  readonly canFirst: boolean
  readonly canJump: boolean
  readonly canChangeSize: boolean
  next(): Promise<boolean>
  previous(): Promise<boolean>
  first(): Promise<boolean>
  goTo(number: number): Promise<boolean>
  setPageSize(size: number): Promise<boolean>
  retry(): Promise<boolean>
}
