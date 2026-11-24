import {
  Comment,
  Fragment,
  Text,
  Static,
  cloneVNode,
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  isVNode,
  onActivated,
  onDeactivated,
  onMounted,
  onScopeDispose,
  provide,
  toRaw,
  useId,
  watch,
  type ComputedRef,
  type InjectionKey,
  type PropType,
  type VNode,
} from 'vue'
import { fieldKey, type FieldContext } from '../controls/context'
import {
  useUiControlFrameParticipant,
  isolateControlFrame,
  type UiControlFrameBinding,
} from '../backend/controlFrame'
import type { UiControlViewBinding, UiFocusHandle } from '../backend'
import { inputProjectionData, type UiInputProjection } from './projection'

export interface UiInputFrameContract {
  readonly protocol: 'uninterface.input-frame'
  readonly version: 1
  readonly role: 'editor' | 'action' | 'content' | 'composition'
  readonly forwards: boolean
}
export function defineUiInputFrameContract(
  options: Pick<UiInputFrameContract, 'role'> & { forwards?: boolean },
): UiInputFrameContract {
  if (!['editor', 'action', 'content', 'composition'].includes(options.role))
    throw new Error('Unsupported input-frame participation role.')
  return Object.freeze({
    protocol: 'uninterface.input-frame',
    version: 1,
    role: options.role,
    forwards: options.forwards ?? false,
  })
}

declare module 'vue' {
  interface ComponentCustomOptions {
    uiInputFrame?: UiInputFrameContract
  }
}

export interface UiInputFrameParticipantOptions {
  projection?: () => UiInputProjection | undefined
  disabled?: () => boolean
  readonly?: () => boolean
  focus?: UiFocusHandle['focus']
}
export interface UiInputFrameParticipation {
  readonly binding: ComputedRef<UiControlViewBinding>
  readonly descriptionBinding: ComputedRef<UiControlViewBinding>
  readonly readonly: ComputedRef<boolean>
  readonly frame: UiControlFrameBinding
  readonly label: ComputedRef<string>
  /** Editor roles only; read the selected string draft. */
  readonly value: ComputedRef<string>
  update(value: string): Promise<void>
  setEngaged(value: boolean): void
}
export interface InputFrameOwner {
  field: ComputedRef<FieldContext>
  bind(disabled?: boolean): UiControlViewBinding
  disabled: ComputedRef<boolean>
  readonly: ComputedRef<boolean>
  targets: Map<string, object>
}
const boundaryKey: InjectionKey<boolean> = Symbol('ui.input-frame.boundary')
interface Admission {
  gate: ReturnType<typeof getCurrentInstance>
  owner: InputFrameOwner
  contract: UiInputFrameContract
}
const admissionKey: InjectionKey<Admission> = Symbol('ui.input-frame.admission')
const handles = new WeakMap<
  UiInputFrameParticipation,
  { owner: InputFrameOwner; forwards: boolean }
>()

export function provideInputFrameBoundary() {
  if (inject(boundaryKey, false))
    throw new Error(
      'UiInputFrame cannot be nested. Popup content must establish an independent field scope.',
    )
  provide(boundaryKey, true)
}
/** A new explicit field is a boundary for public frame ownership. */
export function isolateInputFrameField() {
  provide(boundaryKey, false)
  provide(admissionKey, undefined as unknown as Admission)
  isolateControlFrame()
}

const Outside = /* @__PURE__ */ defineComponent({
  name: 'UiInputFrameOutside',
  setup(_, { slots }) {
    isolateInputFrameField()
    provide(fieldKey, undefined as unknown as ComputedRef<FieldContext>)
    return () => slots.default?.()
  },
})

/** Render owned popup content outside automatic value/surface participation. */
export function renderUiInputFrameOutside(
  children: readonly VNode[],
  participation: UiInputFrameParticipation,
): VNode {
  if (!handles.get(participation)?.forwards)
    throw new Error(
      'Only a forwarding participant can establish outside content.',
    )
  return h(Outside, null, () => children)
}

const AdmissionGate = /* @__PURE__ */ defineComponent({
  name: 'UiInputFrameAdmission',
  props: {
    node: { type: Object as PropType<VNode>, required: true },
    owner: { type: Object as PropType<InputFrameOwner>, required: true },
    contract: {
      type: Object as PropType<UiInputFrameContract>,
      required: true,
    },
  },
  setup(props) {
    provide(admissionKey, {
      gate: getCurrentInstance(),
      owner: props.owner,
      get contract() {
        return props.contract
      },
    })
    // Ordinary descendants cannot accidentally bind to the whole outer field.
    // A cooperating editor consumes its explicit admission instead. Popup
    // content can establish its own UiField, which replaces this barrier.
    provide(
      fieldKey,
      computed(() => {
        throw new Error(
          'Input-frame descendants require explicit participation; use the forwarding helper or an independent UiField for outside content.',
        )
      }),
    )
    return () => props.node
  },
})

