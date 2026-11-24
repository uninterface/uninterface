# UiEntrySource

A supplied `readonly UiEntry[]`, or `(request: { signal: AbortSignal; query: string }) => readonly UiEntry[] | Promise<readonly UiEntry[]>`. Import from `@uninterface/uninterface`.

Use the same source form for a root collection or submenu. The control calls providers; a backend never fetches independently. Providers may use `signal` with fetch and interpret query text according to business rules. No network, pagination or sorting protocol is implied. Arrays represent supplied results; explicit refresh rereads a source.

Provider exceptions are recoverable load failures. Invalid returned entries are contract errors that reject loading. Controls must ignore obsolete results even when cancellation is ignored. Verify out-of-order requests, successful empty results, failures and retries. See the [entry contract](../../contracts/entries.md).
