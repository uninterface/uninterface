import { h } from 'vue'
import SearchInput from './views/SearchInput.vue'
import type { UiFilterAdaptation, UiSearchFilterEditorBinding } from './types'
export const filterSearchInput: UiFilterAdaptation<UiSearchFilterEditorBinding> =
  /* @__PURE__ */ Object.freeze<
    UiFilterAdaptation<UiSearchFilterEditorBinding>
  >({
    name: 'search-input',
    pattern: 'search',
    view: (context) => h(SearchInput, { context }),
  })
