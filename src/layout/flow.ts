import type { UiLayoutProps } from './linear'

/** Content-sized peer items; proportional space division belongs to UiLayout. */
export type UiFlowLayoutProps = Omit<UiLayoutProps, 'division'>
