import { uiFocusPresentation } from '@uninterface/backend/focus'
import { uiBackend } from '@uninterface/backend'
import { assertUiCapabilities } from '../backend/capabilities'

/** Presentation only: no focusability, semantics, handlers or focus movement. */
export interface UiFocusPresentationBinding {
  readonly class: string
}

/** Apply the selected backend's keyboard-focus treatment to an existing element. */
export function useUiFocusPresentation(): UiFocusPresentationBinding {
  assertUiCapabilities(uiBackend, ['focus.presentation.v1'])
  return uiFocusPresentation
}
