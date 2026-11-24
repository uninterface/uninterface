# UiDrawerSizingProps

Shared sizing inputs for all [UiDrawer](../components/UiDrawer.md) modes. Import from `@uninterface/uninterface`.

| Property | Default | Meaning |
| --- | --- | --- |
| `preferredExtent?: UiDrawerExtent` | `24rem` | Initial outer extent on the attachment axis. |
| `minExtent?: UiDrawerExtent` | Unspecified | Lower constraint, subject to available space. |
| `maxExtent?: UiDrawerExtent` | Unspecified | Upper constraint, also capped by available space. |
| `resizable?: boolean` | `false` | Enable the backend resize boundary. |
| `resizeLabel?: UiTextSource` | Unspecified | Required nonempty accessible name when resizable. |

See [UiDrawerExtent](UiDrawerExtent.md) for units. Contradictory resolved min/max fail clearly when the minimum fits available space. When even the minimum cannot fit (including a zero-size hidden host), available space and the upper bound win. The attached edge remains fixed. Arrow keys move the opposite boundary in its physical direction by 8px, or 40px with Shift. Home/End choose the resolved minimum/maximum. The named focusable separator exposes current value, bounds, orientation and controlled surface. Touch/pointer resizing does not request drawer dismissal.

Extent state belongs to the mounted drawer. Overlay and docked sizes have separate memories; collapse/reopen and panel/docked changes preserve them. A temporary available-space clamp does not overwrite a memory. Modal memory survives successive runs of the same mounted UiDrawer, while run content follows its ordinary lifecycle. Changing preferredExtent or edge resets both memories. Changing constraints clamps rendering without resetting memory. Remount resets all local preferences. There is no controlled-size or resize-persistence API in this version.

Core owns extent resolution and validation; backends supply measurements, handles, native surface integration and visible focus. Verify keyboard and pointer bounds, all modes/edges, retained drafts, viewport shrink/restore and modal background blocking. Do not equate DOM measurements with browser acceptance.
