# UiCollectionFooter

Arranges collection information and pagination controls according to the selected backend. Import from `@uninterface/uninterface`. Works independently of UiCollectionView and with tables or cards; no collection provider or parent/child relationship is required.

## API and example

The four named slots are optional, unscoped, and contain ordinary Vue content:

| Slot | Intended content |
| --- | --- |
| `info` | Result range/total, a passive selected count, or other business information |
| `size` | UiPaginatorSizeSelect or a custom page-size control |
| `paginator` | UiPaginator or custom collection navigation |
| `jumper` | UiPaginatorJumper or a custom destination editor |

```vue
<UiCollectionFooter>
  <template #info>{{ resultSummary }}</template>
  <template #size>
    <UiPaginatorSizeSelect :binding="pagination" />
  </template>
  <template #paginator>
    <UiPaginator :binding="pagination" aria-label="Order pages" />
  </template>
  <template #jumper>
    <UiPaginatorJumper :binding="pagination" />
  </template>
</UiCollectionFooter>
```

There is no default slot, pagination binding prop, generated information, automatic control insertion or filtering of supplied controls by availability. Authors decide which controls to supply; those controls retain their existing disabled and capability behavior. Slots are semantic purposes, not fixed physical positions.

`zOrder?: UiZOrder` follows the shared stacking contract. Standard attributes/listeners target the footer's actual root. The footer adds no landmark, toolbar keyboard model, focus stop or live region. A paginator retains its own required accessible navigation name. The logical strategy role is `collection-footer`.

## Responsibilities

Core invokes each slot once per render and omits output consisting only of whitespace, comments or empty fragments. An entirely empty footer renders no element. Component internals remain opaque: if a supplied component may render nothing, condition its slot output when allocation must disappear. Slot emptiness is determined from Vue output, not DOM probing or execution of component internals; later layout measures the rendered wrappers.

Backends own grouping, spacing, native typography, wrapping and logical alignment. DOM and focus order follow the arrangement; RTL uses logical alignment without reversing DOM with CSS. Empty slots reserve no internal gap. The root does not create a border, card, inset, sticky region or scrollport; its surrounding layout owns placement and height. It can occupy the end region of a bounded UiRegionLayout outside the collection body scrollport.

Business code owns information meaning and localization. Prefer accepted range/total information beside pagination. A selected count is valid, but do not imply that all selected records belong to the displayed page or filtered result: selection can survive both. Keep a count beside selection actions when those actions are provided elsewhere. Do not duplicate announcements owned by the collection.

The footer neither creates nor loads/disposes a controller. Children retain their bindings, custom components, drafts and identity when other slots change. The independent paginator components remain usable without this footer. See [collection views](../../guides/collection-views.md) and the [backend contract](../backend/collections.md#uicollectionfooter).

## Verification

Require `collection.footer.v1`. Verify conditional and entirely empty slots, custom information/components, root attributes, retained jumper draft/focus after sibling changes, actual navigation requests, no source reads on mounting/rearrangement, and exclusion of unused controls from a footer-only bundle. Shared DOM and assembly tests cover those behaviors. Real-browser verification must additionally cover narrow/wide widths, RTL, long information, native control alignment, keyboard order and bounded versus document scrolling; DOM checks do not establish painted geometry.


## Available space and row allocation

The footer considers only present slots. It measures supporting content's preferred intrinsic widths and combines these with the cooperating paginator's backend-owned preferred width budget and the backend's spacing. If they fit, it retains the backend's ordinary single-row sequence. Otherwise:

1. Prefer information and size selection above a shared jumper → pagination row when the navigation's compact minimum fits beside the jumper.
2. Keep that pair together at logical end, separated by the backend's normal gap. The jumper precedes pagination in DOM and Tab order; the arrangement mirrors in RTL.
3. If the pair cannot fit usable native controls, pack information, size selection and jumper into supporting rows in backend-preferred order, followed by isolated pagination.
4. Preserve the backend's ordinary row alignment outside the shared navigation pair.

Row count depends on actual space and native control sizes. Two rows are preferred where feasible; additional rows keep controls usable at smaller offers. No absent slot reserves width or a row. Paginator-only and info-only footers remain one row. Long information can wrap; custom controls remain responsible for their own minimum usable width. A small merge margin prevents repeated row changes at fractional-width boundaries.

Navigation receives the space remaining beside the jumper or its own row. It may reduce its page window while preserving first/previous/next/last and the current page; native sizes and available page windows remain backend-owned. Preferred and compact-minimum width requests stay independent of the currently rendered page window. The footer checks the settled rendered navigation before retaining a shared allocation; a larger customized control can require separate rows. Custom navigation without a compact-width request retains its measured intrinsic size.

Supporting controls can also use native compact presentation. Their last measured ordinary widths remain requests for calculating the navigation offer while they are compact; rendered wrappers still use their actual current widths. A compact control shrinking must not immediately select ordinary presentation and restart the same sizing cycle. Resizing, changing page counts and changing content must settle while retaining the controls and their drafts.

The layout depends on the container offer, not a mobile breakpoint. Its wide sequence and ordinary row alignment follow the backend's documented presentation; the compact jumper → pagination pair is end-aligned.

The same keyed slot components stay mounted during allocation. Reading and Tab order match actual row order. A retained focused editor and its selection survive movement without a resize-induced commit. Custom slot internals are measured as content, not interpreted. The footer responds to container width, participation, content and font changes; it is not tied to a device breakpoint.
