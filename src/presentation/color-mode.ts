import {
  computed,
  inject,
  shallowRef,
  watch,
  type ComputedRef,
  type InjectionKey,
} from 'vue'

export type UiColorMode = 'light' | 'dark'
export type UiColorModePreference = UiColorMode | 'system'

export interface UiColorModeControl {
  readonly state: ComputedRef<{
    readonly preference: UiColorModePreference | null
    readonly resolved: UiColorMode
    readonly inherited: boolean
  }>
  setPreference(preference: UiColorModePreference): void
}

export interface UiColorModeOptions {
  /** Explicit ownership of this document's native color-mode selector. */
  document?: Document
  /** Observe a host document without writing its attributes. */
  host?: Document
  /** Observe another control without taking ownership of its preference. */
  inherit?: UiColorModeControl
  preference?: UiColorModePreference
  /** Server render/hydration fallback when no system preference is available. */
  initialMode?: UiColorMode
  /** Opt-in localStorage key; storage failures never block mode changes. */
  storageKey?: string
}

/** Native document selector; values for class are individual class tokens. */
export interface UiBackendColorMode {
  attribute: string
  light: string
  dark: string
  /** Native host policy when neither light nor dark selector is present. */
  default?: UiColorModePreference
}

export const colorModeKey: InjectionKey<UiColorModeControl> = Symbol(
  'uninterface.color-mode',
)

export function useUiColorMode(): UiColorModeControl {
  const control = inject(colorModeKey, undefined)
  if (!control)
    throw new Error('Uninterface: color-mode integration is unavailable.')
  return control
}

// The lease lives on the document, never in a process-wide preference store.
const ownerKey = Symbol.for('uninterface.document-color-mode-owner')
type OwnedDocument = Document & { [ownerKey]?: object }
const validPreference = (value: unknown): value is UiColorModePreference =>
  value === 'light' || value === 'dark' || value === 'system'

