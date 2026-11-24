import type { CorePack } from '../../packs'

export default {
  uploadPending: '正在上傳',
  uploadFailed: '上傳失敗',
  uploadDeliveryFailed: '無法接收已上傳的檔案。',
  retryDelivery: '重試接收',
  chooseFile: '選擇檔案',
  clearFile: '清除檔案',
  singleFile: '請選擇一個檔案。',
  fileRejected: '無法選擇檔案。',
  cancelUpload: '取消上傳',
  removeFile: '移除檔案',
} satisfies CorePack<'files'>
