import {
  createFeedbackRegistry,
  feedbackRegistryKey,
} from '../feedback/registry'
import {
  createApp,
  createSSRApp,
  defineComponent,
  h,
  shallowRef,
  type Component,
} from 'vue'
import integration from '@uninterface/backend/integration'
import { uiBackend } from '@uninterface/backend'
import { assertUiCapabilities } from '../backend/capabilities'
import { createUiI18nControl } from '../i18n/control'
import { corePackNames } from '../i18n/packs'
import { i18nKey } from '../i18n/context'
import { assembleIcons, iconsKey } from '../icons/catalogue'
import { colorModeKey, createColorMode } from '../presentation/color-mode'
import {
  applicationIdPrefix,
  assertIdPrefix,
  claimApplicationIdentity,
} from './identity'
import { ownDocumentLanguage } from './document-language'
import { createCleanup, reportCleanupErrors } from './lifetime'
import { zRuntime } from '../stacking/runtime'
import { createZDomain } from '../stacking/domain'
import { zDomainKey } from '../stacking/context'
import type {
  UiApplication,
  UiApplicationOptions,
  UiBackendIntegration,
} from './types'

export function createUiApplication(
  root: Component,
  options: UiApplicationOptions = {},
): UiApplication {
  assertUiCapabilities(uiBackend, [
    'stacking.dynamic.v1',
    ...(options.requires ?? []),
  ])
  const idPrefix = applicationIdPrefix(options.idPrefix, options.ssr)
  const cleanup = createCleanup()
  try {
    const language = options.document
      ? ownDocumentLanguage(options.document)
      : undefined
    if (language) cleanup.add(language.dispose)
    const backend: UiBackendIntegration = options.backend ?? integration
    const icons = assembleIcons(backend.icons, options.icons)
    if (options.colorMode && !backend.colorMode)
      throw new Error(
        'Uninterface: backend does not support color-mode integration.',
      )
    const colorMode = backend.colorMode
      ? createColorMode(
          options.colorMode,
          backend.colorMode,
          options.ssr ? undefined : globalThis.document,
        )
      : undefined
    if (colorMode) cleanup.add(colorMode.dispose)
    const nativeLocale = shallowRef(backend.initialLocale)
    const i18n = createUiI18nControl(
      {
        ...options.i18n,
        // Hydration must begin with the same localized tree as the server.
        preloadCore:
          options.i18n?.preloadCore ??
          (options.ssr
            ? corePackNames.map((name) => `uninterface.${name}`)
            : undefined),
      },
      {
        source: backend.locales,
        commit: (resource) => {
          nativeLocale.value = resource
        },
      },
    )
    // Setup can fail before the caller receives ready. Keep its rejection
    // observable to callers without creating an orphaned rejected promise.
    void i18n.ready.catch(() => {})
    cleanup.add(() => i18n.dispose())
    language?.connect(i18n)
    const native = backend.create({
      i18n,
      nativeLocale,
      ssr: options.ssr ?? false,
    })
    if (native.dispose) cleanup.add(native.dispose)
    const feedback = createFeedbackRegistry()
    cleanup.add(feedback.dispose)
    const content = () => [
      h(root),
      ...[...feedback.entries].map(([key, view]) => h(view, { key })),
    ]
    const Root = defineComponent({
      name: 'UninterfaceApplicationContext',
      setup: () => {
        assertIdPrefix(app.config.idPrefix!)
        return () =>
          native.Root ? h(native.Root, null, { default: content }) : content()
      },
    })
    const app = (
      options.ssr ? createSSRApp(Root) : createApp(Root)
    ) as UiApplication
    app.config.idPrefix = idPrefix
    const zDomain = createZDomain()
    cleanup.add(() => zDomain.dispose())
    const stacking = zRuntime(zDomain)
    cleanup.add(() => stacking.browser.dispose())
    for (const [name, relation] of Object.entries(options.zLayers ?? {}))
      stacking.layers.register(name, relation)
    app.provide(feedbackRegistryKey, feedback)
    app.provide(zDomainKey, zDomain)
    app.provide(i18nKey, i18n)
    app.provide(iconsKey, icons)
    if (colorMode) app.provide(colorModeKey, colorMode.control)
    if (native.plugin) app.use(native.plugin)
    const dispose = () => {
      reportCleanupErrors(cleanup.release())
    }
    const mount = app.mount
    let mounted = false
    app.mount = (target, ...args) => {
      if (cleanup.disposed)
        throw new Error('Uninterface: application is disposed.')
      if (mounted)
        throw new Error('Uninterface: application is already mounted.')
      const container =
        typeof target === 'string'
          ? globalThis.document?.querySelector(target)
          : target
      if (!container)
        throw new Error('Uninterface: application mount target was not found.')
      const identity = claimApplicationIdentity(
        container.ownerDocument,
        app.config.idPrefix!,
        options.idPrefix === undefined && app.config.idPrefix === idPrefix,
      )
      app.config.idPrefix = identity.prefix
      try {
        const instance = mount(container, ...args)
        mounted = true
        cleanup.add(identity.release)
        return instance
      } catch (error) {
        identity.release()
        throw error
      }
    }
    app.onUnmount(dispose)
    Object.defineProperty(app, 'ui', {
      value: Object.freeze({
        i18n,
        icons,
        colorMode: colorMode?.control,
        ready: i18n.ready,
        dispose,
      }),
    })
    return app
  } catch (error) {
    const failures = cleanup.release()
    if (failures.length)
      throw new AggregateError(
        [error, ...failures],
        'Uninterface: application setup failed; cleanup also reported errors.',
        { cause: error },
      )
    throw error
  }
}
