# UiSearchFilterDefinition

Import type from `@uninterface/uninterface`. `UiSearchFilterDefinition<F>` is `Omit<UiCollectionFilterDefinition<F, string>, 'createEditor'>` plus the search editor requirements. Optional codec/rules, placeholder and searchLabel.

The definition owns query mapping, equality, activity, summaries, clear/removal meanings, availability and commit policy. The pattern factory owns editor construction and registers the default view. Text options accept UiTextSource for reactive localization. Validation rules use existing UiValidationRule and codecs use UiCodec; no native toolkit types or styling knobs are required.

See [createUiSearchFilterControl](../functions/createUiSearchFilterControl.md) and [built-in filters](../../guides/filter-patterns.md) for examples and exact range/choice conventions. Verify the criterion type, current-query writes, localized labels, default completion and disposal; incompatible selection/criterion combinations should fail at type checking or factory validation.