export function createColorMode(
  options: UiColorModeOptions | undefined,
  native: UiBackendColorMode,
  host?: Document,
) {
  const settings = options ?? {}
  const document = settings.document as OwnedDocument | undefined
  if (
    settings.initialMode !== undefined &&
    !['light', 'dark'].includes(settings.initialMode)
  )
    throw new Error('Uninterface: invalid initial color mode.')
  if (
    settings.preference !== undefined &&
    !validPreference(settings.preference)
  )
    throw new Error('Uninterface: invalid color-mode preference.')
  if (
    (settings.inherit &&
      (document ||
        settings.host ||
        settings.preference ||
        settings.storageKey)) ||
    (settings.host && document) ||
    (settings.storageKey !== undefined &&
      (!document || !settings.storageKey.trim()))
  )
    throw new Error(
      'Uninterface: color mode requires one owner or one inheritance source.',
    )
  const observed = document ?? settings.host ?? host
  if (!document && observed && settings.preference)
    throw new Error(
      'Uninterface: setting a color preference requires document ownership.',
    )
  if (document?.[ownerKey])
    throw new Error(
      'Uninterface: this document already has a color-mode owner.',
    )

  const inherited = Boolean(settings.inherit || (!document && observed))
  const preference = shallowRef<UiColorModePreference>(
    settings.preference ?? 'system',
  )
  const resolved = shallowRef<UiColorMode>(settings.initialMode ?? 'light')
  const releases: (() => void)[] = []
  let disposed = false
  const read = () => {
    const element = observed!.documentElement
    const selected =
      native.attribute === 'class'
        ? element.classList.contains(native.dark)
          ? 'dark'
          : element.classList.contains(native.light)
            ? 'light'
            : undefined
        : element.getAttribute(native.attribute)
    if (selected === native.dark || selected === 'dark') return 'dark'
    if (selected === native.light || selected === 'light') return 'light'
    return native.default === 'system'
      ? observed?.defaultView?.matchMedia?.('(prefers-color-scheme: dark)')
          .matches
        ? 'dark'
        : 'light'
      : (native.default ?? 'light')
  }
  if (settings.inherit) {
    releases.push(
      watch(
        settings.inherit.state,
        (state) => {
          resolved.value = state.resolved
        },
        { immediate: true, flush: 'sync' },
      ),
    )
  } else if (observed && !document) {
    resolved.value = read()
    const query =
      native.default === 'system'
        ? observed.defaultView?.matchMedia?.('(prefers-color-scheme: dark)')
        : undefined
    const update = () => {
      resolved.value = read()
    }
    query?.addEventListener('change', update)
    releases.push(() => query?.removeEventListener('change', update))
    const Observer = observed.defaultView?.MutationObserver
    if (Observer) {
      const observer = new Observer(() => {
        resolved.value = read()
      })
      observer.observe(observed.documentElement, {
        attributes: true,
        attributeFilter: [native.attribute],
      })
      releases.push(() => observer.disconnect())
    }
  } else {
    let storage: Storage | undefined
    if (settings.storageKey) {
      try {
        storage = document?.defaultView?.localStorage
        const saved = storage?.getItem(settings.storageKey)
        // An explicitly supplied preference takes precedence over persistence.
        if (settings.preference === undefined && validPreference(saved))
          preference.value = saved
      } catch {
        /* Persistence is optional, including in restricted hosts. */
      }
    }
    const query = document?.defaultView?.matchMedia?.(
      '(prefers-color-scheme: dark)',
    )
    const update = () => {
      resolved.value =
        preference.value === 'system'
          ? query
            ? query.matches
              ? 'dark'
              : 'light'
            : (settings.initialMode ?? 'light')
          : preference.value
    }
    update()
    query?.addEventListener('change', update)
    releases.push(() => query?.removeEventListener('change', update))
    releases.push(watch(preference, update, { flush: 'sync' }))
    if (document) {
      const lease = {}
      document[ownerKey] = lease
      const element = document.documentElement
      const original = element.getAttribute(native.attribute)
      const hadLight = element.classList.contains(native.light)
      const hadDark = element.classList.contains(native.dark)
      const scheme = element.style.getPropertyValue('color-scheme')
      const priority = element.style.getPropertyPriority('color-scheme')
      releases.push(
        watch(
          resolved,
          (mode) => {
            if (native.attribute === 'class') {
              element.classList.toggle(native.light, mode === 'light')
              element.classList.toggle(native.dark, mode === 'dark')
            } else element.setAttribute(native.attribute, native[mode])
            element.style.setProperty('color-scheme', mode)
          },
          { immediate: true, flush: 'sync' },
        ),
      )
      releases.push(() => {
        if (document[ownerKey] !== lease) return
        if (native.attribute === 'class') {
          element.classList.toggle(native.light, hadLight)
          element.classList.toggle(native.dark, hadDark)
        } else if (original === null) element.removeAttribute(native.attribute)
        else element.setAttribute(native.attribute, original)
        if (scheme) element.style.setProperty('color-scheme', scheme, priority)
        else element.style.removeProperty('color-scheme')
        delete document[ownerKey]
      })
      if (storage && settings.storageKey) {
        const key = settings.storageKey
        releases.push(
          watch(
            preference,
            (value) => {
              try {
                storage?.setItem(key, value)
              } catch {
                /* Continue without persistence. */
              }
            },
            { flush: 'sync' },
          ),
        )
        const onStorage = (event: StorageEvent) => {
          if (
            event.storageArea === storage &&
            (event.key === key || event.key === null)
          ) {
            preference.value = validPreference(event.newValue)
              ? event.newValue
              : 'system'
          }
        }
        document.defaultView?.addEventListener('storage', onStorage)
        releases.push(() =>
          document.defaultView?.removeEventListener('storage', onStorage),
        )
      }
    }
  }
  const control: UiColorModeControl = Object.freeze({
    state: computed(() =>
      Object.freeze({
        preference: inherited ? null : preference.value,
        resolved: resolved.value,
        inherited,
      }),
    ),
    setPreference(value: UiColorModePreference) {
      if (disposed)
        throw new Error('Uninterface: color-mode control is disposed.')
      if (inherited)
        throw new Error(
          'Uninterface: change the host color-mode owner instead.',
        )
      if (!validPreference(value))
        throw new Error('Uninterface: invalid color-mode preference.')
      preference.value = value
    },
  })
  return {
    control,
    dispose() {
      if (disposed) return
      disposed = true
      releases.forEach((release) => release())
    },
  }
}
