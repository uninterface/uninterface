import type { VNode } from 'vue'
import type { UiAvatarViewProps } from './index'

export function uiAvatarImageProps(
  image: NonNullable<UiAvatarViewProps['image']>,
) {
  return {
    src: image.src,
    // Capture these callbacks when rendering the keyed node. A detached image
    // can still fire an event after the view's image prop has changed.
    onLoad: image.onLoad,
    onError: image.onError,
    onVnodeMounted(vnode: VNode) {
      const element = vnode.el as HTMLImageElement
      // A server-rendered image may settle before Vue attaches listeners.
      // HTML counts broken images as complete and gives them no natural width.
      // https://html.spec.whatwg.org/multipage/embedded-content.html#dom-img-complete
      if (!element.complete) return
      if (element.naturalWidth > 0) image.onLoad()
      else image.onError()
    },
  }
}
