import type { CorePack } from '../../packs'

export default {
  uploadPending: 'Uploading',
  uploadFailed: 'Upload failed',
  uploadDeliveryFailed: 'Could not add file.',
  retryDelivery: 'Retry delivery',
  chooseFile: 'Choose file',
  clearFile: 'Clear file',
  singleFile: 'Choose exactly one file.',
  fileRejected: 'File could not be selected.',
  cancelUpload: 'Cancel upload',
  removeFile: 'Remove file',
} satisfies CorePack<'files'>
