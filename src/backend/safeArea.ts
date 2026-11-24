/** Resolve platform safe-area lengths through CSS without adding visible content. */
export function readSafeArea(doc: Document) {
  const probe = doc.createElement('div')
  Object.assign(probe.style, {
    position: 'fixed',
    visibility: 'hidden',
    pointerEvents: 'none',
    width: '0',
    height: '0',
    left: '0',
    top: '0',
    paddingTop: 'env(safe-area-inset-top, 0px)',
    paddingRight: 'env(safe-area-inset-right, 0px)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    paddingLeft: 'env(safe-area-inset-left, 0px)',
  })
  probe.setAttribute('aria-hidden', 'true')
  doc.body.append(probe)
  const style = doc.defaultView!.getComputedStyle(probe)
  const result = {
    top: parseFloat(style.paddingTop) || 0,
    right: parseFloat(style.paddingRight) || 0,
    bottom: parseFloat(style.paddingBottom) || 0,
    left: parseFloat(style.paddingLeft) || 0,
  }
  probe.remove()
  return result
}
