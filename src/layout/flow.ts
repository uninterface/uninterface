import type { UiLayoutProps } from './linear'

export const flowSpacer = Symbol('uninterface.flowSpacer')

/** Content-sized peer items; proportional space division belongs to UiLayout. */
export type UiFlowLayoutProps = Omit<UiLayoutProps, 'division'>
