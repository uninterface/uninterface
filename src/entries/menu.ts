/** Host-owned elements consume these bindings without managing popup geometry. */
export interface UiMenuHostBindings {
  buttonTrigger: {
    'aria-haspopup': 'menu'
    'aria-expanded': boolean
    'aria-controls': string | undefined
    onClick(event: MouseEvent): void
  }
  contextTrigger: {
    /** Opaque backend-owned focus presentation; apply with the complete binding. */
    class?: string
    role: 'group'
    tabindex: 0
    'aria-label': string
    'aria-haspopup': 'menu'
    'aria-controls': string | undefined
    onContextmenu(event: MouseEvent): void
    onKeydown(event: KeyboardEvent): void
  }
}
