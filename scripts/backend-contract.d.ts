// Core emits declarations against the backend interface. The application
// supplies the implementation selected under @uninterface/backend.
declare module '@uninterface/backend' {
  export const uiBackend: import('../src/backend/index').UiBackendDescriptor
}

declare module '@uninterface/backend/integration' {
  const integration: import('../src/setup/types').UiBackendIntegration
  export default integration
}

declare module '@uninterface/backend/layout' {
  export const uiLayoutPresentation: import('../src/backend/index').UiLayoutPresentation
}

declare module '@uninterface/backend/focus' {
  export const uiFocusPresentation: import('../src/presentation/focus').UiFocusPresentationBinding
}

declare module '@uninterface/backend/*.vue' {
  const view: import('vue').Component
  export default view
}
