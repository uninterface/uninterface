# uninterface-fill-height

Use this class when a native wrapper such as a `<main>` must carry a definite height from an outer layout to its content. Load [the core stylesheet](README.md) and declare `style.fill-height.v1` in application requirements.

```html
<main class="uninterface-fill-height" aria-labelledby="page-title">
  <h1 id="page-title">Records</h1>
  <!-- Render the content that uses the bounded height. -->
</main>
```

Core supplies exactly `height: 100%` and `min-height: 0` on the marked wrapper. The percentage resolves against the containing block, which must offer a definite height. The zero minimum allows the wrapper to shrink when its layout reduces the allocation. Box sizing, overflow, focus and landmark semantics follow the existing HTML and CSS. A nested scroll region can use the resulting height and manage its own overflow.

Verify that the wrapper carries the allocated height and that scrolling occurs in the intended region. Omit the class when the wrapper should grow with content. [uninterface-fill-width](uninterface-fill-width.md) can be applied independently or on the same wrapper.
