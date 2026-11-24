import { h } from 'vue'
import type {
  UiFilterAdaptation,
  UiFilterViewContext,
  UiSearchFilterEditorBinding,
} from '@uninterface/uninterface'
import ApplicationSearch from './ApplicationSearch.vue'

// This example uses a labelled search action instead of the default magnifier.
export const applicationSearch: UiFilterAdaptation<UiSearchFilterEditorBinding> =
  Object.freeze({
    name: 'application-search',
    pattern: 'search',
    view: (context: UiFilterViewContext<UiSearchFilterEditorBinding>) =>
      h(ApplicationSearch, { context }),
  })
