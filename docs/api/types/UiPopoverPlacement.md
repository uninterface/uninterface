# UiPopoverPlacement

Union top | bottom | start | end; default bottom. A preferred side relative to the registered anchor. Start/end resolve using anchor direction. The backend may flip and clamp to retain viewport access and must follow moving anchors. No coordinates or pixel offsets are business inputs. Verify moving anchors, scrolling, viewport constraints and RTL in a real browser.

See [drawers and popovers](../../guides/drawers-and-popovers.md) for composition, ownership and evidence limits.
