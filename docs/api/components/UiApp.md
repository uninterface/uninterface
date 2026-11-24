# UiApp

Establish the application frame's surface and space offer. Backend assembly supplies its documented document typography and native-content baseline; UiApp normally inherits that typography. Applications do not need CSS for these defaults. Import from `@uninterface/uninterface`.

```vue
<UiApp>
  <header>Customer workspace</header>
  <main>
    <UiLayout>
      <CustomerSearch />
      <CustomerList />
    </UiLayout>
  </main>
</UiApp>
```

## API and business responsibility

UiApp accepts optional `hosting: UiAppHosting`, default `document`. See [UiAppHosting](../types/UiAppHosting.md). It has no custom events or exposed methods. Its default slot accepts ordinary HTML, Uninterface components, and other Vue components. Standard attributes and listeners target the outer application surface. The backend may render additional inner wrappers; callers must not depend on that structure.

Use UiApp at the root of an application's visible composition. It is optional when using individual components. Application setup owns locale resources, native toolkit integration and capability requirements. UiApp owns its frame and hosting; it does not create controls or own message packs. See [getting started](../../getting-started.md).


The application supplies its content, meaningful landmarks, headings, navigation and internal layouts. UiApp does not invent a title, header/sidebar/footer arrangement, `main` landmark, keyboard tab stop, or ARIA `application` role. Native HTML and third-party components remain responsible for their own semantics.

## Sizing and presentation

With hosting="document", the contract uses ordinary document flow: the outer surface takes its host's available width and grows with its content. Content remains reachable through document or host scrolling. Document hosting creates no private scrollport, clipping or bounded height. With hosting="viewport", the root occupies the dynamic viewport height and offers its measured height to one primary UiRegionLayout with a scroll-policy. Hosting does not choose scroll ownership. See [application layouts](../../guides/application-layouts.md).

UiApp offers its full available width to content without adding outer padding, gutters, centering, or a maximum content width. A child UiLayout with width="full" can therefore fill the application surface. Use [UiContent](UiContent.md) where ordinary content should receive insets within that space. Any backend wrappers must preserve that space offer. Constrained or centered content belongs to an explicit layout/presentation choice within the application, not an implicit application-root policy. The backend applies frame surface colors and normally inherits the document typography established at assembly. Descendant components carry their own presentation rules without requiring a generic backend scope class. Descendants can receive supported presentation preferences through [UiStrategy](UiStrategy.md).

The mounting document owns its body margin and any containing-host constraints. Its owner may explicitly use [uninterface-body-margin0](../styling-classes/uninterface-body-margin0.md) to remove body margins. UiApp does not change document styles or sibling applications at runtime. The selected backend stylesheet still has its documented global effects; UiApp is not a CSS isolation/reset boundary. Backend assembly and popup adapters preserve the required document and toolkit context for teleported content. UiApp is not their styling prerequisite. General frame/allocated hosting is not implemented. Light/dark coordination has its own [color-mode contract and setup](../../guides/color-mode.md).

## Backend responsibility

Support `app.root.v1`, and `hosting.viewport.v1` when viewport hosting is requested; missing support fails loudly. Preserve slot order, child instances, ordinary interaction and full-width allocation. Forward attributes such as `id`, `dir` and listeners to the outer surface. Do not invent landmarks, intercept descendant actions or dispose business-owned controls. Normal Vue descendant mounting/unmounting still applies.

The [backend view contract](../backend/layout.md#uiappviewprops) specifies measurement reporting and cleanup for viewport hosting. Hosting must not mutate body overflow or treat an outer space offer as a valid allocation for arbitrary nested consumers. See [application layouts](../../guides/application-layouts.md) for supported nesting limits.

## Observable verification

- Mixed native HTML and Vue content works; updates preserve input drafts and focus.
- Caller-supplied landmarks appear once, in order, without an extra application role or tab stop.
- Root surfaces remain readable and child layouts receive full available width on narrow and wide screens.
- Document hosting permits ordinary content growth; viewport hosting supplies the declared bounded offer and updates it on resize.
- Missing capabilities fail visibly, and importing UiApp does not include unrelated components.

Use browser checks for available space, surface appearance and scrolling. DOM and assembly checks alone do not establish visual or accessibility conformance.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
