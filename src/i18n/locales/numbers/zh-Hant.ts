import type { CorePack } from '../../packs'

export default {
  numberEmpty: '請輸入數字。',
  numberInvalid: '請輸入有效且完整的數字。',
  numberPrecision: '小數位數過多。',
  numberRange: '此數字無法以目前的精確度表示。',
  numberNegative: '請輸入零或正數。',
  numberMinimum: '此數字低於最小值。',
  numberMaximum: '此數字高於最大值。',
} satisfies CorePack<'numbers'>
