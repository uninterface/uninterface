import { computed, shallowRef } from 'vue'
import englishCommon from './locales/common/en'
import { canonicalLocale, localeDirection, resolveLocale } from './locale'
import {
  coreMessagePacks,
  corePackKeys,
  corePackName,
  corePackSources,
  type CorePackName,
} from './packs'
import type {
  UiI18nControl,
  UiI18nOptions,
  UiLocaleSource,
  UiMessageContext,
  UiMessagePack,
} from './types'

export const coreLocales = corePackSources.common

type PreparedPack = { namespace: string; locale: string; pack: UiMessagePack }
export const retainCoreMessages = new WeakMap<
  UiI18nControl,
  (names: readonly CorePackName[]) => {
    ready: Promise<void[]>
    release(): void
  }
>()

export function createUiI18nControl(
  options: UiI18nOptions = {},
  native?: {
    source: UiLocaleSource<unknown>
    commit(resource: unknown, locale: string): void
  },
): UiI18nControl {
  if (options.resources?.backend)
    throw new Error('The backend resource namespace is reserved.')
  for (const key of Object.keys(
    options.resources?.uninterface?.resources ?? {},
  )) {
    if (Object.hasOwn(coreLocales.resources, canonicalLocale(key)))
      throw new Error('Use overrides to customize an existing built-in locale.')
  }
  const { uninterface: extraCore, ...sources } = options.resources ?? {}
  if (
    Object.keys(sources).some((namespace) =>
      namespace.startsWith('uninterface.'),
    )
  )
    throw new Error('The uninterface.* resource namespaces are reserved.')
  const coreLocaleSource: UiLocaleSource = {
    resources: { ...coreLocales.resources, ...extraCore?.resources },
    aliases: { ...coreLocales.aliases, ...extraCore?.aliases },
  }
  const preloaded = new Set([
    'uninterface.common',
    ...Object.keys(sources).filter((namespace) => !sources[namespace].lazy),
  ])
  for (const namespace of options.preloadCore ?? []) {
    const name = corePackName(namespace)
    if (!name) throw new Error(`Unknown core message namespace: ${namespace}.`)
    preloaded.add(namespace)
  }
  const users = new Map<string, number>()
  const needed = (namespace: string) =>
    preloaded.has(namespace) || users.has(namespace)
  const requestedPacks = () => [...new Set([...preloaded, ...users.keys()])]
  const fallback =
    options.fallback === false
      ? false
      : canonicalLocale(options.fallback ?? 'en')
  const snapshot = shallowRef({
    locale: 'en',
    requestedLocale: 'en',
    formattingLocale: canonicalLocale(options.formattingLocale ?? 'en'),
    direction: 'ltr' as 'ltr' | 'rtl',
    pending: false,
    error: undefined as unknown,
    resolved: Object.freeze({
      uninterface: 'en',
      'uninterface.common': 'en',
      ...(native ? { backend: 'en' } : {}),
    }) as Readonly<Record<string, string>>,
    packs: {
      'uninterface.common': {
        ...Object.fromEntries(
          corePackKeys.common.map((key) => [
            key,
            options.overrides?.['uninterface.common']?.en?.[key] ??
              options.overrides?.uninterface?.en?.[key] ??
              englishCommon[key],
          ]),
        ),
      },
    } as Record<string, UiMessagePack>,
  })
  const cache = new Map<string, Promise<unknown>>()
  let revision = 0
  let disposed = false
  const state = computed(() => {
    const { packs: _packs, ...value } = snapshot.value
    return Object.freeze(value)
  })
  function load<T>(
    namespace: string,
    source: UiLocaleSource<T>,
    locale: string,
  ) {
    const key = `${namespace}:${locale}`
    const existing = cache.get(key)
    if (existing) return existing as Promise<T>
    const value = source.resources[locale]
    const resource = Promise.resolve().then(() =>
      typeof value === 'function' ? (value as () => T | Promise<T>)() : value,
    )
    cache.set(key, resource)
    void resource.catch(() => cache.delete(key))
    return resource
  }
  async function prepareCore(
    name: CorePackName,
    requested: string,
  ): Promise<PreparedPack> {
    const namespace = `uninterface.${name}`
    const key = resolveLocale(requested, coreLocaleSource, fallback)
    const locale = canonicalLocale(key)
    const source: UiLocaleSource = corePackSources[name]
    const builtIn = Object.hasOwn(source.resources, key)
    const resource = builtIn
      ? await load(namespace, source, key)
      : await load('uninterface', coreLocaleSource, key)
    const overrides = {
      ...options.overrides?.uninterface?.[locale],
      ...options.overrides?.[namespace]?.[locale],
    }
    const keys =
      !builtIn && name === 'common'
        ? [...coreMessagePacks.keys()]
        : corePackKeys[name]
    for (const message of keys) {
      const packName = coreMessagePacks.get(message)!
      const replacement =
        options.overrides?.[`uninterface.${packName}`]?.[locale]?.[message]
      if (!(replacement ?? overrides[message] ?? resource[message]))
        throw new Error(`Missing required message: uninterface.${message}`)
    }
    const pack = Object.fromEntries(
      corePackKeys[name].map((message) => [
        message,
        overrides[message] ?? resource[message],
      ]),
    )
    return { namespace, locale, pack }
  }
  async function preparePack(
    namespace: string,
    requested: string,
  ): Promise<PreparedPack> {
    const core = corePackName(namespace)
    if (core) return prepareCore(core, requested)
    const source = sources[namespace]
    const key = resolveLocale(requested, source, fallback)
    const locale = canonicalLocale(key)
    return {
      namespace,
      locale,
      pack: {
        ...(await load(namespace, source, key)),
        ...options.overrides?.[namespace]?.[locale],
      },
    }
  }
  async function setLocale(value: string) {
    if (disposed) throw new Error('Locale control is disposed.')
    const locale = canonicalLocale(value)
    const current = ++revision
    snapshot.value = {
      ...snapshot.value,
      requestedLocale: locale,
      pending: true,
      error: undefined,
    }
    try {
      const prepareRequested = async (namespace: string) => {
        try {
          return await preparePack(namespace, locale)
        } catch (error) {
          if (needed(namespace)) throw error
        }
      }
      const backendKey =
        native && resolveLocale(locale, native.source, fallback)
      const [initialPacks, backend] = await Promise.all([
        Promise.all(requestedPacks().map(prepareRequested)),
        native && backendKey
          ? load('backend', native.source, backendKey)
          : undefined,
      ])
      const loaded = new Map(
        initialPacks.flatMap((entry) =>
          entry ? ([[entry.namespace, entry]] as const) : [],
        ),
      )
      // A feature can mount while a language request is in flight.
      // Include its dependencies before activating the new language.
      while (!disposed && current === revision) {
        const remaining = requestedPacks().filter(
          (namespace) => !loaded.has(namespace),
        )
        if (!remaining.length) break
        for (const entry of await Promise.all(remaining.map(prepareRequested)))
          if (entry) loaded.set(entry.namespace, entry)
      }
      if (disposed || current !== revision) return
      const prepared = requestedPacks().map(
        (namespace) => loaded.get(namespace)!,
      )
      const packs = Object.fromEntries(
        prepared.map(({ namespace, pack }) => [namespace, pack]),
      )
      const resolved = Object.fromEntries(
        prepared.map(({ namespace, locale }) => [namespace, locale]),
      )
      resolved.uninterface = resolved['uninterface.common']
      if (native && backendKey) {
        resolved.backend = canonicalLocale(backendKey)
        native.commit(backend, resolved.backend)
      }
      snapshot.value = {
        ...snapshot.value,
        locale,
        direction: localeDirection(locale),
        resolved: Object.freeze(resolved),
        packs,
        pending: false,
        error: undefined,
      }
    } catch (error) {
      if (disposed || current !== revision) return
      snapshot.value = { ...snapshot.value, pending: false, error }
      throw error
    }
  }
  async function loadPack(namespace: string) {
    while (
      !disposed &&
      needed(namespace) &&
      !Object.hasOwn(snapshot.value.packs, namespace)
    ) {
      const locale = snapshot.value.locale
      const entry = await preparePack(namespace, locale)
      if (
        disposed ||
        !needed(namespace) ||
        snapshot.value.locale !== locale ||
        Object.hasOwn(snapshot.value.packs, namespace)
      )
        continue
      snapshot.value = {
        ...snapshot.value,
        packs: { ...snapshot.value.packs, [namespace]: entry.pack },
        resolved: Object.freeze({
          ...snapshot.value.resolved,
          [namespace]: entry.locale,
        }),
      }
    }
  }
  async function loadNamespace(namespace: string) {
    if (disposed) throw new Error('Locale control is disposed.')
    if (!corePackName(namespace) && !Object.hasOwn(sources, namespace))
      throw new Error(`Unknown message namespace: ${namespace}.`)
    preloaded.add(namespace)
    await control.ready
    await loadPack(namespace)
  }
  const number: UiI18nControl['number'] = (value, options) =>
    new Intl.NumberFormat(snapshot.value.formattingLocale, options).format(
      value,
    )
  const control: UiI18nControl = {
    state,
    ready: Promise.resolve(),
    setLocale,
    loadNamespace,
    setFormattingLocale(locale) {
      if (disposed) throw new Error('Locale control is disposed.')
      snapshot.value = {
        ...snapshot.value,
        formattingLocale: canonicalLocale(locale),
      }
    },
    text(message) {
      if (typeof message === 'string') return message
      const { key, params = {} } = message
      const name =
        message.namespace === 'uninterface' && coreMessagePacks.get(key)
      const namespace = name ? `uninterface.${name}` : message.namespace
      const pack = snapshot.value.packs[namespace]
      const entry = Object.hasOwn(pack ?? {}, key) ? pack[key] : undefined
      if (entry === undefined) {
        if (
          (corePackName(namespace) || Object.hasOwn(sources, namespace)) &&
          !Object.hasOwn(snapshot.value.packs, namespace)
        )
          throw new Error(
            `Message pack ${namespace} is unavailable. Await loadNamespace before looking up its messages.`,
          )
        throw new Error(
          `Missing message: ${namespace}.${key} (${snapshot.value.locale}).`,
        )
      }
      if (typeof entry === 'string') return entry
      const context: UiMessageContext = {
        locale: snapshot.value.resolved[namespace],
        params,
        number,
        plural(count, forms) {
          const category = new Intl.PluralRules(context.locale).select(count)
          return forms[category] ?? forms.other
        },
      }
      const text = entry(context)
      if (typeof text !== 'string')
        throw new Error(`Message must return text: ${namespace}.${key}`)
      return text
    },
    lt(message) {
      return () => control.text(message)
    },
    number,
    date: (value, options) =>
      new Intl.DateTimeFormat(snapshot.value.formattingLocale, options).format(
        value,
      ),
    dispose() {
      disposed = true
      revision++
      snapshot.value = { ...snapshot.value, pending: false }
      cache.clear()
    },
  }
  retainCoreMessages.set(control, (names) => {
    const namespaces = names.map((name) => `uninterface.${name}`)
    for (const namespace of namespaces)
      users.set(namespace, (users.get(namespace) ?? 0) + 1)
    return {
      ready: Promise.all(namespaces.map(loadPack)),
      release() {
        for (const namespace of namespaces) {
          const remaining = (users.get(namespace) ?? 0) - 1
          if (remaining > 0) users.set(namespace, remaining)
          else users.delete(namespace)
        }
      },
    }
  })
  control.ready = setLocale(options.locale ?? 'en')
  return control
}
