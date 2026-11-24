import type { Ref } from 'vue'

/** DOM boundary supplied by the owner of a specialized visual surface. */
export interface UiLoadingSurface {
  readonly overlayHost: Readonly<Ref<HTMLElement | null | undefined>>
  readonly interactionTarget: Readonly<Ref<HTMLElement | null | undefined>>
  readonly statusTarget: Readonly<Ref<HTMLElement | null | undefined>>
}
