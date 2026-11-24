// Documents coordinate independently loaded applications, not user state.
const identityKey = Symbol.for('uninterface.document-identities')
type IdentityDocument = Document & {
  [identityKey]?: { next: number; owners: Map<string, object> }
}
let unmountedClientId = 0

function identities(document: IdentityDocument) {
  return (document[identityKey] ??= { next: 0, owners: new Map() })
}

export function assertIdPrefix(prefix: string) {
  if (typeof prefix !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(prefix))
    throw new Error(
      'Uninterface: idPrefix must start with a letter and contain only letters, digits, hyphens or underscores.',
    )
}

export function applicationIdPrefix(prefix: string | undefined, ssr = false) {
  if (prefix !== undefined) {
    assertIdPrefix(prefix)
    return prefix
  }
  if (ssr)
    throw new Error(
      'Uninterface: SSR/hydration requires an explicit idPrefix, identical on the server and client and unique within the document.',
    )
  const document = globalThis.document
  const sequence = document ? ++identities(document).next : ++unmountedClientId
  return `uninterface-${sequence}`
}

export function claimApplicationIdentity(
  document: Document,
  prefix: string,
  automatic = false,
) {
  assertIdPrefix(prefix)
  const registry = identities(document)
  const owners = registry.owners
  if (automatic)
    while (owners.has(prefix)) prefix = `uninterface-${++registry.next}`
  if (owners.has(prefix))
    throw new Error(
      `Uninterface: idPrefix "${prefix}" is already mounted in this document.`,
    )
  const lease = {}
  owners.set(prefix, lease)
  return {
    prefix,
    release() {
      if (owners.get(prefix) === lease) owners.delete(prefix)
    },
  }
}