const passiveTags = new Set([
  'span',
  'div',
  'p',
  'strong',
  'em',
  'b',
  'i',
  'small',
  's',
  'u',
  'sub',
  'sup',
  'abbr',
  'bdi',
  'bdo',
  'code',
  'kbd',
  'samp',
  'time',
  'br',
  'wbr',
])

function assertPassive(tag: string, props: Record<string, unknown> = {}) {
  if (
    !passiveTags.has(tag) ||
    Object.keys(props).some(
      (key) =>
        /^(tabindex|contenteditable|innerhtml)$/i.test(key) || /^on/i.test(key),
    ) ||
    Object.entries(props).some(
      ([key, value]) =>
        key.toLowerCase() === 'role' &&
        value != null &&
        !['none', 'presentation'].includes(String(value)),
    )
  )
    throw new Error(
      `UiInputFrame: native ${tag} is not passive content. Use a cooperating component.`,
    )
}

// Vue may hoist several static native nodes into one Static VNode. Validate
// that compiler-produced markup without needing a DOM during SSR. Components
// never occur inside static markup. Unknown/non-passive markup fails closed.
function assertStaticContent(html: string) {
  const token =
    /<!--[\s\S]*?-->|<\/?([a-zA-Z][\w:-]*)((?:[^"'<>]|"[^"]*"|'[^']*')*)>/g
  let end = 0
  for (const match of html.matchAll(token)) {
    if (html.slice(end, match.index).includes('<'))
      throw new Error('UiInputFrame: unsupported static content.')
    end = match.index! + match[0].length
    if (!match[1]) continue
    const attrs: Record<string, string> = {}
    const source = match[2].replace(/\/\s*$/, '')
    for (const attribute of source.matchAll(
      /([^\s=/'">]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g,
    ))
      attrs[attribute[1]] = attribute[2] ?? attribute[3] ?? attribute[4] ?? ''
    assertPassive(match[1].toLowerCase(), attrs)
  }
  if (html.slice(end).includes('<'))
    throw new Error('UiInputFrame: unsupported static content.')
}

export function renderInputFrameContent(
  children: readonly unknown[],
  owner: InputFrameOwner,
): VNode[] {
  return children.map((node): VNode => {
    if (typeof node === 'string' || typeof node === 'number')
      return h(Text, String(node))
    if (node == null || typeof node === 'boolean') return h(Comment)
    if (Array.isArray(node))
      return h(Fragment, renderInputFrameContent(node, owner))
    if (!isVNode(node))
      throw new Error('Input-frame discovery requires Vue VNodes.')
    if (node.type === Text || node.type === Comment) return node
    if (node.type === Static) {
      assertStaticContent(String(node.children ?? ''))
      return node
    }
    if (node.type === Fragment || typeof node.type === 'string') {
      if (typeof node.type === 'string')
        assertPassive(node.type, node.props ?? {})
      if (!Array.isArray(node.children)) return node
      const copy = cloneVNode(node)
      copy.children = renderInputFrameContent(node.children as VNode[], owner)
      // A transformed subtree must not retain compiler block shortcuts.
      ;(copy as VNode & { dynamicChildren: VNode[] | null }).dynamicChildren =
        null
      return copy
    }
    const definition = node.type as {
      name?: string
      __name?: string
      uiInputFrame?: UiInputFrameContract
    }
    const contract = definition.uiInputFrame
    if (
      !contract ||
      contract.protocol !== 'uninterface.input-frame' ||
      contract.version !== 1 ||
      !['editor', 'action', 'content', 'composition'].includes(contract.role) ||
      typeof contract.forwards !== 'boolean'
    )
      throw new Error(
        `UiInputFrame: ${definition.name ?? definition.__name ?? 'child component'} requires a supported input-frame participation contract. Implement the contract or move it outside the frame.`,
      )
    return h(AdmissionGate, {
      key: node.key ?? undefined,
      node,
      owner,
      contract,
    })
  })
}

/** Discover and admit selected children; forwarding is never implicit. */
export function renderUiInputFrameChildren(
  children: readonly VNode[],
  participation: UiInputFrameParticipation,
): VNode[] {
  const handle = handles.get(participation)
  if (!handle?.forwards)
    throw new Error(
      'This input-frame participant does not declare forwarding support.',
    )
  return renderInputFrameContent(children, handle.owner)
}

/** Consume one admitted component boundary. Returns undefined outside a frame. */
export function useUiInputFrameParticipant(
  options: UiInputFrameParticipantOptions = {},
): UiInputFrameParticipation | undefined {
  const admission = inject(admissionKey, undefined)
  if (!admission) return undefined
  if (getCurrentInstance()?.parent !== admission.gate)
    throw new Error(
      'Input-frame participation was not forwarded to this component. Use renderUiInputFrameChildren at the cooperating boundary.',
    )
  const { owner, contract } = admission
  const editor = contract.role === 'editor'
  const projection = () => options.projection?.()
  const data = () => {
    const selected = projection()
    if (!selected) return undefined
    const result = inputProjectionData(selected)
    if (result.field() !== toRaw(owner.field.value.field))
      throw new Error('Input projection belongs to a different field.')
    return result
  }
  const partId = 'ui-editor-' + useId()
  const binding = computed(() => ({
    ...owner.bind(owner.disabled.value || options.disabled?.()),
    id: projection() || owner.field.value.group ? partId : owner.field.value.id,
    invalid:
      Boolean(owner.field.value.field.state.issue) &&
      (data()?.invalid() ?? true),
  }))
  const readonly = computed(
    () => owner.readonly.value || Boolean(options.readonly?.()),
  )
  const label = computed(() => projection()?.label ?? owner.field.value.label)
  const value = computed(() => {
    if (!editor)
      throw new Error('Only editor participants consume an input value.')
    const current = data()?.read() ?? owner.field.value.field.state.input
    if (typeof current !== 'string')
      throw new Error(
        'A structured input-frame value requires an explicit string projection.',
      )
    return current
  })
  const token = {},
    key = () => projection()?.key ?? '$whole'
  let registeredKey: string | undefined
  function register() {
    if (!editor) return
    void value.value
    if (projection() && !owner.field.value.group)
      throw new Error(
        'Named input projections require UiField group and individually named editors.',
      )
    if (!label.value.trim())
      throw new Error('Input-frame editors require an accessible name.')
    const existing = owner.targets.get(key())
    if (existing && existing !== token)
      throw new Error(
        `UiInputFrame: duplicate editing target ${key()}. Use distinct named projections.`,
      )
    registeredKey = key()
    owner.targets.set(registeredKey, token)
  }
  function unregister() {
    if (registeredKey && owner.targets.get(registeredKey) === token)
      owner.targets.delete(registeredKey)
    registeredKey = undefined
  }
  onMounted(register)
  onActivated(register)
  onDeactivated(unregister)
  onScopeDispose(unregister)
  register()
  const initialKey = key()
  const initialField = toRaw(owner.field.value.field)
  watch(
    () => [key(), toRaw(owner.field.value.field)],
    ([nextKey, nextField]) => {
      if (editor && (nextKey !== initialKey || nextField !== initialField))
        throw new Error(
          'Changing an input editing target requires a keyed remount.',
        )
    },
    { flush: 'sync' },
  )
  let alive = true,
    active = true
  onScopeDispose(() => {
    alive = false
  })
  onDeactivated(() => {
    active = false
  })
  onActivated(() => {
    active = true
  })
  const surface = useUiControlFrameParticipant({
    focus: () =>
      editor && !binding.value.disabled
        ? (options.focus?.() ?? Promise.resolve(null))
        : Promise.resolve(null),
    invalid: () => editor && binding.value.invalid,
  })
  const result: UiInputFrameParticipation = {
    binding,
    descriptionBinding: computed(() => owner.bind(owner.disabled.value)),
    readonly,
    label,
    value,
    frame: surface.frame,
    setEngaged: surface.setEngaged,
    async update(next) {
      if (!editor)
        throw new Error('Only editor participants can update an input value.')
      if (
        !alive ||
        !active ||
        binding.value.disabled ||
        readonly.value ||
        next === value.value
      )
        return
      const field = owner.field.value.field
      const revision = field.state.revision
      const pending = data()?.write(next) ?? field.set(next)
      if (field.state.revision === revision)
        field.notifyDraftChanged({
          origin: 'user',
          parts: projection() ? [projection()!.key] : undefined,
        })
      await pending
    },
  }
  handles.set(result, {
    owner: {
      ...owner,
      disabled: computed(() => binding.value.disabled),
      readonly,
    },
    forwards: contract.forwards,
  })
  onScopeDispose(() => handles.delete(result))
  return result
}
