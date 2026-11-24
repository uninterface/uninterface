import type { UiHierarchyLevel } from './hierarchy'
import { hierarchyLevels } from './hierarchy'
import type { UiThemeColor } from './theme'

/** Portable presentation requests; dimensions, palettes and markup remain backend-owned. */
export interface UiCardTreatment {
  readonly color?: UiThemeColor | null
  readonly header?: 'band' | 'plain'
  readonly footer?: 'normal' | 'muted'
  readonly density?: 'roomy' | 'normal' | 'compact'
  readonly surface?: 'plain' | 'tinted'
  readonly elevation?: 'flat' | 'raised'
  readonly border?: 'solid' | 'dashed' | 'dotted' | 'double'
  readonly titleSize?: 'large' | 'normal' | 'small'
}

/** Omitted levels and properties retain the default presentation. */
export type UiCardPresentation = Readonly<
  Partial<Record<UiHierarchyLevel, UiCardTreatment>>
>

const normal: Required<UiCardTreatment> = {
  color: null,
  header: 'band',
  footer: 'normal',
  density: 'normal',
  surface: 'plain',
  elevation: 'flat',
  border: 'solid',
  titleSize: 'normal',
}
const high = {
  ...normal,
  density: 'roomy',
  elevation: 'raised',
  titleSize: 'large',
} as const
const defaults: Record<UiHierarchyLevel, Required<UiCardTreatment>> = {
  [-2]: high,
  [-1]: high,
  0: { ...normal, elevation: 'raised', titleSize: 'large' },
  1: { ...normal, density: 'compact', border: 'dashed', footer: 'muted' },
  2: {
    ...normal,
    density: 'compact',
    surface: 'tinted',
    footer: 'muted',
    border: 'dashed',
    titleSize: 'small',
  },
}
const vocabulary = {
  header: ['band', 'plain'],
  footer: ['normal', 'muted'],
  density: ['roomy', 'normal', 'compact'],
  surface: ['plain', 'tinted'],
  elevation: ['flat', 'raised'],
  border: ['solid', 'dashed', 'dotted', 'double'],
  titleSize: ['large', 'normal', 'small'],
} as const

export function isCardPresentation(
  value: unknown,
): value is UiCardPresentation {
  if (Object.prototype.toString.call(value) !== '[object Object]') return false
  return Object.entries(value as object).every(([level, treatment]) => {
    if (!hierarchyLevels.some((entry) => String(entry) === level)) return false
    if (treatment === undefined) return true
    if (Object.prototype.toString.call(treatment) !== '[object Object]')
      return false
    return Object.entries(treatment as object).every(([key, setting]) => {
      if (key === 'color')
        return (
          setting === undefined ||
          setting === null ||
          (typeof setting === 'string' && /^[a-z][a-z0-9-]*$/.test(setting))
        )
      return (
        Object.hasOwn(vocabulary, key) &&
        (setting === undefined ||
          (
            vocabulary[key as keyof typeof vocabulary] as readonly unknown[]
          ).includes(setting))
      )
    })
  })
}

export function resolveCardPresentation(value: UiCardPresentation = {}) {
  if (!isCardPresentation(value))
    throw new Error('uiCardPresentation: unsupported level or treatment.')
  return Object.freeze(
    Object.fromEntries(
      hierarchyLevels.map((level) => {
        const treatment = Object.fromEntries(
          Object.entries(value[level] ?? {}).filter(
            ([, setting]) => setting !== undefined,
          ),
        )
        return [level, Object.freeze({ ...defaults[level], ...treatment })]
      }),
    ),
  ) as Readonly<Record<UiHierarchyLevel, Required<UiCardTreatment>>>
}

export function sameCardPresentation(
  a: UiCardPresentation,
  b: UiCardPresentation,
) {
  const left = resolveCardPresentation(a)
  const right = resolveCardPresentation(b)
  return hierarchyLevels.every((level) =>
    (Object.keys(normal) as (keyof UiCardTreatment)[]).every(
      (key) => left[level][key] === right[level][key],
    ),
  )
}
