import { uiBackend } from '@uninterface/backend'
import metadata from '../../package.json'
import {
  assertUiCapabilities,
  uiCoreCapabilities,
} from '../backend/capabilities'
import {
  defaultThemeColors,
  uiTheme,
  type UiThemeColor,
  type UiDefaultThemeColor,
  type UiThemeColorDefinition,
} from '../presentation/theme'

/** Read-only inspection of the statically assembled core, backend and theme. */
export interface UiRuntime {
  readonly core: {
    readonly packageName: string
    readonly version: string
  }
  readonly backend: {
    readonly packageName: string
    readonly name: string
    readonly description: string
    readonly version: string
    readonly dependencies: readonly {
      readonly packageName: string
      readonly version: string
    }[]
  }
  readonly theme: {
    readonly colors: {
      readonly defaults: readonly UiDefaultThemeColor[]
      readonly extensions: Readonly<Record<string, UiThemeColorDefinition>>
      readonly supported: readonly UiThemeColor[]
    }
  }
  readonly capabilities: {
    readonly all: readonly string[]
    has(capability: string): boolean
    require(capabilities: readonly string[]): void
  }
}

let runtime: UiRuntime | undefined

/** Available outside Vue setup; does not render, install, or create controls. */
export function getUiRuntime(): UiRuntime {
  if (runtime) return runtime
  assertUiCapabilities(uiBackend, [])
  const extensions = uiTheme.colors.define(uiBackend.themeColors ?? {})
  const all = Object.freeze([
    ...new Set([...uiCoreCapabilities, ...uiBackend.capabilities]),
  ])
  const available = new Set(all)
  const backendName = uiBackend.name
  const requireCapabilities = (required: readonly string[]) => {
    const missing = required.filter((capability) => !available.has(capability))
    if (missing.length)
      throw new Error(
        `${backendName}: unmet capabilities: ${missing.join(', ')}`,
      )
  }
  const supported = Object.freeze([
    ...defaultThemeColors,
    ...Object.keys(extensions).filter((name) =>
      available.has(`theme.color.${name}.v1`),
    ),
  ]) as readonly UiThemeColor[]
  const colors = Object.freeze({
    defaults: defaultThemeColors,
    extensions,
    supported,
  })
  runtime = Object.freeze({
    core: Object.freeze({
      packageName: metadata.name,
      version: metadata.version,
    }),
    backend: Object.freeze({
      packageName: uiBackend.packageName,
      name: uiBackend.name,
      description: uiBackend.description,
      version: uiBackend.version,
      dependencies: Object.freeze(
        (uiBackend.dependencies ?? []).map((dependency) =>
          Object.freeze({
            packageName: dependency.packageName,
            version: dependency.version,
          }),
        ),
      ),
    }),
    theme: Object.freeze({
      get colors() {
        requireCapabilities(['theme.colors.v1'])
        return colors
      },
    }),
    capabilities: Object.freeze({
      all,
      has: (capability: string) => available.has(capability),
      require: requireCapabilities,
    }),
  })
  return runtime
}
