# UiNoticeKind

Import this type from `@uninterface/uninterface`.

`'info' | 'success' | 'warning' | 'error' | 'custom'` describes a message's meaning. Error is a failed outcome, while danger is a theme color. This value does not choose announcement urgency.

Core validates this value; backends render the resolved semantics. Verify dynamic changes and the independent kind/urgency combinations using [UiNotice](../components/UiNotice.md).

Standard kinds determine the semantic color and default icon. Custom accepts an optional UiThemeColor and stays neutral when color is omitted; it has no automatic icon. A supplied icon slot always replaces the default, for every kind, including an intentionally empty slot. Color is rejected on standard kinds. Announcement urgency remains independent.
