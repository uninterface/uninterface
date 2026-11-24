/** Apply consumer attributes and Vue listeners to a toolkit's native target. */
type Listener = {
  event: string
  options: AddEventListenerOptions
  value: unknown
  invoke: EventListener
}
const previous = new WeakMap<
  Element,
  { names: Set<string>; listeners: Map<string, Listener> }
>()

export function syncUiTargetAttributes(
  target: Element,
  attributes: Record<string, unknown>,
) {
  const old = previous.get(target)
  for (const name of old?.names ?? [])
    if (!(name in attributes)) target.removeAttribute(name)
  const names = new Set<string>()
  const listeners = old?.listeners ?? new Map<string, Listener>()
  for (const [name, listener] of listeners) {
    if (attributes[name] != null) continue
    target.removeEventListener(
      listener.event,
      listener.invoke,
      listener.options,
    )
    listeners.delete(name)
  }
  for (const [name, value] of Object.entries(attributes)) {
    // Class/style describe the toolkit surface and are applied by the view.
    if (['class', 'style', 'value', 'checked'].includes(name)) continue
    if (/^on[^a-z]/.test(name)) {
      if (value == null) continue
      const existing = listeners.get(name)
      if (existing) {
        // Keep the invoker so updates do not re-arm an already fired once listener.
        existing.value = value
        continue
      }
      let event = name.slice(2)
      const options: AddEventListenerOptions = {}
      let match: RegExpMatchArray | null
      while ((match = event.match(/(Once|Passive|Capture)$/))) {
        options[match[1].toLowerCase() as 'once' | 'passive' | 'capture'] = true
        event = event.slice(0, -match[1].length)
      }
      event = event.startsWith(':')
        ? event.slice(1)
        : event.replace(/\B([A-Z])/g, '-$1').toLowerCase()
      const listener: Listener = {
        event,
        options,
        value,
        invoke(event) {
          const handlers = Array.isArray(listener.value)
            ? listener.value
            : [listener.value]
          let stopped = false
          const original = event.stopImmediatePropagation
          event.stopImmediatePropagation = function () {
            stopped = true
            original.call(this)
          }
          try {
            for (const handler of handlers) {
              if (stopped) break
              if (typeof handler === 'function') handler(event)
            }
          } finally {
            event.stopImmediatePropagation = original
          }
        },
      }
      target.addEventListener(event, listener.invoke, options)
      listeners.set(name, listener)
      continue
    }
    names.add(name)
    if (value === undefined || value === null || value === false)
      target.removeAttribute(name)
    else target.setAttribute(name, String(value))
  }
  previous.set(target, { names, listeners })
}
