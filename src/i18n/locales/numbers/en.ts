import type { CorePack } from '../../packs'

export default {
  numberEmpty: 'Enter a number.',
  numberInvalid: 'Enter a valid, complete number.',
  numberPrecision: 'The number has too many decimal places.',
  numberRange: 'The number cannot be represented at this precision.',
  numberNegative: 'Enter zero or a positive number.',
  numberMinimum: 'The number is below the minimum.',
  numberMaximum: 'The number is above the maximum.',
} satisfies CorePack<'numbers'>
