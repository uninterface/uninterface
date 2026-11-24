# Frame contract

Conceptual scope: The named frame kinds are illustrative examples, not an exhaustive list of supported frames. The supported set remains open. Detailed behavior below is proposed until settled; no implementation API is prescribed.

## Business concept

A frame defines the outward boundary and presentation of content, including how that content relates to its surroundings. Its border is usually visible but may be visually absent. The boundary can be expressed through a card surface, a dialog, or an attached popup, with the behavior appropriate to that presentation.

A business author chooses a frame by its purpose and documented guarantees. The theme and implementation supply the exact border, surface, geometry, and interaction mechanics. An invisible border does not remove the frame's behavioral obligations.

The [layout contract](layout.md) describes the inward arrangement: what receives space inside the region, how it is divided, and what scrolls. A frame describes the outward presentation: how the region is bounded, placed, attached, and interacted with relative to other content. They compose without requiring consumers to repeat either contract's details.

## Example frame kinds

| Kind | Meaning to the business author | Obligations of the implementation |
|---|---|---|
| Card frame | Present content as a card within its surroundings | Provide the themed card boundary and surface, and participate in its parent's allocation |
| Modal frame | Present content as a blocking modal dialog | Mask surrounding content, block interaction outside the active modal interaction, provide dialog semantics, and honor the close-request contract |
| Tooltip frame | Attach supplementary explanatory content to a subject | Maintain the subject relationship, suitable placement, and accessible tooltip behavior |
| Popup frame | Present supplementary content in a separately placed region | Fulfill its declared attachment or screen-relative placement, interaction role, visibility, and dismissal behavior |

These examples neither limit the frame model to these kinds nor establish a complete mandatory catalog. Other frame kinds may express different outward presentation and interaction contracts. The particular role of a popup must be documented: an action menu, an informational popup, and an interactive detail panel have different interaction obligations.

## Shared input frame direction

[UiInputFrame](../api/components/UiInputFrame.md) and [UiTextInput](../api/components/UiTextInput.md) compose named text parts, decorations and actions into one [input-styled control](input-styled-controls.md). UiInputFrame is the shared frame for that composition, while UiTextInput is a cooperating sub-input without its own outer frame. The field owns naming/feedback and the business composition owns its value, codec, operations and lifecycle. The frame adds no validation owner. See the [shared-input guide](../guides/input-frames.md) for the supported contract and acceptance.

The frame aggregates focus across DOM descendants and explicitly registered owned-popup engagement, validates on whole-frame departure, inherits field availability and exposes focus routing to registered parts. Backend themes own surface and wrapping. The [delegated control-frame API](../guides/control-frames.md) supports backend/plugin participation; all five temporal range adapters use it internally. Opaque editors require explicit integration, and tags editing remains deferred.

## Attachment, placement, and size

The author may express a relationship to another element or to a screen region. Attachment identifies the subject or anchor; placement describes where the frame appears relative to it. A triggering element, an anchor, and a logical parent can be the same element, but need not be.

The implementation resolves concrete position and size from that relationship and the available space. A declared placement policy must explain whether a preferred location may change when space is insufficient. Exact offsets, stacking values, and positioning technology belong to the implementation.

An attached frame must maintain its relationship as the anchor or available area changes. If the anchor disappears, the contract needs a defined response, such as closing the frame or using a declared alternative. The allowed placement vocabulary and fallback policies remain open.

Visual attachment does not require the frame to be a logical child of its anchor. It establishes a positioning relationship; state ownership and interaction scope need their own rules. See the [logical node contract](logical-node.md).

The outer allocation and the inner layout must agree. The frame obtains an area from its surroundings and offers usable space to its content after presentation details are accounted for. An inner layout that requires bounded height must receive it through this integration, without consumers calculating border or padding deductions.

## Proposed interaction obligations

### Modal frame

Opening a modal establishes a named dialog and moves focus meaningfully into it. The surrounding content is masked and unavailable for interaction while the modal is active. Keyboard focus stays within the active modal interaction, including any legitimately owned popups. Closing restores focus to the invoking control or another meaningful visible destination when that control is unavailable.

Owned popup infrastructure must not change the modal's position, dimensions or region presentation merely by mounting, opening, closing or unmounting. This requirement covers accidental separator/spacing changes caused by portal nodes and hidden placeholders; it does not freeze the modal when business content or the viewport changes. Backends own the markup and styling that fulfill it; no shared wrapper or new z-order boundary is required. See the [backend modal reference](../api/backend/overlays.md#uimodalviewprops) for verification obligations.

The visual mask and the interaction block are both required. A backdrop alone does not fulfill modality. Changes of theme or desktop/mobile presentation must preserve these guarantees.

