import { toRaw } from 'vue'

/** Immutable browser files/blobs can be shared; mutable records and dates are copied. */
export function copy<T>(value: T): T {
  const seen = new WeakMap<object, any>()
  function clone(input: any): any {
    const value = toRaw(input)
    if (value === null || typeof value !== 'object') return value
    if (seen.has(value)) return seen.get(value)
    if (typeof Blob !== 'undefined' && value instanceof Blob) return value
    if (value instanceof Date) return new Date(value.getTime())
    if (value instanceof URL) return new URL(value.href)
    if (Array.isArray(value)) {
      const result: any[] = []
      seen.set(value, result)
      for (const item of value) result.push(clone(item))
      return result
    }
    if (
      Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null
    ) {
      const result = Object.create(Object.getPrototypeOf(value))
      seen.set(value, result)
      for (const key of Object.keys(value)) result[key] = clone(value[key])
      return result
    }
    return structuredClone(value)
  }
  return clone(value)
}
/** Draft equality only; never used to skip validation, revisions or notifications. */
export function uiDefaultInputEquals(left: unknown, right: unknown): boolean {
  const seen = new WeakMap<object, object>()
  function equal(a: any, b: any): boolean {
    a = toRaw(a)
    b = toRaw(b)
    if (Object.is(a, b)) return true
    if (
      a === null ||
      b === null ||
      typeof a !== 'object' ||
      typeof b !== 'object'
    )
      return false
    if (seen.has(a)) return seen.get(a) === b
    if (a instanceof Date || b instanceof Date)
      return (
        a instanceof Date &&
        b instanceof Date &&
        Object.is(a.getTime(), b.getTime())
      )
    if (a instanceof URL || b instanceof URL)
      return a instanceof URL && b instanceof URL && a.href === b.href
    if (typeof Blob !== 'undefined' && (a instanceof Blob || b instanceof Blob))
      return (
        a instanceof Blob &&
        b instanceof Blob &&
        ['name', 'size', 'type', 'lastModified', 'webkitRelativePath'].every(
          (key) => (a as any)[key] === (b as any)[key],
        )
      )
    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length)
        return false
      seen.set(a, b)
      return a.every((value, index) => equal(value, b[index]))
    }
    if (
      ![Object.prototype, null].includes(Object.getPrototypeOf(a)) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(b))
    )
      return false
    const keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) return false
    seen.set(a, b)
    return keys.every((key) => Object.hasOwn(b, key) && equal(a[key], b[key]))
  }
  return equal(left, right)
}
