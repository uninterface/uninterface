/** Run every release once, in reverse acquisition order, even after a failure. */
export function createCleanup() {
  const releases: (() => void)[] = []
  let disposed = false
  return {
    add(release: () => void) {
      releases.push(release)
    },
    get disposed() {
      return disposed
    },
    release(): unknown[] {
      if (disposed) return []
      disposed = true
      const errors: unknown[] = []
      for (const release of releases.reverse()) {
        try {
          release()
        } catch (error) {
          errors.push(error)
        }
      }
      releases.length = 0
      return errors
    },
  }
}

export function reportCleanupErrors(errors: unknown[]) {
  if (errors.length === 1) throw errors[0]
  if (errors.length)
    throw new AggregateError(errors, 'Uninterface: application cleanup failed.')
}
