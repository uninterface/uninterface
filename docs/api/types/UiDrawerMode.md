# UiDrawerMode

`'modal' | 'panel' | 'docked'`, imported from `@uninterface/uninterface`. Required by [UiDrawer](../components/UiDrawer.md).

Modal uses a guarded run/session owner and blocks the background. Panel uses retained expansion and overlays usable background content. Docked uses the same expansion owner and reserves space through UiDrawerLayout. Resizing is available in every mode. Panel ↔ docked changes preserve child identity and owner state; crossing the modal ownership boundary requires a keyed remount. Core validates ownership and backend capability; the backend fulfills the selected space and interaction relationship. Verify retention and background use independently from modal guarding.
