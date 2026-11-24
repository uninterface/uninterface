# createUiResponsive

Creates a Vue application plugin supplying an application-owned responsive context without rendering a wrapper or requiring a UI wrapper. Without an explicit profile, the permitted tokens are `desktop` and `mobile`.

```ts
import { createApp, ref } from 'vue'
import { createUiResponsive } from '@uninterface/uninterface/responsive'

const context = ref<'desktop' | 'mobile'>('desktop')
createApp(App).use(createUiResponsive(context)).mount('#app')
// Update context from the application's shared environment detector.
```

## Signatures

```ts
function createUiResponsive(
  context: MaybeRefOrGetter<UiResponsiveContext>,
): Plugin

function createUiResponsive<Token extends string>(
  context: MaybeRefOrGetter<NoInfer<Token>>,
  profile: UiResponsiveProfile<Token>,
): Plugin
```

The first form validates against the default pair. The second validates against an explicitly declared [profile](defineUiResponsiveProfile.md). The profile determines the inferred token union; the source cannot enlarge it. Both accept a literal, ref, or reactive getter. A fixed string supplies a fixed context. When reading a property from a reactive object, pass a getter rather than its current string value.

```ts
// workspaceResponsive is a shared definition exported by application code.
const context = ref<(typeof workspaceResponsive.tokens)[number]>('tablet')
app.use(createUiResponsive(context, workspaceResponsive))
```

Declare the complete vocabulary before installation; it is copied for validation and is not dynamically extendable. The initial source is evaluated and validated during plugin installation. Later invalid values throw when the computed context is read; they are not mapped to a default or retained previous value. Use synchronous refs/getters for the current token; asynchronous observations can update a ref after supplying a valid initial value.

## Ownership and behavior

Descendant [useUiResponsive](useUiResponsive.md) consumers observe the value through a read-only ref. Profile-aware consumers must request the same profile object installed here. Unqualified consumers observe any installed vocabulary and therefore receive a string-valued ref. Different Vue apps can use the same profile definition with independent sources.

Install once before mounting the application. Business components express responses, not detection. Application assembly owns external detector subscriptions and cleanup; the plugin observes the source but does not own it. User-agent information, viewport/container measurements, hints, and user preferences can inform that source. Declaring a token alone does not create its detection rules.

Backends receive only resolved component properties; they do not consume responsive tokens. The plugin does not install a backend, messages, theme, general state manager, or viewport listener. Its consumers bypass default detection, while other Vue applications can continue using the shared default detector.

Without this plugin, core uses a shared browser viewport detector (mobile up to 760px), subscribed while at least one responsive consumer is mounted. Before mount and without matchMedia the default is desktop. Server/hydration behavior is not acceptance-tested; supply consistent initial application context where server rendering is required.

Acceptance covers immediate and reactive custom-token delivery, invalid initial/later values, app-local sources, default detector bypass, and typed/profile-checked consumption. See [responsive layouts](../../guides/responsive-layouts.md).

Import `createUiResponsive` from `@uninterface/uninterface/responsive`. Ordinary business consumers import useUiResponsive from `@uninterface/uninterface`.
