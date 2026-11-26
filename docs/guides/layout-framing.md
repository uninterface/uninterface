# Framing layout regions

A layout assigns space; framing distinguishes its parts without changing their business content into cards. `UiRegionLayout` supports adjoining separators, raised region surfaces, relative layers, and independently selectable adjustable boundaries in an ordinary arrangement. Linear, flow and grid layout framing and grouped-scroll integration remain unsupported.

## Separate regions

```vue
<script setup lang="ts">
import { UiRegionLayout, UiLayout, UiContent, UiStrategy, uiLayoutFraming } from '@uninterface/uninterface'

const framing = uiLayoutFraming({ separators: 'visible' }, {
  scope: { targets: ['region-layout'], depth: 1 },
})
</script>

<template>
  <UiStrategy :use="framing">
    <UiRegionLayout height="full">
      <template #start><UiContent>Introduction</UiContent></template>
      <template #main>
        <UiLayout height="full" scroll="vertical" aria-label="Reading content">
          <UiContent><ReadingContent /></UiContent>
        </UiLayout>
      </template>
      <template #end><UiContent>Conclusion</UiContent></template>
    </UiRegionLayout>
  </UiStrategy>
</template>
```

The embedding host must supply a definite height. The separators belong to the region arrangement and stay outside the nested reading scrollport. Removing supporting content removes its adjoining separator. The theme owns separator thickness and color; that thickness is accounted for before shares are divided. No extra region gaps or content insets are introduced. UiContent supplies explicit insets that travel with reading content. Content can instead be a business component, native HTML or a card.

The depth scope keeps this preference on the directly attached region layout. Without that scope, ordinary strategy inheritance can also affect nested region layouts. All eligible framing answers must agree on the complete profile; conflicts or blocking restore no separators and flat surfaces.

## Resize a split

Add these props to a horizontal Region Layout whose start and main slots contain navigation and workspace content:

```vue
<UiRegionLayout
  direction="horizontal"
  height="full"
  :division="{ start: 1, main: 3, end: 1 }"
  :resize-boundaries="[
    { between: ['start', 'main'], label: 'Navigation width', min: 10, max: 90 },
    { between: ['main', 'end'], label: 'Workspace / inspector split', min: 20, max: 90 },
  ]"
>
  <template #start><Navigation /></template>
  <template #main><Workspace /></template>
  <template #end><Inspector /></template>
</UiRegionLayout>
```

The first region initially receives 25% of the pair's combined space. The handle takes its own theme-sized track before the numeric shares are distributed. Limits are percentages of the named pair. When another enabled boundary shares a region, its limits also constrain movement. Both members require numeric shares, full extent on the arrangement axis and stretch alignment. The initial split must be within the limits. Both start–main and main–end boundaries can be enabled together or independently; horizontal and vertical arrangements work. A missing member removes the handle; nonadjacent participating members are an error.

Drag with pointer/touch, or focus the separator and use the direction's arrow keys. Left/right follow physical movement under RTL. Each key changes the first region's share by one percentage point; Shift changes it by ten. Home/End select the limits. The separator has the supplied accessible label, orientation, current value, limits and a controlled-region association. Decorative separators introduce no tab stop or thematic-break semantics. Disabling decorative separators never hides an enabled resize handle.

Each handle preserves the combined allocation of its adjacent pair and leaves all other shares unchanged. Core intersects the selected boundary's limits with every other enabled boundary's limits. The resulting effective limits drive clamping, Home/End and ARIA; they update as the neighbouring split changes. For example, if main must be at least 50% of main/end, resizing start/main cannot shrink main below end's current size. An effective interval can narrow to a single value; essential content must still be reachable through the declared scrolling policy.

Remove a boundary declaration to disable that handle. Removing a region removes its associated handles without redirecting them to different pairs. Start/end cannot be resized directly while main remains between them.

Core owns the mounted layout's adjusted split. Ordinary rerenders, localized labels and framing changes preserve it. Changes to direction, extent, participating regions, declared division or resize limits reset it to the declaration. Remounting resets it too. Persistence, external split controls/events and collapse are not provided. Consumers needing those policies should not infer them from this initial local interaction.

## Vertical resizing and content height

Vertical resize handles account for a region whose sole content root is UiContent. A content-height UiContent contributes its measured natural height, including its backend insets. A full-height scrolling UiContent contributes its insets, borders and one computed line of viewport height (normal line-height uses a font-relative estimate). Core combines these minima with all declared pair-percentage constraints. Pointer requests, arrow keys, Home/End and the announced limits use the same effective bounds. No pixel minimum or backend CSS is required in business code.

For example, keep short supporting content at its natural height and give long main content a bounded scrollport:

