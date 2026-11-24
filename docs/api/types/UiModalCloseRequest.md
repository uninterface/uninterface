# UiModalCloseRequest

Proposed non-error outcome presented to `beforeClose`. Import from `@uninterface/uninterface`.

`{ status: 'completed'; value: T } | { status: 'cancelled'; reason: UiModalCancelReason }`

Return true to allow or false to deny. A denied completion does not publish its proposed value. A dirty-content guard can distinguish completion from abandonment without the modal knowing its hosted content. Terminal error and forced lifetime cleanup bypass the guard.

Core coordinates one decision at a time and ignores stale resolutions. Business code supplies policy. Verify denied/accepted cancellation and result-bearing completion. See [UiModalRunOptions](UiModalRunOptions.md).
