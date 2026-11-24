# UiListPaginationResult

Authoritative source navigation metadata, imported from `@uninterface/uninterface`.

```ts
type UiListPaginationResult =
  | { kind: 'numbered'; number: number; size: number; total?: number; hasNext?: boolean }
  | { kind: 'cursor'; cursor: string | null; size: number; next: string | null;
      previous?: string | null; total?: number; offset?: number }
```

Numbers/sizes are positive safe integers. Totals and offsets are nonnegative safe integers. Size must equal the request; kind must match the session. A source may correct a numbered page, for example after deletion, but it must remain within known bounds and its returned range must fit the total. With known total, supplied `hasNext` must agree with it. Without a total, numbered `hasNext` is required.

Cursor results echo the requested `cursor` exactly and always supply `next`: null declares completion. Omitted `previous` means unavailable; explicit null means the initial null route. The controller does not fabricate history. Optional offset enables a known absolute range in replacement mode. Cursor totals never enable arbitrary page jumps.

Metadata describes the accepted records and is published with them. Failures must not publish new totals or continuations. Verify unknown totals, zero results, contradictory metadata rejection and matching cursor context. See [UiPaginatorBinding](UiPaginatorBinding.md).
