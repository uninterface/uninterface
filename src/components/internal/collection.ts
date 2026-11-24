import {
  computed,
  getCurrentInstance,
  inject,
  onActivated,
  onDeactivated,
  onScopeDispose,
  shallowReactive,
  shallowRef,
  toRaw,
  watchEffect,
} from 'vue'
import type { UiListBinding } from '../../bindings/list'
import type { UiCollectionViewProps } from '../../backend/collection'
import { useMessages } from '../../i18n/messages'
import { resolveContent } from '../../layout/content'
import { createListContinuation } from './list-continuation'
import { collectionEditorViewKey } from '../../collection/editor-protocol'
import { uiBackend } from '@uninterface/backend'
import { assertUiCapabilities } from '../../backend/capabilities'

import type { UiCollectionMessages } from '../../collection/feedback'

type Binding = UiListBinding<any, any, any>
type Host = {
  visible: boolean
  near: boolean
  infinite: boolean
  announcement: string
}
interface Session {
  hosts: Set<Host>
  lastMessage: string
  continuation: ReturnType<typeof createListContinuation>
}
const applications = new WeakMap<object, WeakMap<object, Session>>()

export interface CollectionProps {
  binding: Binding
  ariaLabel?: string
  height?: 'content' | 'full'
  scroll?: 'none' | 'horizontal' | 'vertical' | 'both'
  loading?: boolean
  infinite?: boolean
  messages?: UiCollectionMessages
  showSummary?: boolean
}

