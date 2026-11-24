# UiNotice

An inline message with meaning independent of announcement urgency. Import from `@uninterface/uninterface`.

| Prop | Default | Meaning |
|---|---|---|
| `binding?: UiNoticeBinding` | Omitted | Route target projection; inactive binding renders no view |
| `kind: UiNoticeKind` | `info` | info, success, warning, error or custom |
| `color?: UiThemeColor` | Omitted | Custom kind only; omission is neutral. Standard kinds determine their own color. |
| `variant?: UiNoticeVariant` | Omitted | filled, outline or soft; omission uses the backend's less-solid default. |
| `title?: string` | Omitted | Visible message title; not a document heading |
| `announcement: UiNoticeAnnouncement` | `off` | off, polite or assertive |
| `dismissible?: boolean` | `false` | Offer a backend-presented close control |

The optional `icon` slot supplies a decorative, noninteractive icon and takes precedence for every kind. An explicitly supplied empty slot suppresses the default icon. Without that slot, standard kinds supply their semantic icon; custom supplies none regardless of color. Include meaning in the message text; icon/color alone must not carry it.

Default slot supplies rich message content; `actions` supplies ordinary business actions. Root attributes/listeners are forwarded, except role, aria-live and aria-atomic are set from announcement. For an unbound notice, the `dismiss` event has no payload and requests dismissal; it does not hide the notice. A bound notice dismisses its current delivery and then emits `dismiss`. There are no exposed methods. Dismissal acceptance, retry, loading and lifetime belong to the business composition. Do not pass toolkit-specific props through attributes.

```vue
<UiNotice
  v-if="showWarning"
  kind="warning"
  title="Changes have not been published"
  dismissible
  @dismiss="showWarning = false"
>
  Publish the changes when they are ready.
  <template #actions><UiButton @click="publish">Publish</UiButton></template>
</UiNotice>
```

For an unbound notice, without a handler, or when the owner declines the request, the notice and its content remain mounted and usable. Repeated requests are allowed. Changing `dismissible` to false removes the close affordance. The close control uses the localized core `close` message and does not submit an enclosing form. No Escape shortcut, timer, automatic hiding, dismissal persistence or implicit focus destination is provided. When removing the focused close/action control, the owner moves focus to a meaningful destination after the view updates. See the guide for a complete focus example.

Actions retain source and tab order, with backend-owned spacing and wrapping. Use the actions slot for operations such as Retry or Publish; routine dismissal uses `dismissible`. Ordinary UiButton actions default to the text variant, keeping actions integrated with the message without a persistent button fill or outline. An explicit button variant or an agreed regional uiButtonVariant strategy takes precedence. This default applies to buttons directly supplied in the actions slot (including fragments and native HTML wrappers), not buttons inside opaque custom components or the message body. It does not change button color, size, loading, or availability. Ordinary action buttons need no layout wrapper. Rich custom action compositions own their internal layout. Title-only notices do not reserve an empty message body.

Off is a static message with no live role. Polite uses role=status; assertive uses role=alert. Both announce complete updates. Severity never decides urgency. Keep the notice mounted before updating its content when reliable announcement is needed; initial insertion announcement depends on assistive technology. Use assertive sparingly. Action controls remain ordinary focusable controls; announcements never move focus.

Core validates meaning and announcement, and registers strategy target notice. Backend owns appearance, semantic DOM and action arrangement. Requires notice.v1, notice.color.v1, notice.variant.v1 and notice.icon.v1. Core resolves standard colors (error → danger), validates custom colors against installed theme support, and rejects color on standard kinds. Unsupported kinds, colors and variants fail explicitly. Check static errors are not alerts, reactive polite/assertive role changes, retained slot identity, actionable recovery, declined and accepted dismissal, localized close labels, keyboard activation, long text and narrow/RTL action wrapping. See [feedback and details](../../guides/feedback-and-details.md).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.


For a row led by a text action, supporting backends align its leading content with the message column. Backends coordinate action insets and interaction feedback while preserving control height, operable targets and visible keyboard focus. Rows led by a non-text action retain boundary alignment. Icons/loading indicators keep their native internal spacing. Without enough space, containment of targets and focus takes precedence over exact content alignment. Custom action compositions own their internal alignment. Verify both LTR and RTL, wrapping, sizes and hover/focus in a browser.

## Routed feedback

`binding` accepts `target.bindings.notice` from createUiFeedbackTarget. Current delivered content supplies message/details/actions and presentation defaults; explicit notice props override corresponding defaults. Bound `dismissible` is honored when the local prop is absent. Default and actions slots receive `{ feedback }` and replace generated content/actions; icon behavior is unchanged. Core renders actual UiButtons for action descriptors. An inactive binding renders no view and releases direct core layout allocation without disposing the target. Unmount/remount preserves externally owned delivery state. Requires backend notice.binding.v1 in addition to existing notice capabilities. See [feedback routing](../../guides/feedback-routing.md) for lifecycle, reset, focus, localization and initial-announcement limits.
