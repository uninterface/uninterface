import englishCommon from './locales/common/en'
import type { UiMessages } from './messages'
import type { UiLocaleSource, UiMessageDescriptor } from './types'

export const corePackKeys = {
  common: [
    'ok',
    'cancel',
    'close',
    'retry',
    'required',
    'loadingIndicator',
    'loading',
    'emptyMessage',
    'clearSelection',
  ],
  floating: ['floatingMove', 'floatingPosition'],
  entries: [
    'suggestions',
    'location',
    'selectionUnavailable',
    'entriesNotLoaded',
    'entriesLoading',
    'entriesUpdating',
    'entriesEmpty',
    'suggestionsEmpty',
    'entriesFailed',
  ],
  password: ['showPassword', 'hidePassword'],
  feedback: ['notifications'],
  numbers: [
    'numberEmpty',
    'numberInvalid',
    'numberPrecision',
    'numberRange',
    'numberNegative',
    'numberMinimum',
    'numberMaximum',
  ],
  collections: [
    'filterSearch',
    'filterApply',
    'filterClear',
    'filterMinimum',
    'filterMaximum',
    'filterRangeInvalid',
    'collectionFilters',
    'collectionSort',
    'collectionAddFilter',
    'collectionRemoveFilter',
    'collectionAddSort',
    'collectionSortBy',
    'collectionNoSort',
    'collectionSortField',
    'collectionSortDirection',
    'collectionSortActions',
    'collectionSortPosition',
    'collectionSortReorderHint',
    'collectionSortPriority',
    'collectionSortEarlier',
    'collectionSortLater',
    'collectionRemoveSort',
    'collectionSortAscending',
    'collectionSortDescending',
    'collectionReset',
    'collectionQuery',
    'collectionSummary',
    'collectionActions',
    'listValueChanged',
    'listValueIdentity',
    'listValueInvalid',
    'listItemFailed',
    'listNotLoaded',
    'listLoading',
    'listRefreshing',
    'listAppending',
    'listEmpty',
    'listAppendFailed',
    'listFailed',
    'listRetainedFailed',
    'listStale',
    'listLoaded',
    'listComplete',
    'listLoadMore',
    'listSelectItem',
    'listSelectPage',
    'listSortAscending',
    'listSortDescending',
    'tableFilterColumn',
    'tableFilterActive',
    'tableResizeColumn',
    'tableSizeConstraint',
    'listSortAction',
    'pageFirst',
    'pagePrevious',
    'pageNext',
    'pageLast',
    'pageSize',
    'pageSizeOption',
    'pageJump',
    'pageJumpInvalid',
    'pageNumber',
  ],
  temporal: [
    'temporalDate',
    'temporalTime',
    'temporalDateTime',
    'temporalPrecision',
    'temporalGap',
    'temporalOverlap',
    'temporalStart',
    'temporalEnd',
    'temporalBoundary',
    'temporalUnrestricted',
    'temporalDateOrder',
    'temporalOrder',
    'temporalUnavailable',
    'temporalInvalid',
    'pickDate',
    'pickTime',
    'pickDateTime',
    'rangeStart',
    'rangeDateEnd',
    'rangeEnd',
    'rangeMode',
    'rangeBounded',
    'rangeStartOnly',
    'rangeEndOnly',
    'rangeUnrestricted',
    'rangeNextDay',
    'temporalDuration',
    'openBoundary',
  ],
  files: [
    'uploadPending',
    'uploadFailed',
    'uploadDeliveryFailed',
    'retryDelivery',
    'chooseFile',
    'clearFile',
    'singleFile',
    'fileRejected',
    'cancelUpload',
    'removeFile',
  ],
} as const satisfies Record<string, readonly (keyof UiMessages)[]>
export type CorePackName = keyof typeof corePackKeys
export type CorePackKey<Pack extends CorePackName> =
  (typeof corePackKeys)[Pack][number]
export type CorePack<Pack extends CorePackName> = Pick<
  UiMessages,
  CorePackKey<Pack>
>

