import type { UiListItemContext, UiListKey } from '../bindings/list'

export interface UiCollectionRow {
  key: UiListKey
  item: unknown
  context: UiListItemContext<unknown>
  selectLabel: string
  issue: string
}

/** Core supplies intent and localized state; the adapter owns semantic targets. */
export interface UiCollectionViewProps {
  /** Optional core editing recovery; true handles or cancels native fallback. */
  recoverFocus?: (
    request: import('../collection/editor-protocol').EditorFocusRequest,
  ) => Promise<boolean>
  dataSummary?: {
    label: string
    /** Table only: leading business columns allocated to the summary label. */
    labelColumnSpan?: number
    status: import('../collection/summary').UiCollectionSummaryStatus
    columns: readonly { key: string; label: string }[]
  }
  rows: readonly UiCollectionRow[]
  label: string
  height: 'content' | 'full'
  scroll: 'none' | 'horizontal' | 'vertical' | 'both'
  selection: 'none' | 'single' | 'multiple'
  disabled: boolean
  busy: boolean
  loading: boolean
  appending: boolean
  empty: boolean
  failed: boolean
  failurePlacement?: 'initial' | 'replacement' | 'append'
  error: unknown
  message: string
  showSummary?: boolean
  summary?: boolean
  announcement: string
  retryLabel: string
  canRetry: boolean
  retry(): Promise<boolean>
  /** Core-resolved terminal feedback; excludes empty, stale, busy and failed states. */
  infinityComplete: boolean
  infinite: boolean
  moreLabel: string
  canLoadMore: boolean
  hasMore: boolean
  loadMore(): Promise<boolean>
  observe(value: { visible: boolean; near: boolean; renewed?: boolean }): void
}
export interface UiListViewProps extends UiCollectionViewProps {
  columns?: number
  columnWidth?: string
}
export interface UiTableViewColumn {
  z?: import('../stacking/runtime').ZBinding
  key: string
  label?: string
  preferredWidth?: number | string
  minWidth?: number | string
  spring: boolean
  resizable: boolean
  align?: 'left' | 'center' | 'right'
  resizeLabel: string
  sortable: boolean
  sort?: 'ascending' | 'descending'
  sortPriority?: number
  primary: boolean
  sortDescription: string
  sortLabel: string
  filter: boolean
  requestSort(order?: 'ascending' | 'descending' | null): Promise<boolean>
}
export interface UiTableViewProps extends UiCollectionViewProps {
  /** Decorative column-aligned creation row; core supplies its action slot. */
  addRow?: boolean
  /** Multiple rules in the whole source query, including non-rendered columns. */
  showSortPriority: boolean
  columns: readonly UiTableViewColumn[]
  sizeConstraintLabel: string
  selectPageLabel: string
  pageSelected: boolean
  pageMixed: boolean
  canSelectPage: boolean
  selectPage(selected: boolean): void
}
export interface UiPaginatorViewProps {
  label: string
  pending: boolean
  firstLabel: string
  previousLabel: string
  nextLabel: string
  lastLabel: string
  pageLabel: string
  canFirst: boolean
  canPrevious: boolean
  canNext: boolean
  canLast: boolean
  canJump: boolean
  page?: number
  pageCount?: number
  total?: number
  acceptedPageSize: number
  first(): Promise<boolean>
  previous(): Promise<boolean>
  next(): Promise<boolean>
  last(): Promise<boolean>
  goTo(page: number): Promise<boolean>
  pageName(page: number): string
}
export interface UiPaginatorSizeSelectViewProps {
  label: string
  value: number
  options: readonly { value: number; label: string }[]
  disabled: boolean
  pending: boolean
  select(size: number): Promise<boolean>
}
export interface UiPaginatorJumperViewProps {
  label: string
  value: string
  disabled: boolean
  pending: boolean
  error: string
  update(value: string): void
  commit(reason: 'enter' | 'blur'): Promise<boolean>
}

export interface UiCollectionCardsViewProps extends UiCollectionViewProps {
  dataSummary?: NonNullable<UiCollectionViewProps['dataSummary']> & {
    /** Collection summary role; reuse the backend card view, independently of hierarchy strategies. */
    cardTreatment: Required<import('../presentation/card').UiCardTreatment>
  }
  grid: boolean
  presentationOptions?: import('../collection/presentation').UiCollectionPresentationOptions
}
export interface UiCollectionCardFieldView {
  z?: import('../stacking/runtime').ZBinding
  key: string
  label: string
  placement:
    | 'title'
    | 'body'
    | 'header-end'
    | 'leading'
    | 'media'
    | 'overlay-end'
}
export interface UiCollectionCardViewProps {
  row: UiCollectionRow
  fields: readonly UiCollectionCardFieldView[]
  selection: 'none' | 'single' | 'multiple'
  part: 'header' | 'body' | 'actions'
}

/** Neutral host; presentation implementations supply its default slot. */
export interface UiCollectionHeaderViewProps {
  adaptation: string
}
