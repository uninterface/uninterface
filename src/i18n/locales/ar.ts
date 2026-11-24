import type { UiMessages } from '../messages'
import common from './common/ar'
import floating from './floating/ar'
import entries from './entries/ar'
import password from './password/ar'
import feedback from './feedback/ar'
import numbers from './numbers/ar'
import collections from './collections/ar'
import temporal from './temporal/ar'
import files from './files/ar'

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
