# Public styling classes

These CSS classes are application-integration utilities defined and supplied by Uninterface core. They are public API, distinct from JavaScript classes and private backend selectors. Load the core stylesheet once; applying a class requires no JavaScript API, Vue component or provider.

Each class has a narrow target, exact effect and explicit capability. Use the `uninterface-` namespace for public classes, document each individually, and declare required support through the capability manifest. A class is not permission to configure arbitrary toolkit spacing, colors or typography from business code. Backend-private classes are not part of this API.

| Class | Target | Effect | Required capability |
|---|---|---|---|
| [uninterface-body-margin0](uninterface-body-margin0.md) | `body` | Sets all four margins to zero | `style.body-margin0.v1` |
| [uninterface-fill-height](uninterface-fill-height.md) | Wrapper with a bounded height allocation | Sets `height: 100%` and `min-height: 0` | `style.fill-height.v1` |
| [uninterface-fill-width](uninterface-fill-width.md) | Wrapper with a bounded width allocation | Sets `width: 100%` and `min-width: 0` | `style.fill-width.v1` |
| [uninterface-navigation-focus-target](uninterface-navigation-focus-target.md) | Explicit static navigation destination while focused | Suppresses its enclosing outline while retaining focus and descendant indicators | `style.navigation-focus-target.v1` |

Import `@uninterface/uninterface/style.css` once as described in [project setup](../../getting-started.md). The [backend authoring contract](../backend/presentation.md#public-styling-classes) explains integration responsibilities. Backend-independent rules live centrally in core; toolkit-specific presentation remains backend-owned. These classes use normal CSS cascade behavior; they do not override deliberate higher-priority application rules.
