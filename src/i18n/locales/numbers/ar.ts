import type { CorePack } from '../../packs'

export default {
  numberEmpty: 'أدخل رقمًا.',
  numberInvalid: 'أدخل رقمًا صالحًا ومكتملًا.',
  numberPrecision: 'يحتوي الرقم على منازل عشرية أكثر من المسموح.',
  numberRange: 'لا يمكن تمثيل الرقم بهذه الدقة.',
  numberNegative: 'أدخل صفرًا أو رقمًا موجبًا.',
  numberMinimum: 'الرقم أقل من الحد الأدنى.',
  numberMaximum: 'الرقم أكبر من الحد الأقصى.',
} satisfies CorePack<'numbers'>
