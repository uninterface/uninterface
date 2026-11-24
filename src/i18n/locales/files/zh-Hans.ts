import type { CorePack } from '../../packs'

export default {
  uploadPending: '正在上传',
  uploadFailed: '上传失败',
  uploadDeliveryFailed: '无法接收已上传的文件。',
  retryDelivery: '重试接收',
  chooseFile: '选择文件',
  clearFile: '清除文件',
  singleFile: '请选择一个文件。',
  fileRejected: '无法选择文件。',
  cancelUpload: '取消上传',
  removeFile: '移除文件',
} satisfies CorePack<'files'>
