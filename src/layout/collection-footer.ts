export type FooterPart = 'info' | 'size' | 'paginator' | 'jumper'

/** Allocation only. Backends supply intrinsic asks, sequence and row alignment. */
export function allocateFooterRows(
  order: readonly FooterPart[],
  asks: Partial<Record<FooterPart, number>>,
  width: number,
  gap: number,
  wasSplit = false,
  navigationMinimum = asks.paginator ?? 0,
  wasShared = false,
): FooterPart[][] {
  const present = order.filter((part) => asks[part] !== undefined)
  if (!present.length) return []
  const demand = (parts: FooterPart[]) =>
    parts.reduce((sum, part) => sum + asks[part]!, 0) +
    Math.max(0, parts.length - 1) * gap
  // A little spare room is required before merging again, preventing rounding chatter.
  if (demand(present) + (wasSplit ? gap : 0) <= width || present.length === 1)
    return [present]
  const pack = (parts: FooterPart[]) => {
    const rows: FooterPart[][] = []
    for (const part of parts) {
      const row = rows.at(-1)
      if (!row || demand([...row, part]) > width) rows.push([part])
      else row.push(part)
    }
    return rows
  }
  // Keep the jump action immediately before navigation, together at logical end.
  // A stable minimum is independent of the page window rendered in this offer.
  if (
    present.includes('paginator') &&
    present.includes('jumper') &&
    asks.jumper! + navigationMinimum + gap + (wasShared ? 0 : gap) <= width
  ) {
    return [
      ...pack(
        present.filter((part) => part !== 'paginator' && part !== 'jumper'),
      ),
      ['jumper', 'paginator'],
    ]
  }
  const rows = pack(present.filter((part) => part !== 'paginator'))
  if (present.includes('paginator')) rows.push(['paginator'])
  return rows
}
