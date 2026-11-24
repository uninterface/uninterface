import { onScopeDispose } from 'vue'

/** Temporary programmatic focusability, restored on blur or disposal. */
export function useUiFallbackFocus() {
  const releases = new Set<() => void>()
  onScopeDispose(() => {
    for (const release of releases) release()
  })
  return (element: HTMLElement) => {
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1')
      const release = () => {
        element.removeEventListener('blur', release)
        element.removeAttribute('tabindex')
        releases.delete(release)
      }
      releases.add(release)
      element.addEventListener('blur', release)
      element.focus()
      if (element.ownerDocument.activeElement !== element) release()
    } else element.focus()
    return element.ownerDocument.activeElement === element
  }
}

/** Optional recovery mechanics; adapters supply their actual native form root. */
export function useUiFormFocus(root: () => HTMLElement | undefined) {
  const fallback = useUiFallbackFocus()
  const usable = (element: HTMLElement) =>
    !element.matches(':disabled') &&
    !element.closest(
      '[aria-disabled="true"], [aria-hidden="true"], [hidden], [inert]',
    )
  return () => {
    const form = root()
    if (!form) return
    const invalid = Array.from(
      form.querySelectorAll<HTMLElement>('[aria-invalid="true"]'),
    ).find(usable)
    if (invalid) {
      const frame = invalid.matches('[data-ui-input-frame]')
        ? invalid
        : invalid.querySelector<HTMLElement>('[data-ui-input-frame]')
      if (frame && usable(frame)) {
        frame.focus()
        if (form.ownerDocument.activeElement === frame) return
      }
      const choices = Array.from(
        invalid.querySelectorAll<HTMLElement>(
          'input[type="radio"], [role="radio"], input[type="checkbox"], [role="checkbox"]',
        ),
      ).filter(usable)
      const choice =
        choices.find((element) =>
          element.matches(
            'input[type="radio"]:checked, [role="radio"][aria-checked="true"]',
          ),
        ) ?? choices[0]
      if (choice) {
        choice.focus()
        if (form.ownerDocument.activeElement === choice) return
      }
      // Source/status groups without usable choices remain named recovery targets.
      const group = invalid.matches('[data-uninterface-choice-group]')
        ? invalid
        : invalid.querySelector<HTMLElement>('[data-uninterface-choice-group]')
      if (group && usable(group) && fallback(group)) return
      invalid.focus()
      if (form.ownerDocument.activeElement === invalid) return
      const editor = Array.from(
        invalid.querySelectorAll<HTMLElement>(
          'input, select, textarea, button, [tabindex]',
        ),
      ).find(usable)
      if (editor) {
        editor.focus()
        if (form.ownerDocument.activeElement === editor) return
      }
      if (fallback(invalid)) return
    }
    fallback(form)
  }
}
