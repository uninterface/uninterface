import { readFile } from 'node:fs/promises'
import { compileTemplate } from 'vue/compiler-sfc'

/** Compile explicitly imported SVG assets into inline Vue icon components. */
export function createUiIconLoader() {
  return {
    name: 'uninterface-svg-icons',
    enforce: 'pre',
    async load(id, options) {
      const separator = id.indexOf('?')
      if (separator === -1) return
      const filename = id.slice(0, separator)
      const query = new URLSearchParams(id.slice(separator + 1))
      if (!filename.endsWith('.svg') || !query.has('ui-icon')) return
      if (query.has('raw') || query.has('url'))
        throw new Error(
          'SVG icon imports cannot also request raw text or a URL.',
        )

      this.addWatchFile(filename)
      const source = (await readFile(filename, 'utf8')).replace(
        /^\s*<\?xml\s[^?]*\?>/,
        '',
      )
      const ssr = options?.ssr === true
      const compiled = compileTemplate({
        source,
        filename,
        id: filename,
        ssr,
        ssrCssVars: [],
        transformAssetUrls: false,
        compilerOptions: {
          nodeTransforms: [
            (node) => {
              if (node.type === 0) {
                const roots = node.children.filter(
                  (child) =>
                    child.type !== 3 &&
                    !(child.type === 2 && !child.content.trim()),
                )
                if (roots.length !== 1 || roots[0].tag !== 'svg')
                  throw new Error('SVG icons must have exactly one svg root.')
                // Inspect source nodes before SSR adds its own attribute binding.
                const visit = (child) => {
                  if (
                    child.type === 5 ||
                    (child.type === 1 &&
                      child.props.some((prop) => prop.type === 7))
                  )
                    throw new Error(
                      'SVG icons must use static markup without Vue expressions or directives.',
                    )
                  child.children?.forEach(visit)
                }
                roots.forEach(visit)
              }
            },
          ],
        },
      })
      if (compiled.errors.length)
        throw new Error(
          `Invalid SVG icon ${filename}: ${compiled.errors
            .map((error) => (typeof error === 'string' ? error : error.message))
            .join('; ')}`,
        )
      const render = ssr ? 'ssrRender' : 'render'
      return {
        code: `${compiled.code}\nexport default { ${render} };\n`,
        map: compiled.map,
      }
    },
  }
}
