import type {
  UiStrategyAnswer,
  UiStrategyFactory,
  UiStrategyQuery,
  UiStrategyScope,
} from './types'

export function createUiStrategyQuery<T, Context = void>(definition: {
  name: string
  agree: (values: readonly T[], context: Context) => T | undefined
}): UiStrategyQuery<T, Context> {
  const query: UiStrategyQuery<T, Context> = {
    kind: 'query',
    key: Symbol(definition.name),
    name: definition.name,
    agree: definition.agree,
    answer: (value) => Object.freeze({ query, value }),
  }
  return Object.freeze(query)
}

export function createUiStrategy<T>(definition: {
  name: string
  answers: (value: T) => readonly UiStrategyAnswer[]
}): UiStrategyFactory<T> {
  const key = Symbol(definition.name)
  const factory = (value: T, options: { scope?: UiStrategyScope } = {}) => {
    const scope = options.scope ?? {}
    if (
      scope.depth !== undefined &&
      (!Number.isInteger(scope.depth) || scope.depth < 0)
    )
      throw new Error('Strategy depth must be a nonnegative integer.')
    return Object.freeze({
      identity: factory,
      scope: Object.freeze({
        ...scope,
        targets: scope.targets && Object.freeze([...scope.targets]),
        stopAt: scope.stopAt && Object.freeze([...scope.stopAt]),
      }),
      answers: Object.freeze([...definition.answers(value)]),
    })
  }
  Object.defineProperties(factory, {
    kind: { value: 'strategy', enumerable: true },
    key: { value: key, enumerable: true },
    name: { value: definition.name, configurable: true },
  })
  return Object.freeze(factory) as unknown as UiStrategyFactory<T>
}