```vue
<UiRegionLayout
  height="full"
  aria-label="Reading workspace"
  :division="{ start: 1, main: 3, end: 1 }"
  :resize-boundaries="[
    { between: ['start', 'main'], label: 'Introduction size' },
    { between: ['main', 'end'], label: 'Reading / conclusion split' },
  ]"
>
  <template #start><UiContent>Introduction</UiContent></template>
  <template #main>
    <UiContent height="full" scroll="vertical" aria-label="Reading">
      <ReadingContent />
    </UiContent>
  </template>
  <template #end><UiContent>Conclusion</UiContent></template>
</UiRegionLayout>
```

The enclosing composition still supplies a bounded height. Backends measure the actual rendered content; core owns the resulting allocations. An initially undersized allocation, text/font change or container resize may require redistributing space: start with the current proportions, clamp regions that would fall below their measured minima (including those implied by neighbouring ratio limits), then redistribute the remaining space proportionally among the unclamped regions. Repeat if redistribution brings another region below its minimum. Minima are lower bounds, not a base allocation to which every region receives additional space. Once feasible, a handle continues to preserve its pair total and the untouched region. This environmental reconciliation is separate from a user moving one handle.

If the minima cannot fit, the arrangement scrolls as a whole while preserving its children and their usable allocations. The outer scrollport uses the layout's `aria-label`; if omitted, it uses the boundary labels joined in declaration order. Supply a meaningful layout name when that fallback is not suitable. Its native scrolling and focus treatment keep supporting content reachable; the main scrollport retains its own role and name.

This is a vertical integration for direct UiContent roots, implemented by supporting backends. It does not infer minima from opaque component internals, multiple slot roots, or full-height content without scrolling. Such compositions still own their sizing and overflow policy. Horizontal resizing is unchanged; wrapping, intrinsic width constraints and horizontal overflow remain separate concerns. Server rendering uses the declared shares; measurement activates after mounting.

Observable checks: resize each divider to both limits by pointer and keyboard; supporting text and insets stay inside their allocations, and main retains a scrollable viewport. Repeat adjustments of both dividers, change text/font and host height, hide/show supporting regions, and check that reading content remains mounted. With an insufficient host height, all content stays reachable through the named outer scrollport. A narrower host can increase natural text height through wrapping; it must trigger remeasurement.

## Raise a region

```ts
const framing = uiLayoutFraming({
  regions: { start: { elevation: 'raised' } },
}, { scope: { targets: ['region-layout'], depth: 1 } })
```

```vue
<UiStrategy :use="framing">
  <UiRegionLayout height="full" :z-parts="{ start: { above: ['main'] } }">
    <template #start><UiNavbar aria-label="Workspace navigation"><WorkspaceLinks /></UiNavbar></template>
    <template #main>
      <UiLayout height="full" scroll="vertical" aria-label="Workspace">
        <Workspace />
      </UiLayout>
    </template>
  </UiRegionLayout>
</UiStrategy>
```

Elevation applies to a region, not to a header role. Its shared edges facing lower neighbours receive a themed line and outward shadow. Start has an after edge, end has a before edge, and a raised main can have both. Missing neighbours release their edge decoration; a sole region has no shared edge. Adjacent raised regions at equal presentation elevation have no raised edge between them; at differing elevations only the higher region casts toward the lower. Explicit stacking relationships remain independent from the presentation preference.

Core derives presentation elevation from the same ordering constraints as paint order, before sequence tie-breaking. Within a sibling scope, an unconstrained participant starts at the base level; each above/below or unequal ordinal constraint raises its successor at least one level, using the longest constraint path. The containing band and ancestor levels remain significant. Thus peers with the same constraints can share visual elevation while keeping distinct, deterministic CSS paint positions. Equal visual elevation does not require equal z-index values. Pending references contribute when their regions return.

Multiple regions can be raised together. For a raised header and footer around main, request:

```ts
const framing = uiLayoutFraming({
  regions: {
    start: { elevation: 'raised' },
    end: { elevation: 'raised' },
  },
}, { scope: { targets: ['region-layout'], depth: 1 } })
const zParts = {
  start: { above: ['main'] },
  end: { above: ['main'] },
} as const
```

Bind `zParts` to UiRegionLayout. Start and end share the upper presentation level; main stays below both. If the application lets users choose raised regions, assign all raised regions above the unraised ones. Equal-level neighbours have no raised cue. The application can retain the preference for a hidden region and apply it when the region returns.

The example raises start. Raise end and place it above main to obtain a raised footer; raise main above start/end to emphasize its two adjoining edges. Horizontal arrangements remain supported: the start region's after edge is its right edge in LTR and left edge in RTL. Vertical start/end edges are bottom/top. No business CSS side names are needed.

Only edge decoration is clipped; the region's content and focus indicators remain untouched. The line lies inside the allocated edge and the shadow outside it, without adding allocation space. A raised edge replaces an ordinary decorative separator at that boundary, avoiding double lines. A resize handle still occupies its own track.

