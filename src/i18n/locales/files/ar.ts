import type { CorePack } from '../../packs'

export default {
  uploadPending: 'جارٍ الرفع',
  uploadFailed: 'فشل الرفع',
  uploadDeliveryFailed: 'تعذر إضافة الملف المرفوع.',
  retryDelivery: 'إعادة محاولة التسليم',
  chooseFile: 'اختيار ملف',
  clearFile: 'مسح الملف',
  singleFile: 'اختر ملفًا واحدًا فقط.',
  fileRejected: 'تعذر اختيار الملف.',
  cancelUpload: 'إلغاء الرفع',
  removeFile: 'إزالة الملف',
} satisfies CorePack<'files'>