Escape, a close control, and a backdrop click are possible sources of a close request. Which sources are enabled is part of the frame's documented policy. Backdrop clicking is not assumed to dismiss every modal.

### Close requests and state

Modal lifecycle state is managed through the shared [UI state contract](ui-state.md). Business code supplies closure decisions and can observe or request meaningful lifecycle changes without manipulating backend component state. The frame implementation fulfills the resulting presentation and interaction obligations.

A request to close and a completed closure are separate concepts. A close request expresses intent; it does not imply that the business action succeeded or that unsaved content may be discarded.

A proposed lifecycle is: receive a request with its source, apply the declared closure policy, then either keep the frame open or commit closure. If the policy requires a pending decision, the frame remains in a coherent state until that decision resolves. Async approval, rejection, and repeated-request semantics require a specific contract before implementation.

Each frame contract must identify who owns its open state and who decides whether closure proceeds. Implementations must honor that decision and keep visibility, focus, and modal blocking consistent. The exact state/event API remains open; consumers must not need backend-specific dismissal listeners.

### Tooltip and popup frames

A proposed tooltip contract supplies supplementary descriptive content associated with its subject, available through keyboard focus as well as the applicable pointer interaction. It preserves focus on the subject and follows the accessibility behavior for tooltips. Content that requires interactive controls needs a suitable interactive popup contract.

`UiTooltip` provides a supplemental description surface. Verify physical placement and hover continuity in the selected backend. See the [guide](../guides/navigation-and-tooltips.md). It provides literal `text` or formatted noninteractive default-slot content (the slot takes precedence), and a `host` slot exposing a `trigger` binding applied to the actual subject. Authors choose the host and supply localized supplementary content; backends own positioning, rendering and native integration, preserving host activation and existing accessible descriptions without a mandatory layout wrapper.

```vue
<UiTooltip text="Includes the current filters" trigger="click" v-model:visible="helpVisible">
  <template #host="{ trigger }">
    <UiButton v-bind="trigger">Report information</UiButton>
  </template>
</UiTooltip>
```

`trigger` accepts `hover`, `focus`, `click`, or an array; the default is hover plus keyboard focus. An empty array leaves activation to application-controlled visibility. Binding `visible` observes and controls state without disabling triggers; interactions emit `update:visible`. Without a binding, the component owns local visibility. Independent `disabled` gates tooltip availability, not host availability. Preferred `placement` is top, bottom, left or right; backends accommodate viewport limits.

Click activation toggles visibility and, when combined with hover/focus, keeps the tooltip visible after pointer departure. Another click, outside activation or Escape dismisses the click-opened tooltip. A fresh trigger interaction rearms after dismissal; a controlled owner commits or declines visibility requests. The tooltip preserves host focus and ordinary actions. Authors choosing hover-only or manual activation must provide keyboard access to the supplementary description; essential instructions must remain available independently.

Acceptance must verify actual host identity, preserved handlers and description associations, keyboard/pointer/touch interaction, dismissal, controlled updates, formatted content lifetime, viewport/scroll positioning, modal hosting and cleanup across supporting backends. Toolkit source feasibility does not establish these results. Disabled hosts, default touch behavior and delay policy remain open details.

A popup must state its role, whether it blocks outside interaction, what opens it, and how it closes. Focus movement, keyboard behavior, and accessible relationships follow that role. Choosing a floating appearance alone does not settle those behaviors.

