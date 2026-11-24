# filterRangeCompact

Import from `@uninterface/uninterface`. A stable frozen UiFilterAdaptation for pattern range. Two bound projections in one input frame with integrated Apply/Clear actions.

Explicit ranges show Apply in table-column/popover and filter-badge/popover contexts; focus exit does not commit there. Other contexts complete on Enter or focus leaving the whole editor; internal focus movement does not apply. Clear remains available according to binding state.

Its view function implements the actual Vue composition; native controls and themes come from the selected backend. Use directly or return it from uiRangeFilterPresentation. Object identity is authoritative; its diagnostic name is not a registry key. Shared surfaces retain validation/field context and completion operations without interpreting a layout description.

See [filter adaptations](../../guides/filter-adaptations.md) for default selection rules, forcing/customizing presentations and strategy agreement; [built-in filters](../../guides/filter-patterns.md) covers exact completion and native limitations. Selection does not change commit policy, criterion semantics or owner lifetime. Verify context switching without reads, unchanged drafts, availability, accessible names/actions, disposal and real-browser layout.
