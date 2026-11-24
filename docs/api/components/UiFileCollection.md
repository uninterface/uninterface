# UiFileCollection

Existing file collection presentation. Import from `@uninterface/uninterface` in an application initialized by createUiApplication.

## API

Required `files: readonly UiFileDescriptor[]`. `removable?: boolean` and `disabled?: boolean` default false. Default item slot receives `{ file }`, falling back to UiFilePreview. Emits remove(file) and update:files(next array); v-model:files commits accepted removal. Keys must be unique.

```vue
<UiFileCollection v-model:files="attachments" removable />
```

## Ownership and implementation

The application owns collection membership, ordering and remote deletion. A removal request does not delete a server resource. Backends present collection items and named remove controls, preserving descriptor identity.

See the [existing file collection presentation guide](../../guides/files.md) for setup and composition.

## Observable verification

Verify removing one key retains all others, disabled removal is blocked, and duplicate keys fail.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