Anchored frames follow the [native arrow presentation principle](../guides/design-principles.md#native-arrows-on-anchored-surfaces). Preserve the matching native popover/popup's arrow treatment, including native arrows within reusable compositions. The backend owns artwork, theme and resolved attachment; consumers do not repair missing arrows with CSS. A decorative pointer conveys attachment, not role, modality, dismissal or focus ownership. Arrowless native control families remain valid; the existence of an arrow-capable lower-level primitive alone does not change their presentation contract.

When an attached frame cannot use the same presentation on mobile, its documented adaptation must preserve the purpose and interaction guarantees. The shared environment mechanism provides the context; frame implementations do not invent independent mobile detection rules.

## Modal run contract

[UiModal](../api/components/UiModal.md) and [createUiModalControl](../api/functions/createUiModalControl.md) implement the run contract below. See the [modal guide](../guides/modals.md) for exact hooks, ownership and verification limits.

A declared modal can expose an awaitable interaction through a reusable business component. Each call starts a distinct **modal run session**, sets up its hosted target, awaits an outcome, closes the presentation and tears down that run. Once the call returns, the same owner can start another session. Concurrent calls on the same control are denied without disturbing the active session. A new session does not imply a new business record, new form control or forced remount of the declared component.

The result distinguishes three outcomes:

| Outcome | Meaning |
|---|---|
| `completed` | The hosted interaction explicitly supplied a typed result |
| `cancelled` | The interaction ended without completion, with a cancellation reason |
| `error` | A caught failure is relayed to the caller, preserving the original error information |

Setup and teardown belong to the run lifecycle. Business-supplied setup can load an existing record, initialize a new item, resume retained state or prepare non-form content. Business-supplied teardown releases resources acquired for that run, including resources from partial setup. Modal machinery does not infer business initialization or disposal policy.

Error capture covers operations executed or awaited through the lifecycle and failures explicitly relayed by hosted content. It cannot automatically capture every detached asynchronous operation or unrelated event-handler exception. A failure already handled by hosted content does not implicitly terminate the modal. Lifecycle failure handling must attempt cleanup and relay an error outcome; teardown failures must not be reported as successful completion. If both the operation and cleanup fail, preserve the original failure as well as cleanup diagnostics.

A form and a modal remain independent controls. Hosted content can participate through a close-policy contract: for example, a business composition can inspect a form's dirty state and await a confirmation before allowing closure. The modal itself does not inspect forms, detect dirty values, infer completion from submission, or assume that a pending operation prohibits closing. Those decisions belong to the participating business composition. The same contract supports content unrelated to forms.

The initial recommended dismissal policy permits cancellation requests from Escape and an explicit close control, with backdrop dismissal opt-in. Enabled routes consult the same asynchronous policy. Denial leaves the session and its pending result intact. Independently owned child modals support confirmation interactions; focus and dismissal belong to the active top interaction, with restoration to the parent when the child closes.

An active child popup that handles Escape has first use of the key. A composite
picker closes its choices and returns focus to its trigger while the enclosing
modal, drawer or popover remains open. A later Escape from the closed trigger
reaches the active owner and follows its close policy. Denying or awaiting a
close decision keeps that interaction active. Once a picker has accepted
closure, its exit animation does not reserve a later press. A closing native
modal retains modality through its exit. Holding Escape does not dismiss a
second layer. Browser-managed native picker behavior follows the platform.

Each run settles once after presentation cleanup and run teardown. Owner teardown must also settle an outstanding interaction. Pending decisions and completion callbacks belong to the run that created them and cannot settle a later run. Recommended concurrent-call handling returns an error outcome for the competing call without altering the original call.

Observable acceptance includes sequential reuse, denied concurrency, all three result outcomes, partial setup and teardown failures, stale callbacks, denied closure, nested confirmation, and non-form content. Long-content reachability, owned popups, focus restoration, background blocking and environment continuity remain required parts of modal acceptance.

## Composition with layouts

The [ModalBodyLayout reference arrangement](layout.md#example-modalbodylayout) separates an outer frame from its inner header/main/footer layout. The name is illustrative, not an exported component. This arrangement can serve modal dialogs, drawers and interactive popovers without imposing the same modality, placement or lifetime on them. For a dialog containing a summary, a long form, and actions, a conceptual composition is:

```text
Modal frame — outer presentation and modal interaction
└── ModalBodyLayout — inner arrangement
    ├── header: summary, if supplied
    ├── main: form content in the scrollable region
    └── footer: actions, if supplied
```

The modal frame supplies placement, masking, blocking, and the close lifecycle. `ModalBodyLayout` supplies the documented slot arrangement and scrolling. The composition contract must identify the dialog's accessible name; a header slot is not automatically its title. The business content supplies field meaning and the actions themselves.

A frame integrates the complete inner arrangement, including body scrolling and any promised action spacing/wrapping. A native surface without header/footer theme slots still needs that integration. Region allocation alone does not arrange the buttons inside a footer. The existing `#actions` contract supplies backend-owned button arrangement; `#footer` accepts a consumer-authored composition. See the reference arrangement for allocation, ownership and observable checks.

This is a conceptual boundary, not a requirement for a particular component tree or one frame per container. A named business component may encapsulate both the frame and the layout, exposing only the slots and decisions its consumers need.

For a drawer, the layout contract describes expanded/compact/hidden allocations and how surrounding space changes. A frame adds the outward surface, attachment or edge placement, and any overlay interaction. One shared state must coordinate the two; the name “drawer” does not alone establish modality.

Drawer/docking presentation owns its visible border and depth treatment relative to the content it overlays or pushes. Themes/backends supply the concrete artwork; ordinary consumers do not add border CSS or select a strategy to obtain it. The layout must allow and preserve that presentation while fulfilling allocation, scrolling and motion containment. It does not paint a competing drawer border. This drawer-specific responsibility does not require every frame or ordinary layout to have a visible border. See [drawer boundary and depth](../guides/floating-panels.md#drawer-boundary-and-depth).

## Responsibility boundary

| Responsibility | Owner |
|---|---|
| Purpose, content, meaningful attachment, and business conditions governing opening or closing | Business definition or reusable business component |
| Meaning of the chosen frame, placement policy, and open/close guarantees | Frame contract |
| Concrete border/surface appearance, role colors, and applicable hierarchy treatment | Theme |
| Geometry, masking, outside-interaction blocking, keyboard/focus behavior, and integration with surrounding frames | Implementation/actuator fulfilling the selected frame contract |
| Desktop/mobile context | Shared environment mechanism |
| Internal arrangement and scrolling | Layout or named layout composition |

Plugin-provided frames and content must participate in these same boundaries. Backend-specific capabilities or unsupported combinations must be documented rather than hidden behind an apparently equivalent frame name.

## Proposed acceptance scenarios

| Scenario | Expected observable result |
|---|---|
| A card's theme changes | Its themed boundary changes while the content's layout guarantees remain intact |
| A frame is presented without a visible border | Its placement and interaction obligations still hold |
| A modal opens | Its content is available as a named dialog, focus is managed, and surrounding content is masked and blocked |
| A close request is refused under the declared policy | The frame remains open with coherent focus, content, and modal state |
| Closure is accepted | The frame closes and releases its own interaction block; focus is restored meaningfully |
| An attached frame's anchor moves | The documented attachment and placement policy remains satisfied |
| A tooltip is reached through keyboard focus | Its supplementary description is available without requiring a pointer |
| ModalBodyLayout contains more content than fits | The frame provides the agreed bounded area and the layout makes its main content reachable by scrolling |

## Current limits and unspecified behavior

The general frame model has no implemented common API for placement/fallback, open-state bindings, closure policy, nested frames or theme hierarchy. UiTooltip implements the scoped description surface above. Title/description integration and responsive coordination with layout and focus are also unspecified for future frame kinds. Existing components retain their own documented contracts. UiModal implements the scoped run contract above; the broader examples do not add general placement or arbitrary bounded-frame APIs. The implemented card subset is documented below.

These are explicit design questions. An application or development agent should be able to select a documented frame and rely on its guarantees, without reconstructing masking, positioning, or focus management from vendor APIs.

## Implemented card subset

[UiCard](../api/components/UiCard.md) implements a content-height bounded unit with header/title/description/default/footer slots and an alternative `layout` body slot. Ordinary bodies have card-owned insets; the layout body owns its own insets, so the card omits only its body padding. Explicit child insets and the native frame remain intact. This does not provide a bounded height offer or scrolling. Its five hierarchy requests run from -2 (higher) through zero (ordinary) to 2 (subordinate); -2 may use -1 treatment. The [hierarchy strategy](../strategies/uiHierarchyLevel.md) supports scoped preferences. Core resolves explicit level, agreed strategy and default zero in that order; this is a card-specific rule. See [cards and hierarchy](../guides/cards.md) for supported authoring and observable acceptance. UiModal has its separately documented lifecycle, default content-sized body scrollport and explicit `bodyScroll="content"` mode for content-owned scrolling under its viewport cap. UiPopover provides scoped anchored placement; general independently bounded frame-hosting APIs remain draft.

## Implemented region framing

Ordinary UiRegionLayout supports shared separators, multiple adjustable adjacent numeric-share boundaries, and relative sibling layers with raised presentation. These coordinate allocation and outward framing without requiring UiCard wrappers. See [layout framing](../guides/layout-framing.md) for exact APIs, state lifetime, capabilities and acceptance. Framing of other layout kinds, grouped-scroll integration, bounded UiCard bodies and actual content overlays remain open.

## Modal width standard

[Modal width determination](modal-sizing.md) implements shared preferred/minimum/maximum widths, auto/available modes and a hard viewport limit across backends. Automatic nested-content preference reporting remains proposed.

## Dynamic stacking integration

The [dynamic z-order contract](dynamic-z-order.md) defines core-owned ordering across surfaces, layers, groups and local parts. Universal `zOrder`, layout `zParts` and adapter registration are implemented; real-browser acceptance remains separately reported. Ordering is distinct from inward layout, visual framing and presentation strategies. Ordering does not replace layout, framing or strategy ownership.


## Drawer and popover implementation

UiDrawer implements modal run and persistent panel modes; UiPopover implements anchored run interactions with optional modality. See [the public guide](../guides/drawers-and-popovers.md) for exact ownership and limits. Modal/panel modes overlay the viewport; docked mode reserves space through UiDrawerLayout with the same retained expansion owner as panel. UiFloating supplies an independently repositionable launcher, and all drawer modes support shared constrained resizing. See [floating panels](../guides/floating-panels.md). Compact rails remain draft. Anchored popovers follow a registered subject with viewport fallback; they do not adopt tooltip/menu semantics. Async run lifecycle is shared with UiModal and can be encapsulated as a business method. Browser geometry and assistive-technology acceptance remain distinct from DOM-only verification.
