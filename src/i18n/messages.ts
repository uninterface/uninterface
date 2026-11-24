import { computed, onServerPrefetch, shallowRef, watch } from 'vue'
import { useUiI18n } from './context'
import { retainCoreMessages } from './control'
import {
  coreMessagePacks,
  corePackForMessage,
  corePackKeys,
  type CorePackKey,
  type CorePackName,
} from './packs'
import type { UiMessageDescriptor } from './types'
export interface UiMessages {
  ok: string
  floatingMove: string
  floatingPosition: string
  filterSearch: string
  filterApply: string
  filterClear: string
  filterMinimum: string
  filterMaximum: string
  filterRangeInvalid: string

  listValueChanged: string
  listValueIdentity: string
  listValueInvalid: string
  listItemFailed: string
  listNotLoaded: string
  listLoading: string
  listRefreshing: string
  listAppending: string
  emptyMessage: string
  listEmpty: string
  listFailed: string
  listAppendFailed: string
  listRetainedFailed: string
  listStale: string
  listLoaded: string
  listComplete: string
  listLoadMore: string
  listSelectItem: string
  listSelectPage: string
  collectionActions: string
  collectionSummary: string
  collectionFilters: string
  collectionSort: string
  collectionAddFilter: string
  collectionRemoveFilter: string
  collectionAddSort: string
  collectionSortBy: string
  collectionNoSort: string
  collectionSortField: string
  collectionSortDirection: string
  collectionSortActions: string
  collectionSortPriority: string
  collectionSortPosition: string
  collectionSortReorderHint: string
  collectionSortEarlier: string
  collectionSortLater: string
  collectionRemoveSort: string
  collectionSortAscending: string
  collectionSortDescending: string
  collectionReset: string
  collectionQuery: string
  listSortAscending: string
  listSortDescending: string
  listSortAction: string
  tableFilterColumn: string
  tableFilterActive: string
  tableResizeColumn: string
  tableSizeConstraint: string
  pageFirst: string
  pagePrevious: string
  pageNext: string
  pageLast: string
  pageSize: string
  pageSizeOption: string
  pageJump: string
  pageJumpInvalid: string
  pageNumber: string

  numberEmpty: string
  numberInvalid: string
  numberPrecision: string
  numberRange: string
  numberNegative: string
  numberMinimum: string
  numberMaximum: string

  rangeMode: string
  rangeBounded: string
  rangeStartOnly: string
  rangeEndOnly: string
  rangeUnrestricted: string
  rangeNextDay: string
  temporalDuration: string

  temporalDate: string
  temporalTime: string
  temporalDateTime: string
  temporalPrecision: string
  temporalGap: string
  temporalOverlap: string
  temporalStart: string
  temporalEnd: string
  temporalBoundary: string
  temporalUnrestricted: string
  temporalDateOrder: string
  temporalOrder: string
  temporalUnavailable: string
  temporalInvalid: string

  pickDate: string
  pickTime: string
  pickDateTime: string

  rangeStart: string
  rangeDateEnd: string
  rangeEnd: string
  openBoundary: string

  uploadPending: string
  uploadFailed: string
  uploadDeliveryFailed: string
  retryDelivery: string
  chooseFile: string
  clearFile: string
  singleFile: string
  fileRejected: string
  cancel: string
  cancelUpload: string
  removeFile: string

  suggestions: string
  location: string
  showPassword: string
  hidePassword: string
  clearSelection: string
  notifications: string
  close: string
  selectionUnavailable: string
  entriesNotLoaded: string
  entriesLoading: string
  entriesUpdating: string
  entriesEmpty: string
  suggestionsEmpty: string
  entriesFailed: string
  retry: string
  loadingIndicator: string
  loading: string
  required: string
}
export function useMessages<const Name extends CorePackName>(...names: Name[]) {
  return useMessagesWhen(() => true, ...names)
}

export function useMessagesWhen<const Name extends CorePackName>(
  enabled: () => boolean,
  ...names: Name[]
) {
  const i18n = useUiI18n()
  const namespaces = names.map((name) => `uninterface.${name}`)
  const failure = shallowRef<{ error: unknown }>()
  let pending: Promise<void[]> | undefined
  if (names.length) {
    watch(
      enabled,
      (usesPacks, _, cleanup) => {
        pending = undefined
        failure.value = undefined
        if (!usesPacks) return
        const { ready, release } = retainCoreMessages.get(i18n)!(names)
        let watching = true
        cleanup(() => {
          watching = false
          release()
        })
        pending = ready
        void ready.catch((error) => {
          if (watching) failure.value = { error }
        })
      },
      { immediate: true, flush: 'sync' },
    )
    onServerPrefetch(() => pending)
  }
  const ready = computed(() => {
    const available = namespaces.every((namespace) =>
      Object.hasOwn(i18n.state.value.resolved, namespace),
    )
    if (enabled() && !available && failure.value) throw failure.value.error
    return available
  })
  const keys = [
    ...corePackKeys.common,
    ...names.flatMap((name) => corePackKeys[name]),
  ]
  const values = computed(
    () =>
      Object.fromEntries(
        keys.map((key) => [
          key,
          ready.value || coreMessagePacks.get(key) === 'common'
            ? i18n.text({ namespace: 'uninterface', key })
            : '',
        ]),
      ) as Pick<UiMessages, CorePackKey<'common' | Name>>,
  )
  return Object.assign(values, { ready })
}

/** Prepare structured issues whose originating codec may be owned outside the view. */
export function useIssueText(
  getIssue: () => string | UiMessageDescriptor | null,
) {
  const i18n = useUiI18n()
  const failure = shallowRef<{
    issue: string | UiMessageDescriptor
    error: unknown
  }>()
  const pack = computed(() => {
    const issue = getIssue()
    if (!issue || typeof issue === 'string') return
    return corePackForMessage(issue)
  })
  let pending: Promise<void[]> | undefined
  watch(
    pack,
    (name, _, cleanup) => {
      pending = undefined
      failure.value = undefined
      if (!name || name === 'common') return
      const { ready, release } = retainCoreMessages.get(i18n)!([name])
      let watching = true
      cleanup(() => {
        watching = false
        release()
      })
      pending = ready
      void ready.catch((error) => {
        const issue = getIssue()
        if (watching && issue) failure.value = { issue, error }
      })
    },
    { immediate: true, flush: 'sync' },
  )
  onServerPrefetch(() => pending)
  return computed(() => {
    const issue = getIssue()
    if (!issue) return null
    const name = pack.value
    if (
      name &&
      !Object.hasOwn(i18n.state.value.resolved, `uninterface.${name}`)
    ) {
      if (failure.value?.issue === issue) throw failure.value.error
      return null
    }
    return i18n.text(issue)
  })
}
