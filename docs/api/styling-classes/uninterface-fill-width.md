# uninterface-fill-width

Use this class when a native wrapper must carry a width allocation to its content. Load [the core stylesheet](README.md) and declare `style.fill-width.v1` in application requirements.

```html
<section class="uninterface-fill-width" aria-labelledby="results-title">
  <h2 id="results-title">Results</h2>
</section>
```

Core supplies exactly `width: 100%` and `min-width: 0` on the marked wrapper. The percentage resolves against the containing block. The zero minimum allows the wrapper to shrink below its content's minimum width when the layout is constrained. Long content follows its existing wrapping and overflow rules. Padding, borders and box sizing follow the normal cascade.

Verify that the wrapper can shrink beside siblings when space is limited, including with long content, and that the intended region owns wrapping or scrolling. [uninterface-fill-height](uninterface-fill-height.md) can be applied independently or on the same wrapper.
