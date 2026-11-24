# Links, breadcrumbs and tooltips

UiLink represents a destination. UiBreadcrumbs represents the hierarchical location of the current page. Neither is a router. A business application can use direct hrefs or createUiNavigationControl to project its own navigation state into shared bindings.

```ts
import { ref, onUnmounted } from 'vue'
import { createUiNavigationControl } from '@uninterface/uninterface'
const current = ref<string | undefined>('record')
const navigation = createUiNavigationControl([
  { key: 'home', label: 'Home', href: '/' },
  { key: 'records', label: 'Records', href: '/records', parent: 'home' },
  { key: 'record', label: 'Record', href: '/records/42', parent: 'records' },
], {
  current,
  navigate(location) {
    // Perform application guards/routing, then commit current when accepted.
    current.value = location.key
  },
})
onUnmounted(() => navigation.dispose())
```

```vue
<UiBreadcrumbs :binding="navigation.bindings.breadcrumbs" />
<UiLink :binding="navigation.bindings.link('records')">Records</UiLink>
```

The example commits an in-memory location; a real application also updates its router or browser history. Ordinary same-window clicks invoke navigate with native default prevented. Modified clicks, target=_blank and download retain browser behavior. Providing a binding without navigate leaves native href navigation intact. Async guards belong in the application; a request never commits current automatically. Location keys must be unique, referenced parents must exist and hierarchy must be acyclic. Disposed controls disable their link bindings.

Manual breadcrumbs use direct UiBreadcrumb children. Give repeated items stable keys. The final item is current-page text. Preceding items with href or binding use ordinary links; omit both for a non-link ancestor with no destination. These text items are not interactive or keyboard stops. Do not mix children with a binding. The component supplies a localized navigation name; provide aria-label when multiple trails need distinction. Shortening/overflow strategies remain outside this implementation.

Tooltips supply optional noninteractive descriptions:

```vue
<UiTooltip text="Show the record history" placement="bottom">
  <template #host="{ trigger }">
    <UiButton v-bind="trigger" @click="openHistory">History</UiButton>
  </template>
</UiTooltip>
```

Forward trigger to exactly one actual target, including when it passes through a custom component. The component must forward those target attributes/listeners. It must not require inspection of private descendants. Default triggers are hover and focus; click may be requested independently or combined. v-model:visible permits explicit ownership; otherwise the tooltip owns local visibility. disabled suppresses the tooltip independently of the host action.

The default content slot can replace text with formatted noninteractive content. Existing aria-describedby associations are preserved. Hover can continue onto tooltip content, Escape dismisses, and outside click dismisses a click-open tooltip. The tooltip appears while requested and at least 50% of its anchor is visible after clipping and overlap by known layout regions. The backend resolves placement within the available space. In a modal, the header and footer cover directly owned tooltips, and a tooltip anchored in either section opens toward the body. Browser-native title hints and toolkit-internal tooltips follow their native behavior. Tooltips are supplemental; essential guidance belongs in persistent help text. Interactive popup content needs a different component.

Observable checks: current-page semantics, modifier/new-tab navigation, guarded navigation with unchanged current state, host action preservation, existing descriptions, Escape and disabled behavior. DOM checks cover those mechanics on supporting backends; physical hover continuity, collision placement and modal stacking remain browser acceptance requirements.

See [Navigation menus and shared location](navigation-menus.md) for menu presentations, shared breadcrumbs, lazy paths and the optional Vue Router driver.

For dynamic text in reusable definitions, use [UiTextSource and the text-source practice](text-sources.md). Keep stable identities independent of labels; ordinary component text props continue to use Vue bindings.
