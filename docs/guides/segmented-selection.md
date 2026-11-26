# Segmented selection

Use [UiSegmentedSelect](../api/components/UiSegmentedSelect.md) when a person chooses one value from a few concise alternatives and benefits from seeing them together: load outcome, display mode, frequency or direction. Joined segments make the current choice and alternatives visible without opening a menu. UiRadioGroup remains appropriate for longer labels/descriptions; UiSelect keeps larger choice sets compact. Use tabs for content-panel navigation.

## Ownership and ordinary usage

The business composition owns the field, codec, rules and choice source. Core owns guarded selection and validation; the backend owns presentation and native interaction integration. No backend imports, colors, spacing or CSS are required in business code.

```vue
<script setup lang="ts">
import { onUnmounted } from 'vue'
import { UiField, UiSegmentedSelect, createUiFieldControl, createUiEntryControl } from '@uninterface/uninterface'

const period = createUiFieldControl('daily')
const periods = createUiEntryControl([
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly', disabled: true },
])
onUnmounted(() => periods.dispose())
</script>

<template>
  <UiField :field="period" label="Frequency">
    <UiSegmentedSelect :control="periods" />
  </UiField>
</template>
```

Use localized, stable-key entries in multilingual applications. Use an ordinary UiField without `group`: UiField supplies the label, help and validation relationships for this single composite editor. Explicit `group` is rejected. The backend encapsulates internal radio-group semantics; these do not make the enclosing field a grouped field. Store business values through field codecs as needed; ordinary consumers of a reusable business component should receive its typed data/operation API, not reconstruct these internals.

Selection is single and may initially be undefined. Activating the selected segment retains it; there is no toggle-off behavior or automatic first selection. Requiredness is enforced by a business rule, with normal form submission and reset. The same field/control session survives replacement of a borrowing view. Entry-control loading, missing-value retention and disposal follow the [choice groups guide](choice-groups.md).

## Presentation and acceptance

Horizontal is the default; `orientation="vertical"` requests a vertical strip. The joined selection surface fills its allocated control width. Segments share the available space while retaining enough width for their labels; long content scrolls locally instead of being truncated. Full width means the containing field allocation, not the viewport. Vertical strips fill that width without stretching to an arbitrary height. Backends own sizing, colors and focus styling, including light/dark support. Backends may delineate segments with borders or integrate them into one field surface; individual borders and persistent selected fill are not required. UiStrategy size requests apply through native size facilities. At narrow widths the strip can scroll locally; do not assume every translated label fits because the set contains only three choices. Prefer concise labels, and consider a different control when reading or comparing long options matters.

Verify selection and submitted business values, disabled options, no deselection on repeat activation, arrow/Space/Tab behavior, error feedback, reset and focus on invalid submission. Also inspect translated labels, RTL arrow direction, dark mode, local scrolling and visible focus at narrow widths. Automated source/DOM checks do not establish browser appearance or assistive-technology acceptance.

Use a segmented field for short, mutually exclusive settings such as a display mode or a choice of frequency. Keep the chosen setting with its owner if a request uses it. For a setting that affects future requests, read the value at dispatch so editing it while a request is pending leaves that request’s behavior stable.

## Integrated field presentation

Where a backend integrates the editor with a field label, the label must stay clear of visible options even without a selection. External and hidden-label presentations retain their associations. Native configuration and supported label strategies belong in backend documentation.

Native interaction must preserve the core-owned field value and radio keyboard contract. Native field error/focus states coordinate with UiField-owned feedback; validation is not duplicated. Clicking the label focuses the selected enabled option or the first enabled option.

Short single-line options fit the native field's content-height budget after label padding. This avoids stacking a standalone button-group height inside another input. Longer descriptions, large text, vertical arrangements and a visible horizontal scrollbar can naturally increase height. Verify label clearance, neighboring input height, focus visibility, touch operation and narrow scrolling in a browser; DOM checks only establish wiring and state.


## Label placement

Treat the overall field label like a select label. Regional `above`/`beside`/`floating`/`hidden` strategies follow ordinary backend field support; hidden retains the accessible name. Beside placement depends on native support; unsupported requests retain the documented visible fallback. Responsive settings containers can therefore request beside on desktop and above on mobile without a special group-heading workaround.

The choice captions are internal option names, not external checkable labels. Keep them readable and associated with each radio target. Clicking the overall field label focuses the current enabled option (or the first enabled option / named fallback) without choosing a different value. Disabled editors reject that focus request. Backend views own this composite focus integration and accessible required/help/error state; consumers do not supply DOM IDs or focus handlers.

UiSegmentedSelect uses an ordinary UiField without `group`. UiRadioGroup and UiCheckboxGroup require `group`. Reusing choice interaction code does not require exposing its internal grouping through the author-facing field contract. No new schema, value owner or strategy is needed.

Acceptance includes ordinary field markup, all label modes and restoration, desktop/mobile label requests, label activation without selection, disabled focus guards, keyboard navigation, codec/validation/reset, source refresh and retained choices. DOM regressions verify structure, associations and state; browser visual, pointer, scrolling and assistive-technology acceptance remain separate.
