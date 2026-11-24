# UiOverlayCloseTrigger

Union `close-button | escape | outside | trigger | drag`. Used by drawer/popover closeOn; order/duplicates have no effect and an explicit array replaces the component default. Outside means backdrop activation for a modal and outside pointer activation for a nonmodal surface. Trigger means reactivating the bound host while open. Drag is a drawer-only native gesture route, available only where the backend documents gesture support; it is not accepted by UiPopover. Disabled or unsupported gestures add no interaction. Enabled routes request cancellation through the run guard or panel expansion owner; they never directly mutate native visibility. Verify disabled routes, pending decisions and nested ownership.

See [drawers and popovers](../../guides/drawers-and-popovers.md) for composition, ownership and evidence limits.
