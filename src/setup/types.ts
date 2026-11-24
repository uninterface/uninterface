import type { App, Component, Plugin, ShallowRef } from 'vue'
import type {
  UiI18nControl,
  UiI18nOptions,
  UiLocaleSource,
} from '../i18n/types'
import type { UiIconCatalogue } from '../icons/catalogue'
import type {
  UiBackendColorMode,
  UiColorModeControl,
  UiColorModeOptions,
} from '../presentation/color-mode'
export interface UiBackendIntegration {
  colorMode?: UiBackendColorMode
  locales: UiLocaleSource<unknown>
  initialLocale: unknown
  icons: UiIconCatalogue
  create(context: {
    i18n: UiI18nControl
    nativeLocale: ShallowRef<unknown>
    ssr: boolean
  }): {
    plugin?: Plugin
    Root?: Component
    /** Release native services, including for applications disposed before mount. */
    dispose?: () => void
  }
}
export interface UiApplicationOptions {
  /** Application-lifetime named layer extensions, declared in dependency order. */
  zLayers?: Readonly<
    Record<string, { above?: readonly string[]; below?: readonly string[] }>
  >
  /** Stable per-root namespace; required for SSR and matching hydration. */
  idPrefix?: string
  colorMode?: UiColorModeOptions
  backend?: UiBackendIntegration
  i18n?: UiI18nOptions
  icons?: UiIconCatalogue
  requires?: readonly string[]
  /** Explicit document language ownership. Omit for an embedded application. */
  document?: Document
  ssr?: boolean
}
export type UiApplication = App & {
  readonly ui: {
    colorMode?: UiColorModeControl
    dispose(): void
    i18n: UiI18nControl
    icons: UiIconCatalogue
    ready: Promise<void>
  }
}
