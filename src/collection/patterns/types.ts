import type { VNodeChild } from 'vue'
import type {
  UiCollectionFilterBinding,
  UiCollectionFilterControl,
  UiCollectionFilterDefinition,
  UiFilterPresentationContext,
  UiFilterCommitResult,
} from '../filter'
import type { UiFieldControl } from '../../controls/field'
import type { UiCodec } from '../../controls/codec'
import type { UiValidationRule } from '../../controls/validation'
import type { UiEntryControl } from '../../entries/control'
import type { UiEntrySource } from '../../entries/types'
import type { UiTextSource } from '../../text/source'
import type { UiMessageDescriptor } from '../../i18n/types'

export interface UiFilterRange<T> {
  readonly minimum?: T
  readonly maximum?: T
}
export interface UiRangeFilterDraft {
  minimum: string
  maximum: string
}

/** Semantic editor contract. Adaptation names are open, not this built-in pattern vocabulary. */
export interface UiSearchFilterEditorBinding {
  readonly pattern: 'search'
  readonly field: UiFieldControl<string, string>
  readonly placeholder?: UiTextSource
  readonly searchLabel?: UiTextSource
}
export interface UiChoiceFilterEditorBinding<
  V extends string | readonly string[] = string | readonly string[],
> {
  readonly pattern: 'choice'
  readonly field: UiFieldControl<V, V>
  readonly choices: UiEntryControl
  readonly selection: 'single' | 'multiple'
  readonly applyLabel?: UiTextSource
  readonly clearLabel?: UiTextSource
}
export interface UiRangeFilterEditorBinding<T> {
  readonly pattern: 'range'
  readonly field: UiFieldControl<UiFilterRange<T>, UiRangeFilterDraft>
  readonly minimumLabel?: UiTextSource
  readonly maximumLabel?: UiTextSource
  readonly minimumPlaceholder?: UiTextSource
  readonly maximumPlaceholder?: UiTextSource
  readonly applyLabel?: UiTextSource
  readonly clearLabel?: UiTextSource
  readonly inputmode?: 'text' | 'decimal'
}
export interface UiSearchFilterBinding extends UiCollectionFilterBinding {
  readonly pattern: 'search'
  readonly editor: UiSearchFilterEditorBinding
}
export interface UiChoiceFilterBinding<
  V extends string | readonly string[] = string | readonly string[],
> extends UiCollectionFilterBinding {
  readonly pattern: 'choice'
  readonly editor: UiChoiceFilterEditorBinding<V>
}
export interface UiRangeFilterBinding<T> extends UiCollectionFilterBinding {
  readonly pattern: 'range'
  readonly editor: UiRangeFilterEditorBinding<T>
}
export interface UiSearchFilterControl extends UiCollectionFilterControl {
  readonly binding: UiSearchFilterBinding
}
export interface UiChoiceFilterControl<
  V extends string | readonly string[] = string | readonly string[],
> extends UiCollectionFilterControl {
  readonly binding: UiChoiceFilterBinding<V>
}
export interface UiRangeFilterControl<T> extends UiCollectionFilterControl {
  readonly binding: UiRangeFilterBinding<T>
}

export type UiSearchFilterDefinition<F> = Omit<
  UiCollectionFilterDefinition<F, string>,
  'createEditor'
> & {
  readonly codec?: UiCodec<string, string>
  readonly rules?: readonly UiValidationRule<string>[]
  readonly placeholder?: UiTextSource
  readonly searchLabel?: UiTextSource
}
export type UiChoiceFilterDefinition<
  F,
  V extends string | readonly string[],
> = Omit<UiCollectionFilterDefinition<F, V>, 'createEditor'> & {
  readonly selection: V extends string ? 'single' : 'multiple'
  readonly options: UiEntrySource
  readonly rules?: readonly UiValidationRule<V>[]
  readonly applyLabel?: UiTextSource
  readonly clearLabel?: UiTextSource
}
export type UiRangeFilterDefinition<F, T> = Omit<
  UiCollectionFilterDefinition<F, UiFilterRange<T>>,
  'createEditor'
> & {
  readonly codec: UiCodec<T, string>
  readonly compare: (minimum: T, maximum: T) => number
  readonly invalidRange?:
    | string
    | UiMessageDescriptor
    | (() => string | UiMessageDescriptor)
  readonly rules?: readonly UiValidationRule<UiFilterRange<T>>[]
  readonly minimumLabel?: UiTextSource
  readonly maximumLabel?: UiTextSource
  readonly minimumPlaceholder?: UiTextSource
  readonly maximumPlaceholder?: UiTextSource
  readonly applyLabel?: UiTextSource
  readonly clearLabel?: UiTextSource
  readonly inputmode?: 'text' | 'decimal'
}

export interface UiFilterViewContext<E extends { readonly pattern: string }> {
  readonly binding: UiCollectionFilterBinding
  readonly editor: E
  readonly presentation: UiFilterPresentationContext
  submit(): Promise<UiFilterCommitResult>
  clear(): UiFilterCommitResult
}
export interface UiFilterAdaptation<E extends { readonly pattern: string }> {
  readonly name: string
  readonly pattern: E['pattern']
  readonly view: (context: UiFilterViewContext<E>) => VNodeChild
}
export type UiFilterSelection<E extends { readonly pattern: string }> =
  | UiFilterAdaptation<E>
  | ((context: UiFilterViewContext<E>) => UiFilterAdaptation<E> | undefined)
