import type { UiMessageDescriptor } from '../i18n/types'
export type UiParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; issue: string | UiMessageDescriptor }
export interface UiCodec<T, D = string> {
  parse(input: D): UiParseResult<T> | Promise<UiParseResult<T>>
  format(value: T): D
}
