import type { ComputedRef } from 'vue'
import type { UiTextSource } from '../text/source'

export interface UiMessageContext {
  locale: string
  params: Readonly<Record<string, string | number>>
  plural(
    count: number,
    forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string },
  ): string
  number(value: number, options?: Intl.NumberFormatOptions): string
}
export type UiMessage = string | ((context: UiMessageContext) => string)
export interface UiMessageDescriptor {
  namespace: string
  key: string
  params?: Readonly<Record<string, string | number>>
}
export type UiMessagePack = Readonly<Record<string, UiMessage>>
export interface UiLocaleSource<T = UiMessagePack> {
  resources: Readonly<Record<string, T | (() => T | Promise<T>)>>
  aliases?: Readonly<Record<string, string | readonly string[]>>
  lazy?: boolean
}
export interface UiI18nOptions {
  locale?: string
  formattingLocale?: string
  fallback?: string | false
  preloadCore?: readonly string[]
  resources?: Readonly<Record<string, UiLocaleSource>>
  overrides?: Readonly<Record<string, Readonly<Record<string, UiMessagePack>>>>
}
/** Namespace-bound business translation using the application's existing control. */
export interface UiI18nTranslator<Key extends string = string> {
  readonly i18n: UiI18nControl
  t(key: Key, params?: UiMessageDescriptor['params']): string
  lt(key: Key, params?: UiMessageDescriptor['params']): UiTextSource
  msg(key: Key, params?: UiMessageDescriptor['params']): UiMessageDescriptor
}
/** Reusable namespace vocabulary without application state or resource ownership. */
export interface UiI18nDefinition<Key extends string = string> {
  useI18n(): UiI18nTranslator<Key>
  msg(key: Key, params?: UiMessageDescriptor['params']): UiMessageDescriptor
}
export interface UiI18nControl {
  state: ComputedRef<{
    locale: string
    requestedLocale: string
    formattingLocale: string
    direction: 'ltr' | 'rtl'
    pending: boolean
    error: unknown
    resolved: Readonly<Record<string, string>>
  }>
  ready: Promise<void>
  setLocale(locale: string): Promise<void>
  loadNamespace(namespace: string): Promise<void>
  setFormattingLocale(locale: string): void
  text(message: string | UiMessageDescriptor): string
  lt(message: string | UiMessageDescriptor): UiTextSource
  number(value: number, options?: Intl.NumberFormatOptions): string
  date(value: Date | number, options?: Intl.DateTimeFormatOptions): string
  dispose(): void
}
