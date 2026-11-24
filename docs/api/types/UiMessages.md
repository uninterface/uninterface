# UiMessages

Import from `@uninterface/uninterface/i18n`. The resolved built-in string pack consumed by core views. Each member below is a string. Resource definitions may use strings or message functions; this interface describes the resulting localized strings, including templates expanded by their consuming controls or views.

Register replacements in application setup, for example:

```ts
createUiApplication(App, {
  i18n: { overrides: { uninterface: { en: { loading: 'Working…' } } } },
})
```

The tables list the English resource text. Braces such as `{count}`, `{page}`, `{column}` and `{level}` identify message parameters, not literal wording for a completed announcement. See [localization](../../guides/localization-and-icons.md) and [uiEnglishMessages](../constants/uiEnglishMessages.md) for resource ownership and defaults. Built-in packs cover English, Simplified Chinese, Traditional Chinese and Arabic. Native toolkit wording comes from the selected backend's synchronized native pack; overriding a core fallback does not replace native resources.

`uninterface.common` contains `ok` (“OK”), `cancel`, `close`, `retry`, `required`, `loadingIndicator`, `loading`, `emptyMessage`, and `clearSelection`. The remaining keys load with their [core feature packs](../../guides/localization-and-icons.md#built-in-message-packs).

## Floating controls

| Member | English resource text |
|---|---|
| `floatingMove` | Move: Alt + arrow keys, right-click or hold to choose a position |
| `floatingPosition` | Position along edge |

## Collection filters

| Member | English resource text |
|---|---|
| `filterSearch` | Search |
| `filterApply` | Apply filter |
| `filterClear` | Clear filter |
| `filterMinimum` | Minimum |
| `filterMaximum` | Maximum |
| `filterRangeInvalid` | The minimum must not exceed the maximum. |

## Collection presentation

| Member | English resource text |
|---|---|
| `collectionFilters` | Filters |
| `collectionSort` | Sorting |
| `collectionAddFilter` | Add filter |
| `collectionRemoveFilter` | Remove filter |
| `collectionAddSort` | Add sort |
| `collectionSortBy` | Sort by |
| `collectionNoSort` | No sort |
| `collectionSortField` | Sort field {level} |
| `collectionSortDirection` | Sort direction {level} |
| `collectionSortActions` | Sort actions {level} |
| `collectionSortPosition` | {label}, priority {position} of {count} |
| `collectionSortReorderHint` | Drag to reorder, or focus and press Alt+Shift+Left/Right. Escape cancels dragging. |
| `collectionSortPriority` | Sort priority |
| `collectionSortEarlier` | Move earlier |
| `collectionSortLater` | Move later |
| `collectionRemoveSort` | Remove sort |
| `collectionSortAscending` | ascending |
| `collectionSortDescending` | descending |
| `collectionReset` | Reset search, filters and sorting |
| `collectionQuery` | Filters and sorting |
| `collectionActions` | Actions |

## Editable collection values

| Member | English resource text |
|---|---|
| `listValueChanged` | The collection changed. Try again. |
| `listValueIdentity` | Item identity changed. |
| `listValueInvalid` | Correct the invalid items. |

## List state and selection

| Member | English resource text |
|---|---|
| `listItemFailed` | The item action failed. Try the action again. |
| `listNotLoaded` | Items not loaded. |
| `listLoading` | Loading items… |
| `listRefreshing` | Refreshing items… |
| `listAppending` | Loading more items… |
| `listEmpty` | No items. |
| `listAppendFailed` | More items could not be loaded. Previously loaded items are still shown. |
| `listFailed` | Items could not be loaded. |
| `listRetainedFailed` | Items could not be loaded. Previous results are retained and may not match the requested filters or page. |
| `listStale` | Results need refreshing. |
| `listLoaded` | {count} items loaded. |
| `listComplete` | All items loaded. |
| `listLoadMore` | Load more |
| `listSelectItem` | Select item {position} |
| `listSelectPage` | Select current items |
| `listSortAscending` | Ascending, priority {position} |
| `listSortDescending` | Descending, priority {position} |
| `listSortAction` | Change sorting |

## Table interaction

| Member | English resource text |
|---|---|
| `tableFilterColumn` | Filter {column} |
| `tableFilterActive` | Filter {column} (active) |
| `tableResizeColumn` | Resize {column} |
| `tableSizeConstraint` | The table columns need more space. Enlarge this area or use a narrower column configuration. |

## Pagination

| Member | English resource text |
|---|---|
| `pageFirst` | First |
| `pagePrevious` | Previous |
| `pageNext` | Next |
| `pageLast` | Last |
| `pageSize` | Items per page |
| `pageSizeOption` | {count} / page |
| `pageJump` | Go to page |
| `pageJumpInvalid` | Enter a positive whole page number within the available pages. |
| `pageNumber` | Page {page} |

## Numeric editing

| Member | English resource text |
|---|---|
| `numberEmpty` | Enter a number. |
| `numberInvalid` | Enter a valid, complete number. |
| `numberPrecision` | The number has too many decimal places. |
| `numberRange` | The number cannot be represented at this precision. |
| `numberNegative` | Enter zero or a positive number. |
| `numberMinimum` | The number is below the minimum. |
| `numberMaximum` | The number is above the maximum. |

## Dates, times and ranges

| Member | English resource text |
|---|---|
| `temporalDate` | Enter a valid, complete calendar date. |
| `temporalTime` | Enter a valid, complete time. |
| `temporalDateTime` | Enter a valid, complete date and time. |
| `temporalPrecision` | The supplied time exceeds the configured precision. |
| `temporalGap` | This local datetime does not exist in the configured timezone. |
| `temporalOverlap` | This local datetime is ambiguous in the configured timezone. |
| `temporalStart` | A start boundary is required. |
| `temporalEnd` | An end boundary is required. |
| `temporalBoundary` | Complete the boundary or explicitly open it. |
| `temporalUnrestricted` | An unrestricted interval is not allowed. |
| `temporalDateOrder` | End date must be on or after start date. |
| `temporalOrder` | End must follow start; the end is exclusive. |
| `temporalUnavailable` | This value or interval is unavailable. |
| `temporalInvalid` | Invalid temporal value or timezone configuration. |
| `pickDate` | Choose date |
| `pickTime` | Choose time |
| `pickDateTime` | Choose date and time |
| `rangeStart` | Start |
| `rangeDateEnd` | End (inclusive) |
| `rangeEnd` | End (exclusive) |
| `rangeMode` | Range boundaries |
| `rangeBounded` | Both boundaries |
| `rangeStartOnly` | Start only |
| `rangeEndOnly` | End only |
| `rangeUnrestricted` | Unrestricted |
| `rangeNextDay` | Next day |
| `temporalDuration` | A time interval must be greater than zero and at most 24 hours. |
| `openBoundary` | Unbounded |

## Files and transfers

| Member | English resource text |
|---|---|
| `uploadPending` | Uploading |
| `uploadFailed` | Upload failed |
| `uploadDeliveryFailed` | Could not add file. |
| `retryDelivery` | Retry delivery |
| `chooseFile` | Choose file |
| `clearFile` | Clear file |
| `singleFile` | Choose exactly one file. |
| `fileRejected` | File could not be selected. |
| `cancelUpload` | Cancel upload |
| `removeFile` | Remove file |

## Common pack

| Member | English resource text |
|---|---|
| `ok` | OK |
| `emptyMessage` | No items. |
| `cancel` | Cancel |
| `clearSelection` | Clear selection |
| `close` | Close |
| `retry` | Retry |
| `loadingIndicator` | Loading… |
| `loading` | In progress |
| `required` | Required |

## Entries, password visibility and feedback

| Member | English resource text |
|---|---|
| `suggestions` | Suggestions |
| `location` | Location |
| `showPassword` | Show password |
| `hidePassword` | Hide password |
| `notifications` | Notifications |
| `selectionUnavailable` | Not in current choices |
| `entriesNotLoaded` | Entries not loaded. |
| `entriesLoading` | Loading entries… |
| `entriesUpdating` | Updating suggestions… |
| `entriesEmpty` | No entries available. |
| `suggestionsEmpty` | No matches. |
| `entriesFailed` | Entries could not be loaded. |

## Ownership and observable verification

`emptyMessage` supplies UiEmpty and built-in successful-empty collection presentation. `listEmpty` is also a member of the pack; overriding it alone does not change those views. Initial, replacement and append read errors use `listFailed`, `listRetainedFailed` and `listAppendFailed` respectively, keeping private source errors out of automatic presentation. `entriesLoading` is fallback wording for manually presented select loading; a native picker may retain its own localized loading wording.

Application labels, literal validation issues, pagination statistics and whole-form result wording remain application-owned. UiForm has no built-in success/failure/activity catalogue. Use a [UiMessageDescriptor](UiMessageDescriptor.md) for validation feedback that must follow language changes without revalidation.

Implementations render resolved text safely and preserve naming, feedback associations and announcement semantics. Verify a language switch while feedback, a collection status and an open overlay are visible: text updates without resetting drafts, selections or control lifetime. Test parameterized messages with actual counts/positions, and verify native wording through the selected backend's integration.