export const corePackNames = Object.keys(corePackKeys) as CorePackName[]
export function corePackName(namespace: string) {
  const name = namespace.slice('uninterface.'.length) as CorePackName
  return namespace.startsWith('uninterface.') &&
    Object.hasOwn(corePackKeys, name)
    ? name
    : undefined
}
export const coreMessagePacks = new Map<string, CorePackName>(
  corePackNames.flatMap((name) =>
    corePackKeys[name].map((key) => [key, name] as const),
  ),
)
export function corePackForMessage(message: UiMessageDescriptor) {
  return message.namespace === 'uninterface'
    ? coreMessagePacks.get(message.key)
    : corePackName(message.namespace)
}
export const corePackSources: {
  [Name in CorePackName]: UiLocaleSource<CorePack<Name>>
} = {
  common: {
    resources: {
      en: englishCommon,
      'zh-Hans': () =>
        import('./locales/common/zh-Hans').then((pack) => pack.default),
      'zh-Hant': () =>
        import('./locales/common/zh-Hant').then((pack) => pack.default),
      ar: () => import('./locales/common/ar').then((pack) => pack.default),
    },
    aliases: { zh: 'zh-Hans' },
  },
  floating: {
    resources: {
      en: () => import('./locales/floating/en').then((pack) => pack.default),
      'zh-Hans': () =>
        import('./locales/floating/zh-Hans').then((pack) => pack.default),
      'zh-Hant': () =>
        import('./locales/floating/zh-Hant').then((pack) => pack.default),
      ar: () => import('./locales/floating/ar').then((pack) => pack.default),
    },
    aliases: { zh: 'zh-Hans' },
  },
  entries: {
    resources: {
      en: () => import('./locales/entries/en').then((pack) => pack.default),
      'zh-Hans': () =>
        import('./locales/entries/zh-Hans').then((pack) => pack.default),
      'zh-Hant': () =>
        import('./locales/entries/zh-Hant').then((pack) => pack.default),
      ar: () => import('./locales/entries/ar').then((pack) => pack.default),
    },
    aliases: { zh: 'zh-Hans' },
  },
  password: {
    resources: {
      en: () => import('./locales/password/en').then((pack) => pack.default),
      'zh-Hans': () =>
        import('./locales/password/zh-Hans').then((pack) => pack.default),
      'zh-Hant': () =>
        import('./locales/password/zh-Hant').then((pack) => pack.default),
      ar: () => import('./locales/password/ar').then((pack) => pack.default),
    },
    aliases: { zh: 'zh-Hans' },
  },
  feedback: {
    resources: {
      en: () => import('./locales/feedback/en').then((pack) => pack.default),
      'zh-Hans': () =>
        import('./locales/feedback/zh-Hans').then((pack) => pack.default),
      'zh-Hant': () =>
        import('./locales/feedback/zh-Hant').then((pack) => pack.default),
      ar: () => import('./locales/feedback/ar').then((pack) => pack.default),
    },
    aliases: { zh: 'zh-Hans' },
  },
  numbers: {
    resources: {
      en: () => import('./locales/numbers/en').then((pack) => pack.default),
      'zh-Hans': () =>
        import('./locales/numbers/zh-Hans').then((pack) => pack.default),
      'zh-Hant': () =>
        import('./locales/numbers/zh-Hant').then((pack) => pack.default),
      ar: () => import('./locales/numbers/ar').then((pack) => pack.default),
    },
    aliases: { zh: 'zh-Hans' },
  },
  collections: {
    resources: {
      en: () => import('./locales/collections/en').then((pack) => pack.default),
      'zh-Hans': () =>
        import('./locales/collections/zh-Hans').then((pack) => pack.default),
      'zh-Hant': () =>
        import('./locales/collections/zh-Hant').then((pack) => pack.default),
      ar: () => import('./locales/collections/ar').then((pack) => pack.default),
    },
    aliases: { zh: 'zh-Hans' },
  },
  temporal: {
    resources: {
      en: () => import('./locales/temporal/en').then((pack) => pack.default),
      'zh-Hans': () =>
        import('./locales/temporal/zh-Hans').then((pack) => pack.default),
      'zh-Hant': () =>
        import('./locales/temporal/zh-Hant').then((pack) => pack.default),
      ar: () => import('./locales/temporal/ar').then((pack) => pack.default),
    },
    aliases: { zh: 'zh-Hans' },
  },
  files: {
    resources: {
      en: () => import('./locales/files/en').then((pack) => pack.default),
      'zh-Hans': () =>
        import('./locales/files/zh-Hans').then((pack) => pack.default),
      'zh-Hant': () =>
        import('./locales/files/zh-Hant').then((pack) => pack.default),
      ar: () => import('./locales/files/ar').then((pack) => pack.default),
    },
    aliases: { zh: 'zh-Hans' },
  },
}
