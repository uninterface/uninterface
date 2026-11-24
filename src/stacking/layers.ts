import type { ZDomain } from './domain'
import {
  UiZOrderError,
  type UiZHandle,
  type UiZOrder,
  type ZRegistration,
} from './model'

/** Layer definitions are domain-owned and shared by every surface. */
export function createZLayers(domain: ZDomain) {
  const definitions = new Map<
    string,
    { above: readonly string[]; below: readonly string[] }
  >([
    ['background', { above: [], below: [] }],
    ['content', { above: ['background'], below: [] }],
    ['floating', { above: ['content'], below: [] }],
  ])
  const surfaces = new Map<UiZHandle, Map<string, UiZHandle>>()
  function records(
    surface: UiZHandle,
    handles: Map<string, UiZHandle>,
    defs = definitions,
  ): ZRegistration[] {
    return [...defs].map(([name, relation]) => ({
      handle: handles.get(name)!,
      band: 'layer',
      parent: surface,
      source: `layer:${name}`,
      order: {
        above: relation.above.map((n) => handles.get(n)!),
        below: relation.below.map((n) => handles.get(n)!),
      },
    }))
  }
  return {
    open(label: string, order?: UiZOrder) {
      if ((order?.band && order.band !== 'surface') || order?.parent)
        throw new UiZOrderError(
          'scope',
          'surfaces are peers at the domain root.',
          [label],
        )
      const surface = domain.handle(label)
      const handles = new Map(
        [...definitions.keys()].map((name) => [
          name,
          domain.handle(`${label}:${name}`),
        ]),
      )
      domain.transact({
        put: [
          { handle: surface, band: 'surface', source: label, order },
          ...records(surface, handles),
        ],
      })
      surfaces.set(surface, handles)
      return surface
    },
    layer(surface: UiZHandle, name: string) {
      const handle = surfaces.get(surface)?.get(name)
      if (!handle || !domain.describe(handle))
        throw new UiZOrderError('scope', `unavailable layer ${name}.`, [
          surface.label,
        ])
      return handle
    },
    close(surface: UiZHandle) {
      domain.transact({ remove: [surface] })
      surfaces.delete(surface)
    },
    register(
      name: string,
      relation: { above?: readonly string[]; below?: readonly string[] },
    ) {
      if (!name.trim() || definitions.has(name))
        throw new UiZOrderError(
          'declaration',
          'layer names must be nonempty and unique.',
          [name],
        )
      const refs = [...(relation.above ?? []), ...(relation.below ?? [])]
      if (!refs.length || refs.some((n) => !definitions.has(n)))
        throw new UiZOrderError(
          'declaration',
          'layer extensions require known relative anchors.',
          [name],
        )
      const next = new Map(definitions)
      next.set(name, {
        above: [...(relation.above ?? [])],
        below: [...(relation.below ?? [])],
      })
      // Validate even when no surface is open: cyclic policy cannot be installed dormant.
      const visiting = new Set<string>(),
        visited = new Set<string>()
      const edges = new Map([...next.keys()].map((n) => [n, new Set<string>()]))
      for (const [n, r] of next) {
        for (const a of r.above) edges.get(a)!.add(n)
        for (const b of r.below) edges.get(n)!.add(b)
      }
      const visit = (n: string) => {
        if (visiting.has(n))
          throw new UiZOrderError(
            'cycle',
            'layer policy contradicts the built-in order.',
            [name],
          )
        if (visited.has(n)) return
        visiting.add(n)
        for (const e of edges.get(n)!) visit(e)
        visiting.delete(n)
        visited.add(n)
      }
      for (const n of next.keys()) visit(n)
      const updated = new Map<UiZHandle, Map<string, UiZHandle>>()
      for (const [surface, handles] of surfaces)
        if (domain.describe(surface))
          updated.set(
            surface,
            new Map([
              ...handles,
              [name, domain.handle(`${surface.label}:${name}`)],
            ]),
          )
      domain.transact({
        put: [...updated].flatMap(([surface, handles]) =>
          records(surface, handles, next),
        ),
      })
      definitions.set(name, next.get(name)!)
      for (const [surface, handles] of updated) surfaces.set(surface, handles)
      // Definitions have application lifetime; no disposal while surfaces reference their identity.
    },
  }
}
