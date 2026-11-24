# UiExpansionMode

The expansion policy: `'single' | 'multiple'`. Import from `@uninterface/uninterface`.

Single permits zero or one expanded key. Expanding another key replaces the previous one atomically. Multiple retains other expanded keys. Neither mode requires a panel to remain open. These policies do not choose layout, keyboard grouping or toolkit appearance.

Core validates the policy; backends only receive individual expansion states. Verify that single permits closing the last key and that multiple preserves unrelated keys. See [UiExpansionControl](UiExpansionControl.md).
