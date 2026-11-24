# UiIconCatalogue

Import from `@uninterface/uninterface/icons`.

Definitions may use SVG files imported through core's optional [createUiIconLoader](../functions/createUiIconLoader.md). Compiled SVG assets use the same component/variant slots as other artwork; see [SVG setup](../../guides/localization-and-icons.md#svg-files).

`Readonly<Record<string, UiIconDefinition>>`: semantic names to asset definitions. Backends provide all names from uiIconNames; application setup `icons` replaces complete definitions by key and adds extensions. Unspecified mappings retain defaults. Resulting records/definitions are frozen per application; asset components themselves are not frozen.

Native internal icons are not implicitly rewritten. Catalogue setup currently includes a bounded baseline subset; do not eagerly import full icon libraries. Verification: baseline completeness, override precedence, independent application catalogues, and unknown-name diagnostics.
