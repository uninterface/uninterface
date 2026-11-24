import type { UiBackendDescriptor } from './index'
import { validateThemeColorSupport } from '../presentation/theme'
import manifest from '../../capabilities.json'

export const uiCoreCapabilities = manifest.provides

export function assertUiCapabilities(
  presentation: UiBackendDescriptor,
  required: readonly string[],
) {
  validateThemeColorSupport(presentation)
  const available = new Set<string>([
    ...uiCoreCapabilities,
    ...presentation.capabilities,
  ])
  const missing = required.filter((capability) => !available.has(capability))
  if (missing.length)
    throw new Error(
      `${presentation.name}: unmet capabilities: ${missing.join(', ')}`,
    )
}