Stacking relationships establish relative drawing order between sibling allocations, with cycle rejection and an isolated local stacking context. Elevation and stacking relationships change neither region allocation nor DOM/focus order. The header's shadow can extend over the main region while its content starts below the header. The nested scrollport does not clip the header's shadow. An enclosing scrollport still clips at its own boundary and can scroll the entire arrangement.

This is not content-under-header overlay, sticky positioning, a portal, or global overlay ordering. Those policies need their own contracts. Raised styling is not a reason to cover essential content. Backend focus indicators and forced-colors boundaries remain visible.

## Boundary ownership, depth and emphasis

UiRegionLayout owns each shared boundary across the full extent of its adjacent allocations. A navbar or other participating child cannot shorten that boundary to its own content size. The layout paints the separator and coordinates suppression of the child's corresponding edge; a backend may delegate painting only when full extent and the same policy are guaranteed. Nested content borders remain independent. Ownership persists even when ordinary separators are explicitly disabled.

Depth and emphasis are independent. Equal-level neighbours have no raised cue, including equally raised neighbours. A raised neighbour receives an outward depth cue toward the lower neighbour. Start–Main uses a stronger line and Main–End a quieter but visible line, whichever side is raised. The boundary roles remain stable in horizontal arrangements, RTL and when the other supporting region is absent. Emphasis changes themed line color/contrast, never the elevation grade, shadow reach, opacity or stacking order. Ordinary non-raised separators are equal-depth boundaries and may still differ in emphasis.

| Boundary | Equal depth, separators visible | One side raised |
| --- | --- | --- |
| Start–Main | Stronger line | Stronger line and outward raised cue |
| Main–End | Quieter visible line | Quieter line and the same depth grade, facing the lower neighbour |

The native shadow recipe is oriented toward the lower neighbour on every side. Main-only therefore has two edges communicating the same elevation; Start + End retains equally raised supporting regions despite their different line emphasis. Requested ordinary separators remain when all or none are raised. Explicit `separators: 'none'` still suppresses ordinary lines without canceling requested raised treatment. A resize handle supplies the boundary line in its own track; elevation decoration does not add a second line or cover the interactive handle.

Backends own exact theme values. Consumers supply region roles and framing intent, not border colors or shadow geometry. Verify full-length boundaries with short navbar/content, equal depth and both raised directions, both arrangement axes, RTL, scrolling and optional regions. In light/dark themes the footer stays perceptible and the header stronger. Forced-colors may collapse emphasis and suppress shadows; visible boundaries and operable handles remain required, without claiming that a flat line communicates depth.

## Horizontal text wrapping

The supplied UiContent views allow a word that exceeds the available line width to break across lines, including bare supporting-region text. This avoids relying on a paragraph or enclosing card for wrapping. It leaves region shares, inset sizes and ordinary word boundaries intact. UiContent supplies this behavior independently of any enclosing frame’s native wrapping defaults.

Wrapping does not establish a measured horizontal minimum. It cannot fit a glyph into less than the available padding plus that glyph's width, or resize fixed-width/non-wrapping content. Those cases still require a usable allocation or reachable overflow policy; the vertical measurement protocol above does not apply horizontally.

## Responsibilities and verification

Business authors supply content, bounded hosting, meaningful separator/scroll names and permitted spatial relationships. Core validates relationships, negotiates presentation and owns resize state. Backends own allocation markup, pointer geometry, keyboard integration, native theme presentation and focus. No business CSS or pixel deductions are required.

Try a layout with UiNavbar in start, reading content in a scrollable main and optional supporting content in end. Swap UiNavbar for UiContent to exercise a different child while keeping the boundary layout-owned. Verify both axes, RTL, optional regions, resize limits, theme changes and retained input and focus. In a browser, verify that paragraphs remain legible and reachable, resize handles change actual dimensions, and an elevated header stays fixed while main scrolls within its allocation.

When enclosing an already-inset region composition in UiCard, use its [layout body slot](cards.md#host-an-arranged-body) to avoid adding a second outer inset. This feature does not add bounded-body hosting to UiCard. Its current content-height behavior remains documented in the [card reference](../api/components/UiCard.md).

For a supporting allocation whose whole purpose is navigation, UiRegionLayout also accepts navigation-region="start" or "end". It requests separator framing by default and coordinates the boundary with UiNavMenu/UiNavbar, avoiding duplicate edges. The layout retains ownership under explicit framing, including `separators: 'none'`; a child must not restore a local edge when the layout hides it. UiNavbar also derives orientation from this designation: side regions stack navbar content vertically, while top/bottom regions retain horizontal wrapping, independent of framing and available width. See [navigation boundaries](navigation-menus.md#navigation-boundaries-and-top-bars).

For dynamic text in reusable definitions, use [UiTextSource and the text-source practice](text-sources.md). Keep stable identities independent of labels; ordinary component text props continue to use Vue bindings.
