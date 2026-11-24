# uninterface-body-margin0

Removes the document body's outer margin. Use it when the mounting application wants a body without browser-default margins, leaving intentional content insets to its inner layout or content areas.

## Usage

Import the core stylesheet once in the application entry, alongside the selected backend's stylesheet:

```ts
import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
```

Apply the class to `body` in the application's HTML entry:

```html
<body class="uninterface-body-margin0">
  <div id="app"></div>
</body>
```

No Vue component, provider or runtime call is required. The class takes effect when the stylesheet loads, independently of component mounting. An embedded application must leave the enclosing document's margin policy to its owner.

## Exact contract and scope

The class sets all four physical body margins to zero. The rule targets `body.uninterface-body-margin0` only; applying the same class to a div or another element has no effect from this utility. It does not reset descendants.

It changes no padding, borders, sizing, overflow, scroll behavior, typography, colors, background or animations. It does not choose document versus viewport hosting, make content full-height, or guarantee that descendants reach the viewport edges. It is not a general CSS reset or isolation boundary.

The rule uses the normal cascade, without `!important`. Higher-priority application rules can override it. Removing the class withdraws this rule's effect; the resulting margin comes from the remaining styles, not a promised browser-default value. Other toolkit styles may independently set body margins even without this class.

## Implementation responsibility

Core declares `style.body-margin0.v1` and supplies this backend-independent rule through `@uninterface/uninterface/style.css`:

```css
body.uninterface-body-margin0 {
  margin: 0;
}
```

Core maintains the rule centrally and marks its CSS as having side effects so bundlers retain the explicit stylesheet import. It works without a UiApp ancestor or JavaScript initialization. Backends must not duplicate or redefine it, or attach unrelated declarations, descendant resets or runtime document mutations to this class.

Applications requiring this utility declare `style.body-margin0.v1` in their requirements. Assembly capability checks resolve this requirement from core. They verify declared support, not whether the application loaded the stylesheet. Arbitrary HTML class strings are not automatically scanned by the current checker; authors must declare the requirement explicitly. The class has no TypeScript value export.

## Composition and acceptance

[UiApp](../components/UiApp.md) continues to own only its application surface and does not mutate the body. Its document and viewport hosting modes can both coexist with this class. [UiContent](../components/UiContent.md) supplies deliberate insets inside the application.

Acceptance checks cover zero margins on a body carrying the class, preserved padding and other document properties, no effect on descendants or non-body elements carrying the class, and return to the remaining cascade when removed. Production integration checks also verify the rule survives stylesheet compilation. Browser checks verify computed body margins in the assembled application. Stylesheet loading and higher-priority rules remain application integration concerns.
