import { watch } from 'vue'
import type { UiI18nControl } from '../i18n/types'
import { createCleanup, reportCleanupErrors } from './lifetime'

const ownerKey = Symbol.for('uninterface.document-language-owner')
type OwnedDocument = Document & { [ownerKey]?: object }

export function ownDocumentLanguage(document: OwnedDocument) {
  if (document[ownerKey])
    throw new Error(
      'Uninterface: this document already has a language owner. Embedded applications must omit document ownership.',
    )
  const lease = {}
  const element = document.documentElement
  const original = {
    lang: element.getAttribute('lang'),
    dir: element.getAttribute('dir'),
  }
  document[ownerKey] = lease
  const cleanup = createCleanup()
  cleanup.add(() => {
    if (document[ownerKey] === lease) delete document[ownerKey]
  })
  for (const key of ['lang', 'dir'] as const)
    cleanup.add(() => {
      if (document[ownerKey] !== lease) return
      if (original[key] === null) element.removeAttribute(key)
      else element.setAttribute(key, original[key])
    })
  return {
    connect(i18n: UiI18nControl) {
      cleanup.add(
        watch(
          i18n.state,
          (state) => {
            element.lang = state.locale
            element.dir = state.direction
          },
          { immediate: true, flush: 'sync' },
        ),
      )
    },
    dispose() {
      reportCleanupErrors(cleanup.release())
    },
  }
}
