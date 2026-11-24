# uiIconNames

Import from `@uninterface/uninterface/icons`. Frozen readonly tuple of the 58 required semantic names. A backend's catalogue must fulfill all names; applications can add namespaced extensions. This list describes availability, not the artwork itself.

| Name | Meaning |
| --- | --- |
| `add` | Create/add an item. |
| `edit` | Modify an item. |
| `settings` | Configure preferences or settings for an application, account, or resource; distinct from editing content. |
| `delete` | Delete a resource. |
| `save` | Persist changes. |
| `cancel` | Abandon an operation. |
| `confirm` | Accept/confirm an operation. |
| `search` | Find matching information. |
| `refresh` | Reload data; does not mean discard/reset changes. |
| `copy` | Copy content. |
| `upload` | Transfer content into the application/source. |
| `download` | Retrieve content for the user. |
| `close` | Dismiss a surface. |
| `menu` | Access a menu. |
| `menu-item` | Generic menu/navigation entry artwork; automatic fallback for a rail entry without an icon. Shares default page artwork with `file`, with independent overrides. |
| `more` | Additional choices/actions using a horizontal three-dot mark. |
| `more-horizontal` | Explicit horizontal alias of `more`; shares its default artwork, with an independent override key. |
| `more-vertical` | Additional choices/actions using a vertical three-dot mark, such as record context actions. |
| `previous` | Previous logical item/page; mirrors in RTL. |
| `next` | Next logical item/page; mirrors in RTL. |
| `arrow-up` | Physical up arrow with a shaft; does not mirror in RTL. |
| `arrow-down` | Physical down arrow with a shaft; does not mirror in RTL. |
| `arrow-left` | Physical left arrow with a shaft; does not mirror in RTL. |
| `arrow-right` | Physical right arrow with a shaft; does not mirror in RTL. |
| `expand` | Reveal additional content. |
| `collapse` | Conceal expanded content. |
| `info` | Informational message. |
| `success` | Successful outcome. |
| `warning` | Attention/caution. |
| `error` | Failed/invalid outcome. |
| `show` | Reveal content, including password visibility. |
| `hide` | Conceal content; does not mean revoke permission. |
| `create` | Bring a resource into existence; pairs with existing `delete`. May share the existing plus artwork with `add`. |
| `remove` | Remove membership, placement or association; pairs with existing `add`. Does not itself imply destruction of the resource. Prefer a minus glyph over a trash glyph. |
| `reset` | Restore an accepted baseline; distinct from `refresh`, which reloads data. |
| `clear` | Empty a value or selection; distinct from deleting a resource or dismissing a surface. |
| `retry` | Attempt a failed operation again; distinct from ordinary refresh. |
| `home` | Application or section landing destination. |
| `help` | Assistance or guidance; distinct from an informational status. |
| `bookmark` | Saved reference or saved-items destination; distinct from persisting edits with `save`. |
| `location` | A place or geographical location. |
| `globe` | Worldwide or geographical scope; does not automatically mean language selection. |
| `calendar` | Date/calendar concept. |
| `time` | Time concept; does not itself imply a loading or pending state. |
| `file` | Generic file content; the default does not replace MIME-family artwork in UiFilePreview. |
| `image` | Image content. |
| `attachment` | Attached content or its association with an owning item. |
| `email` | Email address/message content. |
| `filter` | Restrict a collection to matching items. |
| `sort` | Ordering generally, without specifying an ascending or descending direction. |
| `sort-ascending` | Ascending order under the relevant data comparator. |
| `sort-descending` | Descending order under the relevant data comparator. |
| `first` | First logical item/page; mirror directional artwork in RTL. |
| `last` | Last logical item/page; mirror directional artwork in RTL. |
| `link` | A hyperlink or reference, represented by chain links; does not imply an external destination or a new window/tab. |
| `external-link` | Destination outside the current application/site; does not imply a new window or tab. |

Distinct meanings may share artwork while retaining independent override keys. Prefer `create`/`delete` for resources and `add`/`remove` for membership; existing creation uses of `add` remain supported. Deletion may be recoverable: undoability does not distinguish it from removal. None implies a tone or business action by itself. Domain names are extensions. Loading indicators remain backend presentations rather than a required animated icon.

Verification: the gallery renders every name; catalogue assembly rejects an incomplete backend baseline. Bounded 58-name setup imports are intentional; full vendor libraries must not be imported.

`move-up` and `move-down` move an item earlier/later in a vertical ordered list. supporting backends map these independent semantic names to the same native shafted arrows as `arrow-up`/`arrow-down`, without RTL mirroring. They do not expand/collapse content.
