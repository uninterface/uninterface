/** A semantic logical role, including application-owned roles. */
export type UiStrategyTarget = string

export interface UiStrategyScope {
  /** Attachment node is zero; registered logical descendants increment depth. */
  depth?: number
  targets?: readonly UiStrategyTarget[]
  /** Stop before a matching descendant, including its entire subtree. */
  stopAt?: readonly UiStrategyTarget[]
}

export interface UiStrategyIdentity {
  readonly kind: 'strategy'
  readonly key: symbol
  readonly name: string
}

export interface UiStrategyQuery<T, Context = void> {
  readonly kind: 'query'
  readonly key: symbol
  readonly name: string
  /** All eligible, supported contributions; no attachment priority is implied. */
  readonly agree: (values: readonly T[], context: Context) => T | undefined
  answer(value: T): UiStrategyAnswer
}

export interface UiStrategyAnswer {
  readonly query: UiStrategyQuery<any, any>
  readonly value: unknown
}

export interface UiStrategyDeclaration {
  readonly identity: UiStrategyIdentity
  readonly scope: Readonly<UiStrategyScope>
  readonly answers: readonly UiStrategyAnswer[]
}

export interface UiStrategyFactory<T> extends UiStrategyIdentity {
  (value: T, options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
}

export type UiStrategyBlock = UiStrategyIdentity | UiStrategyQuery<any, any>

export type UiStrategyResolution<T> =
  | {
      readonly status: 'answered'
      readonly value: T
      readonly contributors: readonly string[]
    }
  | {
      readonly status: 'unanswered'
      readonly reason: 'no-answer' | 'no-agreement'
      readonly contributors: readonly string[]
    }

export type UiControlSize = -2 | -1 | 0 | 1 | 2

/** Ordinal peer spacing: compact, backend default, spacious. */
export type UiLayoutDensity = -1 | 0 | 1
