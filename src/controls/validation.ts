import type { UiMessageDescriptor } from '../i18n/types'
export type UiValidationRule<T> = (
  value: T,
) =>
  | string
  | UiMessageDescriptor
  | null
  | Promise<string | UiMessageDescriptor | null>
