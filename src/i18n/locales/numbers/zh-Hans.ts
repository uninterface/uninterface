import type { CorePack } from '../../packs'

export default {
  numberEmpty: '请输入数字。',
  numberInvalid: '请输入有效且完整的数字。',
  numberPrecision: '小数位数过多。',
  numberRange: '此数字无法以当前精度表示。',
  numberNegative: '请输入零或正数。',
  numberMinimum: '此数字低于最小值。',
  numberMaximum: '此数字高于最大值。',
} satisfies CorePack<'numbers'>
