import type { UiMessages } from '../i18n/messages'

/** Per-view wording; application localization supplies omitted keys. */
export type UiCollectionMessages = Partial<
  Pick<UiMessages, 'listAppending' | 'listComplete'>
>

/** Content context for infinity-loading and infinity-complete. */
export interface UiCollectionInfinitySlotProps {
  message: string
  /** Accepted accumulated records, not the source's overall total. */
  loadedCount: number
}

/** Read failure context; recovery remains owned by the collection binding. */
export interface UiCollectionErrorSlotProps {
  error: unknown
  placement: 'initial' | 'replacement' | 'append'
  retry(): Promise<boolean>
  canRetry: boolean
}
