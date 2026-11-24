# UiNoticeAnnouncement

Import this type from `@uninterface/uninterface`.

`'off' | 'polite' | 'assertive'` chooses live announcement. Default off leaves static notices outside live roles; polite uses status and assertive uses alert. Update a mounted notice for announcement, and avoid announcing the same outcome in multiple live regions.

Core validates this value; backends render the resolved semantics. Verify dynamic changes and the independent kind/urgency combinations using [UiNotice](../components/UiNotice.md).
