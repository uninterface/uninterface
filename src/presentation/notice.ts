/** Meaning of an inline message, independent of announcement urgency. */
export type UiNoticeKind = 'info' | 'success' | 'warning' | 'error' | 'custom'
/** Notice surface treatment; omission selects the backend's less-solid default. */
export type UiNoticeVariant = 'filled' | 'outline' | 'soft'
/** Whether updates to an already mounted notice are announced. */
export type UiNoticeAnnouncement = 'off' | 'polite' | 'assertive'
