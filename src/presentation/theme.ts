import type { UiBackendDescriptor } from '../backend'

/** Required semantic roles for every theme. */
export type UiDefaultThemeColor =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'secondary'

/** Theme packages augment this interface with named extension roles. */
export interface UiThemeColorExtensions {}

/** Shared semantic roles; typing does not establish installed theme support. */
export type UiThemeColor =
  | UiDefaultThemeColor
  | Extract<keyof UiThemeColorExtensions, string>

export interface UiThemeColorDefinition {
  readonly description: string
}

export const defaultThemeColors: readonly UiDefaultThemeColor[] = Object.freeze(
  ['primary', 'success', 'danger', 'warning', 'info', 'secondary'],
)

/** Declare extension meanings without supplying presentation or installing support. */
function defineThemeColors<
  const T extends Record<string, UiThemeColorDefinition>,
>(definitions: T): Readonly<{ [K in keyof T]: UiThemeColorDefinition }> {
  if (
    !definitions ||
    typeof definitions !== 'object' ||
    Array.isArray(definitions)
  )
    throw new Error('Theme color definitions must be an object.')
  const result: Record<string, UiThemeColorDefinition> = Object.create(null)
  for (const [name, definition] of Object.entries(definitions)) {
    if (
      !/^[a-z][a-z0-9-]*$/.test(name) ||
      ['constructor', 'prototype', '__proto__'].includes(name)
    )
      throw new Error(`Invalid theme color name "${name}".`)
    if ((defaultThemeColors as readonly string[]).includes(name))
      throw new Error(`Theme color "${name}" is already a default role.`)
    if (
      !definition ||
      typeof definition.description !== 'string' ||
      !definition.description.trim()
    )
      throw new Error(`Theme color "${name}" requires a description.`)
    result[name] = Object.freeze({ description: definition.description })
  }
  return Object.freeze(result) as Readonly<{
    [K in keyof T]: UiThemeColorDefinition
  }>
}

/** Shared by runtime checks and the workspace manifest scanner. */
export function validateThemeColorSupport(presentation: UiBackendDescriptor) {
  const definitions = defineThemeColors(presentation.themeColors ?? {})
  const capabilities = presentation.capabilities
  for (const capability of capabilities) {
    if (!capability.startsWith('theme.color.')) continue
    const match = /^theme\.color\.([a-z][a-z0-9-]*)\.v1$/.exec(capability)
    if (!match || !Object.hasOwn(definitions, match[1]))
      throw new Error(
        `${presentation.name}: invalid or undeclared theme color capability "${capability}".`,
      )
    if (!capabilities.includes('theme.colors.v1'))
      throw new Error(
        `${presentation.name}: theme color extensions require theme.colors.v1.`,
      )
  }
  if (
    capabilities.some((capability) =>
      /^[a-z][a-z0-9-]*\.color\.v1$/.test(capability),
    ) &&
    !capabilities.includes('theme.colors.v1')
  )
    throw new Error(
      `${presentation.name}: themed components require theme.colors.v1.`,
    )
}

export function assertThemeColor(
  presentation: UiBackendDescriptor,
  color: unknown,
) {
  validateThemeColorSupport(presentation)
  if (
    typeof color !== 'string' ||
    (!(defaultThemeColors as readonly string[]).includes(color) &&
      !Object.hasOwn(presentation.themeColors ?? {}, color))
  )
    throw new Error(
      `${presentation.name}: unsupported theme color "${String(color)}" (not declared).`,
    )
  const requirement = (defaultThemeColors as readonly string[]).includes(color)
    ? 'theme.colors.v1'
    : `theme.color.${color}.v1`
  if (!presentation.capabilities.includes(requirement))
    throw new Error(
      `${presentation.name}: unsupported theme color "${color}"; unmet capability: ${requirement}.`,
    )
}

/** Theme authoring operations, grouped by responsibility. */
export const uiTheme = Object.freeze({
  colors: Object.freeze({ define: defineThemeColors }),
})
