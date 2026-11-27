# UiInputFrameSpacer

Deprecated. Use [UiSpacer](UiSpacer.md#in-an-input-frame) in UiInputFrame.
Replace the import and the component tag to migrate. In Vue development builds,
the first use of `UiInputFrameSpacer` in each app emits a Vue warning.

`UiInputFrameSpacer` remains exported from `@uninterface/uninterface` and accepts
the same usage inside admitted input-frame content, including declared forwarders.
It requires `input.frame.sizing.v1`. This older name is specific to input frames.

Both names share the frame backend view. Flexible editors grow before any
remaining inline space is assigned to the spacer. It adds no tab stop or
accessible object and never edits or validates the owning field. See the
[input-frame guide](../../guides/input-frames.md) for examples and verification.
