import {
  computed,
  inject,
  provide,
  type ComputedRef,
  type InjectionKey,
} from 'vue'
import type {
  UiStrategyBlock,
  UiStrategyDeclaration,
  UiStrategyQuery,
  UiStrategyResolution,
  UiStrategyTarget,
} from './types'

export interface StrategyEntry {
  declaration: UiStrategyDeclaration
  depth: number
  blocked: readonly symbol[]
}
const key: InjectionKey<ComputedRef<readonly StrategyEntry[]>> = Symbol(
  'uninterface.strategies',
)

export function advanceStrategies(
  inherited: readonly StrategyEntry[],
  target: UiStrategyTarget,
  declarations: readonly UiStrategyDeclaration[] = [],
  blocks: readonly UiStrategyBlock[] = [],
): readonly StrategyEntry[] {
  const entries: StrategyEntry[] = inherited.flatMap((entry) => {
    const depth = entry.depth + 1
    const scope = entry.declaration.scope
    if (
      (scope.depth !== undefined && depth > scope.depth) ||
      scope.stopAt?.includes(target) ||
      blocks.some(
        (block) =>
          block.kind === 'strategy' &&
          block.key === entry.declaration.identity.key,
      )
    )
      return []
    return [
      {
        ...entry,
        depth,
        blocked: [
          ...entry.blocked,
          ...blocks
            .filter((block) => block.kind === 'query')
            .map((block) => block.key),
        ],
      },
    ]
  })
  return [
    ...entries,
    ...declarations.map((declaration) => ({
      declaration,
      depth: 0,
      blocked: [],
    })),
  ]
}

export function resolveStrategies<T, Context = void>(
  entries: readonly StrategyEntry[],
  target: UiStrategyTarget,
  query: UiStrategyQuery<T, Context>,
  supports: (value: T) => boolean,
  context?: Context,
): UiStrategyResolution<T> {
  const answers: T[] = []
  const contributors: string[] = []
  for (const entry of entries) {
    const { declaration } = entry
    if (
      entry.blocked.includes(query.key) ||
      (declaration.scope.targets && !declaration.scope.targets.includes(target))
    )
      continue
    for (const answer of declaration.answers) {
      if (answer.query.key !== query.key || !supports(answer.value as T))
        continue
      answers.push(answer.value as T)
      contributors.push(declaration.identity.name)
    }
  }
  if (!answers.length)
    return { status: 'unanswered', reason: 'no-answer', contributors }
  const value = query.agree(Object.freeze(answers), context as Context)
  if (value === undefined)
    return { status: 'unanswered', reason: 'no-agreement', contributors }
  if (!supports(value))
    throw new Error(`${query.name}: agreement returned an unsupported value.`)
  return { status: 'answered', value, contributors }
}

export function useUiStrategyNode(
  target: UiStrategyTarget,
  attachment: () => {
    use?: UiStrategyDeclaration | readonly UiStrategyDeclaration[]
    block?: UiStrategyBlock | readonly UiStrategyBlock[]
  } = () => ({}),
) {
  const parent = inject(
    key,
    computed(() => []),
  )
  const entries = computed(() => {
    const { use, block } = attachment()
    return advanceStrategies(parent.value, target, list(use), list(block))
  })
  provide(key, entries)
  return {
    resolve<T, Context = void>(
      query: UiStrategyQuery<T, Context>,
      supports: (value: NoInfer<T>) => boolean,
      ...context: void extends Context
        ? [context?: Context]
        : [context: Context]
    ) {
      return resolveStrategies(
        entries.value,
        target,
        query,
        supports,
        context[0],
      )
    },
    query<T, Context = void>(
      query: UiStrategyQuery<T, Context>,
      supports: readonly NoInfer<T>[] | ((value: NoInfer<T>) => boolean),
      ...context: void extends Context
        ? [context?: () => Context]
        : [context: () => Context]
    ) {
      return computed(() =>
        resolveStrategies(
          entries.value,
          target,
          query,
          typeof supports === 'function'
            ? supports
            : (value) => supports.includes(value),
          context[0]?.(),
        ),
      )
    },
  }
}

function list<T>(value: T | readonly T[] | undefined): readonly T[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value as T]
}

/** Backend views query the existing core node without creating a new depth. */
export function useUiStrategy<T, Context = void>(
  query: UiStrategyQuery<T, Context>,
  supports: readonly NoInfer<T>[] | ((value: NoInfer<T>) => boolean),
  ...context: void extends Context
    ? [context?: () => Context]
    : [context: () => Context]
) {
  const node = inject(viewKey)
  if (!node)
    throw new Error('Strategy queries require a participating logical node.')
  return node.query(query, supports, ...context)
}
const viewKey: InjectionKey<ReturnType<typeof useUiStrategyNode>> = Symbol(
  'uninterface.strategy-view',
)
export function provideStrategyView(
  node: ReturnType<typeof useUiStrategyNode>,
) {
  provide(viewKey, node)
}
