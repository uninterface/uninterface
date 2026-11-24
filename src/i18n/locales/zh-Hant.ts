import type { UiMessages } from '../messages'
import common from './common/zh-Hant'
import floating from './floating/zh-Hant'
import entries from './entries/zh-Hant'
import password from './password/zh-Hant'
import feedback from './feedback/zh-Hant'
import numbers from './numbers/zh-Hant'
import collections from './collections/zh-Hant'
import temporal from './temporal/zh-Hant'
import files from './files/zh-Hant'

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
