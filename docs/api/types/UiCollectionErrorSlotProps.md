# UiCollectionErrorSlotProps

Import from `@uninterface/uninterface`.

## Meaning and API

```ts
export interface UiCollectionErrorSlotProps {
  error: unknown
  placement: 'initial' | 'replacement' | 'append'
  retry(): Promise<boolean>
  canRetry: boolean
}
```

Context for `#error` on `UiCollectionView`, `UiTable` and `UiList`. Placement identifies the failed read: initial load, replacement query/refresh with retained results, or append at the continuation point. `error` is the producer error; adapt it to safe business feedback rather than displaying private exception text. `retry` retries the failed operation using binding-owned guards and resolves whether it was accepted. `canRetry` controls availability.

## Ownership and verification

The backend preserves the failure container and recovery position; business content replaces the notice and actions. Use supplied recovery rather than recreating request state. The existing elected host owns announcements. Verify each placement, disabled/pending Retry, retained records and unchanged failed-query intent. See [read failures](../../guides/lists.md#read-failures-and-recovery).
