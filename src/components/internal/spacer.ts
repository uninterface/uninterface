import { defineComponent, getCurrentInstance, h, warn, type App } from 'vue'
import FrameSpacer from '@uninterface/backend/UiInputFrameSpacer.vue'
import { uiBackend } from '@uninterface/backend'
import { assertUiCapabilities } from '../../backend/capabilities'
import {
  defineUiInputFrameContract,
  useUiInputFrameParticipant,
} from '../../input-frame/participation'
import { flowSpacer } from '../../layout/flow'
import { zOrderProps } from '../../stacking/props'
import { useZComponent } from '../../stacking/runtime'

const warnedApps = new WeakSet<App>()

export function createSpacer(name: 'UiSpacer' | 'UiInputFrameSpacer') {
  const supportsFlow = name === 'UiSpacer'
  const component = defineComponent({
    name,
    inheritAttrs: false,
    uiInputFrame: defineUiInputFrameContract({ role: 'content' }),
    props: zOrderProps,
    setup() {
      useZComponent()
      // UiFlowLayout consumes the declaration before it mounts.
      if (!useUiInputFrameParticipant())
        throw new Error(
          supportsFlow
            ? 'UiSpacer requires UiFlowLayout or UiInputFrame participation.'
            : 'UiInputFrameSpacer requires UiInputFrame participation.',
        )
      assertUiCapabilities(uiBackend, ['input.frame.sizing.v1'])
      if (!supportsFlow) {
        const app = getCurrentInstance()?.appContext.app
        if (app && !warnedApps.has(app)) {
          warnedApps.add(app)
          // The consuming app's Vue build controls whether warnings are emitted.
          warn('UiInputFrameSpacer is deprecated. Use UiSpacer instead.')
        }
      }
      return () => h(FrameSpacer)
    },
  })
  Object.assign(component, { [flowSpacer]: supportsFlow })
  return component
}
