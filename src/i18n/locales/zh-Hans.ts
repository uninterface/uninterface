import type { UiMessages } from '../messages'
import common from './common/zh-Hans'
import floating from './floating/zh-Hans'
import entries from './entries/zh-Hans'
import password from './password/zh-Hans'
import feedback from './feedback/zh-Hans'
import numbers from './numbers/zh-Hans'
import collections from './collections/zh-Hans'
import temporal from './temporal/zh-Hans'
import files from './files/zh-Hans'

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
