# UiIcon

Import from `@uninterface/uninterface`. Requires application icon/localization setup and backend capability `icon.catalogue.v1`.

| Prop | Contract |
| --- | --- |
| `name: UiIconName` | Required semantic catalogue key. Unknown names throw. |
| `tone?: UiThemeColor` | Optional shared theme role. Unsupported roles/explicit multicolor variants throw. |
| `size?: string` | Side length of the square icon box. Accepts positive decimal values with a lowercase `px`, `em` or `rem` unit, such as `1.5rem`. Omission uses `1em`. |
| `aria-label?: string` | Localized accessible name for meaningful standalone artwork. Omit for decoration. |

No slots, events or exposed imperative methods. Standard attributes go to the backend's icon surface. The component controls role/accessible visibility. It does not create a button, tooltip, focus target or action.

The named definition is resolved from backend defaults plus setup overrides. Tone omission inherits foreground for monochrome artwork and preserves authored multicolor colors. The icon retains its proportions. An explicit size requires `icon.size.v1`. Invalid values throw, including zero, negative lengths, unitless numbers, percentages, CSS expressions and values with whitespace. `em` is relative to the icon's computed font size and `rem` is relative to the root font size. The backend owns tone realization. Core owns semantic lookup and accessibility. Parent composition owns spacing and alignment. Logical directional definitions may mirror for RTL.

UiMenu/UiNavMenu entry icons use this component unless a custom icon slot is supplied. The [catalogue](../constants/uiIconNames.md) specifies meanings; [icon definitions](../types/UiIconDefinition.md) describe overrides. Native toolkit internal glyphs are outside catalogue override coverage.

Application-owned SVG files can supply artwork through core's [SVG loader](../functions/createUiIconLoader.md). Register a `.svg?ui-icon` import in the catalogue and keep the same `name`/`tone` authoring here; no Vue wrapper is required. See [SVG setup](../../guides/localization-and-icons.md#svg-files).

Acceptance: every required name renders on every backend, decorative icons are hidden, meaningful icons expose a name, changing a catalogue mapping changes UiIcon/entry artwork, and unsupported names/tones fail visibly.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
