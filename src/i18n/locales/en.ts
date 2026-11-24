import type { UiMessages } from '../messages'
import common from './common/en'
import floating from './floating/en'
import entries from './entries/en'
import password from './password/en'
import feedback from './feedback/en'
import numbers from './numbers/en'
import collections from './collections/en'
import temporal from './temporal/en'
import files from './files/en'

export default {
  ...common,
  ...floating,
  ...entries,
  ...password,
  ...feedback,
  ...numbers,
  ...collections,
  ...temporal,
  ...files,
} satisfies UiMessages
