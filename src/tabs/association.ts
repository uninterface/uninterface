import {
  shallowRef,
  watch,
  onMounted,
  onBeforeUnmount,
  type ShallowRef,
} from 'vue'
import type { UiTabsBinding } from '../bindings/tabs'
interface Declaration {
  key: string
  disabled: boolean
}
interface Association {
  revision: ShallowRef<number>
  version: number
  bar?: object
  items: readonly Declaration[]
  panels: Map<string, object>
}
const associations = new WeakMap<UiTabsBinding, Association>()
export function assertTabKey(key: string) {
  if (typeof key !== 'string' || !key.trim())
    throw new Error('Tab keys must be nonempty strings.')
}
export function tabAssociation(binding: UiTabsBinding) {
  if (
    !binding ||
    binding.target !== 'tabs' ||
    typeof binding.id !== 'string' ||
    !binding.id.trim() ||
    typeof binding.selectedKey !== 'string' ||
    typeof binding.disabled !== 'boolean' ||
    typeof binding.requestSelected !== 'function'
  )
    throw new Error('UiTabs requires a compatible tabs binding.')
  let association = associations.get(binding)
  if (!association) {
    association = {
      items: [],
      panels: new Map(),
      revision: shallowRef(0),
      version: 0,
    }
    associations.set(binding, association)
  }
  return association
}
export function tabIdentity(binding: UiTabsBinding, key: string) {
  const encode = (text: string) =>
    Array.from(text, (character) =>
      character.codePointAt(0)!.toString(16),
    ).join('-')
  const id = `ui-tabs-${encode(binding.id)}-${encode(key)}`
  return { tabId: `${id}-tab`, panelId: `${id}-panel` }
}
export function declareTabs(
  binding: UiTabsBinding,
  owner: object,
  items: readonly Declaration[],
) {
  const association = tabAssociation(binding)
  if (association.bar && association.bar !== owner)
    throw new Error('A tabs binding supports one mounted UiTabs bar.')
  const keys = new Set<string>()
  for (const item of items) {
    assertTabKey(item.key)
    if (keys.has(item.key)) throw new Error('UiTabs requires unique values.')
    keys.add(item.key)
  }
  if (!keys.has(binding.selectedKey))
    throw new Error(
      'UiTabs selection must identify an existing tab. Update selection and declarations together.',
    )
  const changed =
    association.bar !== owner ||
    association.items.length !== items.length ||
    association.items.some((item, index) => item.key !== items[index]?.key)
  association.bar = owner
  association.items = items
  if (changed) association.revision.value = ++association.version
}
export function releaseTabs(binding: UiTabsBinding, owner: object) {
  const association = tabAssociation(binding)
  if (association.bar === owner) {
    association.bar = undefined
    association.items = []
    association.revision.value = ++association.version
  }
}
export function attachTabPanel(
  binding: UiTabsBinding,
  key: string,
  owner: object,
) {
  assertTabKey(key)
  const association = tabAssociation(binding)
  if (association.panels.has(key))
    throw new Error(`Duplicate UiTabPanel value: ${key}`)
  association.panels.set(key, owner)
  association.revision.value = ++association.version
  return () => {
    if (association.panels.get(key) === owner) {
      association.panels.delete(key)
      association.revision.value = ++association.version
    }
  }
}
export function verifyTabAssociations(binding: UiTabsBinding) {
  const association = tabAssociation(binding)
  if (!association.bar)
    throw new Error('UiTabPanel requires its associated UiTabs bar.')
  const keys = new Set(association.items.map((item) => item.key))
  for (const key of keys)
    if (!association.panels.has(key))
      throw new Error(`Missing UiTabPanel for tab: ${key}`)
  for (const key of association.panels.keys())
    if (!keys.has(key))
      throw new Error(`UiTabPanel has no corresponding tab: ${key}`)
}

/** Check after a complete Vue update, including independently mounted/removed peers. */
export function useTabAssociationCheck(binding: UiTabsBinding) {
  const association = tabAssociation(binding)
  let active = false
  onMounted(() => {
    active = true
    verifyTabAssociations(binding)
  })
  onBeforeUnmount(() => {
    active = false
  })
  watch(
    association.revision,
    () => {
      if (active) verifyTabAssociations(binding)
    },
    { flush: 'post' },
  )
}
