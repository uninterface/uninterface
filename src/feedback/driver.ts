import type { UiFeedbackHandle, UiFeedbackMessageSource } from './routing'
export interface FeedbackDriver {
  send(
    owner: symbol,
    source: UiFeedbackMessageSource,
    options?: unknown,
  ): UiFeedbackHandle
  clear(owner?: symbol): void
}
export const feedbackTargets = new WeakMap<object, FeedbackDriver>()