export function useCollection(props: CollectionProps) {
  const initial = toRaw(props.binding)
  const editor = inject(collectionEditorViewKey, undefined)
  if (editor && toRaw(editor.binding) === initial)
    assertUiCapabilities(uiBackend, ['collection.editor-focus.v1'])
  const app = getCurrentInstance()!.appContext
  let sessions = applications.get(app)
  if (!sessions) applications.set(app, (sessions = new WeakMap()))
  let session = sessions.get(initial)
  if (!session) {
    session = {
      hosts: shallowReactive(new Set()),
      lastMessage: '',
      continuation: createListContinuation(initial),
    }
    sessions.set(initial, session)
  }
  const shared = session
  const host = shallowReactive<Host>({
    visible: false,
    near: false,
    infinite: false,
    announcement: '',
  })
  shared.hosts.add(host)
  const enabled = shallowRef(true)
  onActivated(() => {
    enabled.value = true
  })
  onDeactivated(() => {
    enabled.value = false
    host.visible = false
  })
  onScopeDispose(() => {
    host.visible = false
    shared.hosts.delete(host)
  })
  const messages = useMessages('collections')
  const infinityComplete = computed(() => {
    const state = props.binding.state
    return Boolean(
      props.infinite &&
        !props.loading &&
        state.error === null &&
        state.activity === 'idle' &&
        !state.stale &&
        state.result?.items.length &&
        !props.binding.hasMore,
    )
  })
  const message = computed(() => {
    const state = props.binding.state
    const m = messages.value
    if (props.loading) return m.loadingIndicator
    if (state.error !== null)
      return state.failedRead === 'append'
        ? m.listAppendFailed
        : state.result
          ? m.listRetainedFailed
          : m.listFailed
    if (state.activity === 'appending')
      return props.messages?.listAppending ?? m.listAppending
    if (state.activity === 'refreshing') return m.listRefreshing
    if (state.activity === 'loading') return m.listLoading
    if (state.stale) return m.listStale
    if (!state.result) return m.listNotLoaded
    if (!state.result.items.length) return m.emptyMessage
    if (infinityComplete.value)
      return props.messages?.listComplete ?? m.listComplete
    return m.listLoaded.replace('{count}', String(state.result.items.length))
  })
  watchEffect(() => {
    const primary = [...shared.hosts].find((candidate) => candidate.visible)
    if (primary !== host) {
      host.announcement = ''
      return
    }
    const text = message.value
    if (shared.lastMessage !== text) {
      shared.lastMessage = text
      host.announcement = text
    }
  })
  async function pump() {
    while (
      enabled.value &&
      host.visible &&
      host.infinite &&
      [...shared.hosts].find(
        (candidate) => candidate.visible && candidate.infinite,
      ) === host &&
      (await shared.continuation.request())
    ) {
      /* bounded by the shared budget */
    }
  }
  // Readiness changes (including the end of an append) can fill an underfull
  // viewport, but only the elected visible infinite host spends the shared budget.
  watchEffect(
    () => {
      host.infinite = Boolean(props.infinite)
      const primary = [...shared.hosts].find(
        (candidate) => candidate.visible && candidate.infinite,
      )
      const ready = props.binding.canLoadMore
      void props.binding.generation
      if (primary !== host) return
      shared.continuation.observe({
        visible: enabled.value && host.visible,
        near: host.near,
      })
      if (ready) void pump()
    },
    { flush: 'post' },
  )
  function observe(value: {
    visible: boolean
    near: boolean
    renewed?: boolean
  }) {
    host.visible = enabled.value && value.visible
    host.near = value.near
    const primary = [...shared.hosts].find(
      (candidate) => candidate.visible && candidate.infinite,
    )
    if (primary === host) {
      shared.continuation.observe({ ...value, visible: host.visible })
      void pump()
    }
  }
  const view = computed<UiCollectionViewProps>(() => {
    const binding = props.binding
    if (toRaw(binding) !== initial)
      throw new Error('Changing a collection binding requires a keyed remount.')
    if (binding.target !== 'list')
      throw new Error('Collection requires a list binding.')
    if (!props.ariaLabel?.trim())
      throw new Error('A collection requires a meaningful aria-label.')
    const allocation = resolveContent({
      height: props.height,
      // A bounded collection always owns vertical overflow. Horizontal
      // permission is independent and remains explicitly requested.
      scroll:
        props.height === 'full' &&
        (props.scroll === undefined || props.scroll === 'none')
          ? 'vertical'
          : props.height === 'full' && props.scroll === 'horizontal'
            ? 'both'
            : props.scroll,
      'aria-label': props.ariaLabel,
    })
    if (props.infinite && binding.continuation !== 'accumulate')
      throw new Error(
        'Infinite presentation requires an accumulation-capable binding.',
      )
    if (props.infinite && !['vertical', 'both'].includes(allocation.scroll))
      throw new Error(
        'Infinite presentation requires a bounded vertical scrollport.',
      )
    const state = binding.state
    return {
      recoverFocus:
        editor && toRaw(editor.binding) === initial
          ? (request) => editor.recoverFocus(request)
          : undefined,
      rows: binding.items.map((item, index) => {
        const key = binding.itemKey(item)
        return {
          item,
          key,
          context: binding.context(key),
          issue:
            binding.context(key).error !== null
              ? messages.value.listItemFailed
              : '',
          selectLabel: messages.value.listSelectItem.replace(
            '{position}',
            String(index + 1),
          ),
        }
      }),
      label: props.ariaLabel,
      height: allocation.height,
      scroll: allocation.scroll,
      selection: binding.selection,
      disabled: binding.disabled,
      busy: Boolean(props.loading) || state.activity !== 'idle',
      loading:
        Boolean(props.loading) ||
        state.activity === 'loading' ||
        state.activity === 'refreshing',
      appending: state.activity === 'appending',
      empty:
        state.error === null &&
        !props.loading &&
        state.activity === 'idle' &&
        Boolean(state.result) &&
        binding.items.length === 0,
      failed: state.error !== null,
      failurePlacement:
        state.error !== null
          ? (state.failedRead ?? (state.result ? 'replacement' : 'initial'))
          : undefined,
      error: state.error,
      message: message.value,
      summary:
        state.error === null &&
        !props.loading &&
        state.activity === 'idle' &&
        !state.stale &&
        Boolean(state.result?.items.length) &&
        !(props.infinite && !binding.hasMore),
      showSummary: props.showSummary === true,
      announcement: host.announcement,
      retryLabel: messages.value.retry,
      canRetry: binding.canRetry,
      retry: () => binding.retry(),
      infinityComplete: infinityComplete.value,
      infinite: Boolean(props.infinite),
      moreLabel: messages.value.listLoadMore,
      canLoadMore: binding.canLoadMore,
      hasMore: binding.hasMore,
      loadMore: () => binding.loadMore(),
      observe,
    }
  })
  return Object.assign(view, { messagesReady: messages.ready })
}
