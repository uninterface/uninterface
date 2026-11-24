# UiUploadRegionProps

Region inputs. progress defaults to upload support; preview defaults to retained role; actions defaults to supported actions. False suppresses the activity indicator/preview without changing occupancy; transfer feedback and selected recovery actions remain. extent defaults to regular. No content slots or competing file model. Import from `@uninterface/uninterface`.

## API

```ts
export interface UiUploadRegionProps {
  binding: UiUploadRegionBinding
  accept?: string
  capture?: 'user' | 'environment'
  disabled?: boolean
  readonly?: boolean
  extent?: 'compact' | 'regular' | 'large' | 'fill'
  // Omission selects the role defaults described below.
  progress?: boolean
  preview?: boolean
  previewAlt?: string
  // A selection set, not action order or placement. Omission includes supported actions.
  actions?: readonly UiUploadRegionAction[]
}
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Exercise retained and service acquisition, validation/reset races, cancellation/retry, delivery failure and view unmount. Verify hidden progress/preview leaves acquisition locks intact, and disposal cannot publish a late result.
