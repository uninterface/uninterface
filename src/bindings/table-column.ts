import { resolveUiText, type UiTextSource } from '../text/source'
import { validateColumnSizing } from '../table/columns'
import type { UiListBinding, UiListItemContext } from './list'

export interface UiListSlotProps<T> {
  readonly item: T
  readonly context: UiListItemContext<T>
}

export interface UiTableColumnDefinition<
  S extends string = string,
  K extends string = string,
> {
  readonly columnKey: string
  readonly label?: UiTextSource
  readonly sortBy?: S
  readonly preferredWidth?: number | string
  readonly minWidth?: number | string
  readonly spring?: boolean
  readonly resizable?: boolean
  readonly align?: 'left' | 'center' | 'right'
  readonly filterBy?: K
  /** Business-supplied applied state; arbitrary query values are not inferred. */
  readonly filterActive?: boolean
}

export interface UiTableColumnBinding<
  T,
  F = Record<string, unknown>,
  S extends string = string,
> {
  readonly target: 'table-column'
  readonly list: UiListBinding<T, F, S>
  readonly definition: UiTableColumnDefinition<S, Extract<keyof F, string>> & {
    readonly label?: string
  }
}

/** Optional reusable column meaning, independent of its content and any toolkit. */
export function createUiTableColumnBinding<T, F, S extends string>(
  list: UiListBinding<T, F, S>,
  definition: () => UiTableColumnDefinition<
    NoInfer<S>,
    Extract<keyof NoInfer<F>, string>
  >,
): UiTableColumnBinding<T, F, S> {
  if (list.target !== 'list')
    throw new Error('A table column requires a list binding.')
  return Object.freeze({
    target: 'table-column',
    list,
    get definition() {
      const value = definition()
      if (typeof value.columnKey !== 'string' || !value.columnKey.trim())
        throw new Error('Table columnKey must be nonempty.')
      validateColumnSizing(value)
      return Object.freeze({ ...value, label: resolveUiText(value.label) })
    },
  })
}
