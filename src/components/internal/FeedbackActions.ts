import { defineComponent, getCurrentInstance, provide } from 'vue'
import { buttonDefaultScopeKey } from '../../presentation/buttonDefaults'

/** Shared feedback button defaults; renderless and independent of action arrangement. */
export default defineComponent({
  name: 'FeedbackActions',
  setup(_, { slots }) {
    provide(buttonDefaultScopeKey, {
      owner: getCurrentInstance()!,
      variant: 'text',
    })
    return () => slots.default?.()
  },
})
