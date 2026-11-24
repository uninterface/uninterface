/** A shortcut is an exact modifier combination and one KeyboardEvent.key. */
export function passwordShortcut(value: string | null | undefined) {
  if (value == null) return undefined
  const parts = value.split('+').map((part) => part.trim().toLowerCase())
  const key = parts.pop()
  const modifiers = new Set(parts)
  if (
    !key ||
    modifiers.size !== parts.length ||
    parts.some(
      (part) => !['alt', 'control', 'ctrl', 'shift', 'meta'].includes(part),
    ) ||
    (modifiers.has('control') && modifiers.has('ctrl'))
  )
    throw new Error(
      'password-reveal-shortcut requires modifiers plus one key, for example Alt+F8.',
    )
  return (event: KeyboardEvent) =>
    !event.isComposing &&
    !event.repeat &&
    event.key.toLowerCase() === key &&
    event.altKey === modifiers.has('alt') &&
    event.ctrlKey === (modifiers.has('ctrl') || modifiers.has('control')) &&
    event.shiftKey === modifiers.has('shift') &&
    event.metaKey === modifiers.has('meta')
}
