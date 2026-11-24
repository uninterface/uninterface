# Choosing button colors and variants

The UiButton API implements these authoring choices; there is no automatic action-role classifier.

## Meaning first, emphasis second

Choose semantic color from what the action does, then a variant from its role in the local task. Themes own exact colors; backends own markup, interaction-state treatment and geometry. Color and variant never change callbacks, confirmation policy, form bindings or permissions.

| Situation | Color | Variant |
|---|---|---|
| Delete, remove, clear a value, or discard changes | danger | Filled when sole or principal; outline when accompanying another principal action |
| Explicit affirmative Yes / negative No decision | success / danger | Normally filled for the principal answer and outline for the alternative; emphasis is independent of polarity |
| Single ordinary action, including a sole OK/Done acknowledgement | primary | filled |
| Main action in a row, such as Save | primary | filled |
| Companion action, such as Cancel or Back | primary | neutral |
| Peer actions with no clear ranking | primary | filled for each peer; no principal/companion distinction is required |

Destructive meaning takes precedence over affirmative and ordinary-action rules. Answering Yes to “Delete this record?” still uses danger. Prefer specific labels such as Delete or Discard to an ambiguous Yes. Save/Cancel is a task/companion pair, not a Yes/No polarity pair.

Judge the actual operation. Form Reset discards the draft and restores the accepted baseline, so it uses danger/outline beside Save. Clearing a value or removing obsolete permissions also uses danger. Ordinary Cancel, Close and Dismiss use primary/neutral when paired; a sole acknowledgement uses primary/filled. If dismissal requires a separate discard decision, that decision carries danger. A simulated failure is not destructive merely because it produces an error. Loading and disabled states retain the selected color and variant.

A task region can be a form, dialog, card or independent demonstration. When the workflow establishes a principal/companion relationship, emphasize the principal action. When actions are peers and their ranking is unclear, they may all use primary/filled. Do not invent a hierarchy merely to limit a row to one filled button; separate tasks on one page may each have one. Responsive wrapping or stacking does not change those roles. Order alone does not establish importance.

## Authoring and ownership

The business composition knows which action saves, removes, confirms or cancels. It selects existing semantic props without CSS or native-toolkit knowledge:

    <UiLayout direction="horizontal" wrap>
      <UiButton :binding="form.bindings.submitButton" color="primary" variant="filled">
        Save
      </UiButton>
      <UiButton color="primary" variant="neutral" @click="cancel">
        Cancel
      </UiButton>
    </UiLayout>

For form Reset, use the owning reset binding with danger/outline; retain the native reset event route. Reusable business components encapsulate these choices with their workflow. Ordinary consumers supply typed data and operations.

For an explicit non-destructive Yes/No decision, use success and danger respectively. This convention does not recolor checkbox/radio values or imply that choosing No deletes anything. The current demo has no literal Yes/No action pair; discard/keep-editing dialogs retain danger/primary. Do not add an unnecessary confirmation merely to demonstrate colors.

Public color and variant props remain independent. Primary is a theme color, not an action-role API. Filled and outline describe presentation, not authorization, keyboard activation, or business semantics. The backend default remains available for unspecified actions; this guide does not globally change omitted props to primary/filled. An explicit variant takes precedence over an agreed regional uiButtonVariant strategy, contextual defaults and the backend default. Regional strategies are useful for shared preferences, while explicit props preserve deliberate exceptions.

## Secondary color requires strong justification

Use primary for ordinary actions at both emphasis levels. A secondary action is not a reason to choose the secondary theme color: express its quieter resting presentation with neutral. Peer actions whose ranking is unclear may all use filled. Supporting utilities, preset choices and informational icon actions still use primary with a variant appropriate to their context.

