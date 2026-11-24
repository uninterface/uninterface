import type { UiLocaleSource } from './types'
export function canonicalLocale(value: string): string {
  const result = Intl.getCanonicalLocales(value.replaceAll('_', '-'))[0]
  if (!result) throw new Error('A nonempty locale is required.')
  return result
}
export function resolveLocale<T>(
  requested: string,
  source: UiLocaleSource<T>,
  fallback: string | false,
): string {
  const available = new Map(
    Object.keys(source.resources).map((key) => [canonicalLocale(key), key]),
  )
  const aliases = new Map(
    Object.entries(source.aliases ?? {}).map(([key, value]) => [
      canonicalLocale(key),
      typeof value === 'string' ? [value] : value,
    ]),
  )
  const seen = new Set<string>()
  function visit(tag: string): string | undefined {
    tag = canonicalLocale(tag)
    if (seen.has(tag)) return
    seen.add(tag)
    if (available.has(tag)) return available.get(tag)
    for (const candidate of aliases.get(tag) ?? []) {
      const match = visit(candidate)
      if (match) return match
    }
    const locale = new Intl.Locale(tag)
    // CLDR likely subtags preserve a region's script when no script was written.
    const script = locale.script ?? locale.maximize().script
    const scriptTag = script ? `${locale.language}-${script}` : undefined
    if (scriptTag && scriptTag !== tag) {
      const match = visit(scriptTag)
      if (match) return match
    }
    // Never fall from an explicit/likely script to a conflicting language default.
    const defaultScript = new Intl.Locale(locale.language).maximize().script
    if (locale.language !== tag && (!script || script === defaultScript))
      return visit(locale.language)
  }
  const match = visit(requested) ?? (fallback ? visit(fallback) : undefined)
  if (!match) throw new Error(`No locale resource satisfies ${requested}.`)
  return match
}
export function localeDirection(tag: string): 'ltr' | 'rtl' {
  const script = new Intl.Locale(tag).maximize().script
  return ['Arab', 'Hebr', 'Thaa', 'Nkoo', 'Adlm', 'Rohg', 'Syrc'].includes(
    script ?? '',
  )
    ? 'rtl'
    : 'ltr'
}
