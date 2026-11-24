import type { CorePack } from '../../packs'

export default {
  temporalDate: 'أدخل تاريخًا صحيحًا وكاملًا.',
  temporalTime: 'أدخل وقتًا صحيحًا وكاملًا.',
  temporalDateTime: 'أدخل تاريخًا ووقتًا صحيحين وكاملين.',
  temporalPrecision: 'يتجاوز الوقت المُدخل الدقة المحددة.',
  temporalGap:
    'هذا التاريخ والوقت المحليان غير موجودين في المنطقة الزمنية المحددة.',
  temporalOverlap:
    'هذا التاريخ والوقت المحليان يحتملان أكثر من تفسير في المنطقة الزمنية المحددة.',
  temporalStart: 'يجب تحديد حد البداية.',
  temporalEnd: 'يجب تحديد حد النهاية.',
  temporalBoundary: 'أكمل الحد أو اجعله مفتوحًا بشكل صريح.',
  temporalUnrestricted: 'لا يُسمح بنطاق غير محدود.',
  temporalDateOrder: 'يجب أن يوافق تاريخ النهاية تاريخ البداية أو يأتي بعده.',
  temporalOrder: 'يجب أن تأتي النهاية بعد البداية؛ حد النهاية غير مشمول.',
  temporalUnavailable: 'هذه القيمة أو الفترة غير متاحة.',
  temporalInvalid: 'قيمة التاريخ أو الوقت أو إعداد المنطقة الزمنية غير صالح.',
  pickDate: 'اختيار التاريخ',
  pickTime: 'اختيار الوقت',
  pickDateTime: 'اختيار التاريخ والوقت',
  rangeStart: 'البداية',
  rangeDateEnd: 'النهاية (مشمولة)',
  rangeEnd: 'النهاية (غير مشمولة)',
  rangeMode: 'حدود النطاق',
  rangeBounded: 'تحديد الحدين',
  rangeStartOnly: 'البداية فقط',
  rangeEndOnly: 'النهاية فقط',
  rangeUnrestricted: 'بلا حدود',
  rangeNextDay: 'اليوم التالي',
  temporalDuration: 'يجب أن تتجاوز الفترة الزمنية الصفر وألا تتجاوز 24 ساعة.',
  openBoundary: 'حد مفتوح',
} satisfies CorePack<'temporal'>
