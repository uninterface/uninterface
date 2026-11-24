# UiRangeFilterDefinition

Import type from `@uninterface/uninterface`. `UiRangeFilterDefinition<F, T>` is `Omit<UiCollectionFilterDefinition<F, UiFilterRange<T>>, 'createEditor'>` plus the range editor requirements. Required bound codec and finite comparator; optional invalidRange, whole-range rules, bound labels/placeholders, inputmode and action labels.

The definition owns query mapping, equality, activity, summaries, clear/removal meanings, availability and commit policy. The pattern factory owns editor construction and registers the default view. Text options accept UiTextSource for reactive localization. Validation rules use existing UiValidationRule and codecs use UiCodec; no native toolkit types or styling knobs are required.

See [createUiRangeFilterControl](../functions/createUiRangeFilterControl.md) and [built-in filters](../../guides/filter-patterns.md) for examples and exact range/choice conventions. Verify the criterion type, current-query writes, localized labels, default completion and disposal; incompatible selection/criterion combinations should fail at type checking or factory validation.
