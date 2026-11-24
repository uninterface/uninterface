import {
  computed,
  inject,
  onMounted,
  onScopeDispose,
  shallowRef,
  toValue,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
  type Plugin,
} from 'vue'

/** Named responsive context; detection is independent of its consumers. */
export type UiResponsiveContext = string

/** A shared vocabulary definition, independent of detection and backend views. */
export interface UiResponsiveProfile<Token extends string = string> {
  readonly tokens: readonly Token[]
}

/** Declare a finite responsive vocabulary with preserved literal token types. */
export function defineUiResponsiveProfile<
  const Tokens extends readonly string[],
>(tokens: Tokens): UiResponsiveProfile<Tokens[number]> {
  if (
    !Array.isArray(tokens) ||
    tokens.length === 0 ||
    tokens.some(
      (token) =>
        typeof token !== 'string' || !token.trim() || token !== token.trim(),
    ) ||
    new Set(tokens).size !== tokens.length
  ) {
    throw new Error(
      'Uninterface: responsive tokens must be unique, nonempty strings without surrounding whitespace.',
    )
  }
  return Object.freeze({ tokens: Object.freeze([...tokens]) })
}

const defaultProfile = defineUiResponsiveProfile(['desktop', 'mobile'])

interface ResponsiveEnvironment {
  profile: UiResponsiveProfile
  context: ComputedRef<UiResponsiveContext>
}

const environmentKey: InjectionKey<ResponsiveEnvironment> = Symbol(
  'uninterface.environment',
)
const current = shallowRef<UiResponsiveContext>('desktop')
let users = 0
let release: (() => void) | undefined

/** Supply application-owned context detection without a rendered boundary. */
export function createUiResponsive(
  context: MaybeRefOrGetter<UiResponsiveContext>,
): Plugin
export function createUiResponsive<Token extends string>(
  context: MaybeRefOrGetter<NoInfer<Token>>,
  profile: UiResponsiveProfile<Token>,
): Plugin
export function createUiResponsive(
  context: MaybeRefOrGetter<UiResponsiveContext>,
  profile: UiResponsiveProfile = defaultProfile,
): Plugin {
  // Copy and validate the vocabulary even for a structurally supplied profile.
  const allowed = new Set(defineUiResponsiveProfile(profile.tokens).tokens)
  return {
    install(app) {
      const resolved = computed(() => {
        const value = toValue(context)
        if (!allowed.has(value)) {
          throw new Error(
            `Uninterface: undeclared responsive token ${JSON.stringify(value)}; expected one of ${[...allowed].join(', ')}.`,
          )
        }
        return value
      })
      // Fail invalid initial detection even when no consumer has mounted yet.
      void resolved.value
      app.provide(environmentKey, { profile, context: resolved })
    },
  }
}

/** Observe shared responsive detection from Vue setup without owning it. */
export function useUiResponsive(): {
  readonly context: ComputedRef<UiResponsiveContext>
}
export function useUiResponsive<Token extends string>(
  profile: UiResponsiveProfile<Token>,
): {
  readonly context: ComputedRef<Token>
}
export function useUiResponsive(profile?: UiResponsiveProfile): {
  readonly context: ComputedRef<UiResponsiveContext>
} {
  const supplied = inject(environmentKey, undefined)
  if (profile && supplied?.profile !== profile) {
    throw new Error(
      'Uninterface: requested responsive profile is not installed in this application.',
    )
  }
  if (supplied) return { context: supplied.context }
  let mounted = false
  onMounted(() => {
    mounted = true
    if (users++ === 0 && typeof window.matchMedia === 'function') {
      const query = window.matchMedia('(max-width: 760px)')
      const update = () => {
        current.value = query.matches ? 'mobile' : 'desktop'
      }
      update()
      query.addEventListener('change', update)
      release = () => query.removeEventListener('change', update)
    }
  })
  onScopeDispose(() => {
    if (mounted && --users === 0) {
      release?.()
      release = undefined
      current.value = 'desktop'
    }
  })
  return { context: computed(() => current.value) }
}