Reserve secondary button color for a concrete, documented semantic or integration requirement that primary with an appropriate variant cannot fulfill. Record the requirement, why primary is insufficient, and an observable acceptance check. Position in a row, reduced importance, an assumed neutral/gray palette, or toolkit defaults alone are not sufficient justification for an authored selection. No ordinary demo-authored action currently needs this exception. The color catalog deliberately demonstrates all supported roles and is an explicit exception; backend-default specimens remain tests of omission.

## Compositions and exceptions

- Input-frame actions retain integrated text/icon geometry. Search can use primary with its contextual text treatment; Clear uses danger/icon. An informational preset trigger remains primary/icon.
- Collection actions use primary/filled for Edit and danger/outline for Remove in text or icon+text mode. Collection icon mode still selects icon treatment with accessible labels.
- Single authored feedback actions such as Acknowledge, Retry, Restore and Complete review explicitly request primary/filled. Generic feedback compositions retain contextual text defaults for other consumers.
- Peer actions with no clear ranking may all use primary/filled. For example, Send toast / Send six toasts and Send notification / Open review notification / Open report notification are equally emphasized launch actions. Multiple filled buttons are valid when the task supplies no reason to rank them.
- Neutral remains appropriate for a deliberate supporting role or quieter contextual presentation, including preset choices within an editor. Being adjacent to another action, or having no obvious ranking, does not itself require neutral.
- Navigation, tabs, segmented value choices, native picker controls, upload controls and component-owned dismiss affordances retain their own contracts and native presentation. Do not replace them with standalone action buttons or infer roles from DOM position.
- Catalog specimens comparing colors, variants, omitted defaults, loading and strategy precedence preserve those choices. They are presentation tests rather than business-action examples.

Outline, soft and text remain supported for contextual needs or regional policies; they are not the ordinary Save/Cancel row convention. Icon-only actions require meaningful labels and recognizable artwork. Color must never be the only explanation of an action.

## Observable acceptance

Check standalone completion, Save/Cancel, Save/Reset, removal and destructive confirmation in the actual composition. Verify semantic colors and variants across disabled/loading states and responsive rearrangement. Check collection text/icon+text/icon modes and integrated input actions without losing their geometry or labels.

Bindings, native submit/reset routes, callbacks, loading restrictions and keyboard operation must remain intact. Review actual appearance and visible focus across supported themes/backends; source/type checks do not establish browser visual or accessibility acceptance. Verify that filled versus neutral distinguishes principal and companion actions while both use primary. Where actions have no clear ranking, verify equal primary/filled treatment (for example, both toast senders and all notification launchers); do not infer importance from order, wrapping or the number of buttons. Audit any secondary-colored action against its documented exception; do not assume secondary is gray.

## Design references

[Carbon button usage](https://carbondesignsystem.com/components/button/usage/) distinguishes destructive meaning from emphasis (danger has multiple styles), and pairs principal actions with lower-emphasis alternatives. [Bootstrap button documentation](https://getbootstrap.com/docs/5.3/components/buttons/) demonstrates semantic colors independently of outlined treatments. These are design references, not assertions about the installed Bootstrap adapter's version or native classes.

The specific Yes=success / No=danger convention, lone-action primary/filled rule and primary/neutral pairing are Uninterface authoring choices, not a universal framework standard.

See [UiButton](../api/components/UiButton.md), [UiCollectionButton](../api/components/UiCollectionButton.md), [control bindings](control-bindings.md), and [control presentation principles](design-principles.md).

## Neutral companion presentation

Use color="primary" variant="neutral" for Cancel/Back/Keep editing and deliberately supporting utilities. Unranked peer actions may all use primary/filled. Neutral has a neutral resting surface and color-aware interaction feedback; it is not the secondary theme color. Backends choose a compatible treatment; interaction feedback may use a tint or a stronger fill. Exact colors and tint strength remain theme/backend-owned. Ordinary outline remains available and keeps semantic color visible at rest; destructive actions retain danger/outline or danger/filled. Informational icon actions remain primary/icon. The Buttons catalog includes all six treatments and neutral strategy selection.
