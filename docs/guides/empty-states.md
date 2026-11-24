# Empty states

Use [UiEmpty](../api/components/UiEmpty.md) when a successfully available view has nothing to display. This is a reusable presentation for collections, cards, panels and search results. The owner decides whether the state is empty and supplies its business meaning; the backend supplies the presentation.

## Start with the default

```vue
<UiEmpty />
```

The default is localized “No items.” It does not add an illustration, action or heading. UiTable, UiList and UiCollectionView already use this presentation for successful zero-item results. Do not add a second empty message alongside them or use an empty message while a read is pending or failed.

Distinguish “no records exist” from “no records match” when the owner knows that distinction. Base a query-specific message on the accepted query/result, rather than unsubmitted search text. Neither UiEmpty nor a collection view can infer what arbitrary business filters mean.

```vue
<UiTable :binding="invoices.bindings.list" aria-label="Invoices">
  <!-- UiTableColumn declarations -->
  <template #empty>
    <UiEmpty>
      {{ hasAcceptedFilters ? 'No invoices match your search.' : 'No invoices yet.' }}
    </UiEmpty>
  </template>
</UiTable>
```

The same `#empty` slot works on UiList and UiCollectionView. It replaces the entire empty content, so existing plain-text/custom slots remain valid. Literal labels here are illustrative; production business messages belong to application localization.

## Add content only when it helps the task

```vue
<UiEmpty>
  No invoices yet.
  <template #actions>
    <UiButton @click="createInvoice">New invoice</UiButton>
  </template>
</UiEmpty>
```

An optional `#icon` accepts artwork such as UiIcon. Hide purely decorative artwork from assistive technology; name an icon if it conveys additional meaning. Do not rely on an image alone to explain the state.

Action availability, authorization and invocation stay with the business owner and ordinary button bindings. A Clear filters action should clear the owned query; a New invoice action should open the existing creation workflow. UiEmpty adds no such behavior implicitly. Avoid duplicating an already reachable primary action unless placing it here serves the task.

## Ownership and backend support

| Concern | Owner |
|---|---|
| Determine successful emptiness and distinguish business cases | Collection control or containing business component |
| Message, artwork and useful actions | Business composition; core supplies localized default text |
| Allocation and placement | Containing table/list/card/panel |
| Markup, typography, spacing and action wrapping | Backend |
| Loading, failure, announcements and focus | Existing containing workflow |

Backends map shared message, icon and action slots to compatible native empty-state facilities or their own presentation, suppressing implicit artwork absent from the request. Table empty states use the native data-area slot or a spanning body row. Business consumers do not supply backend CSS.

The component is content-sized. It does not impose a fixed height, fill a page, add a frame or prescribe an illustration. A table/list owns placement within its data region. Use normal layouts to allocate space in a custom composition. Empty presentation does not introduce another scrolling region.

Collections retain their elected status announcement; UiEmpty has no automatic role=status or live region. A custom dynamic host can supply its own announcement policy. Do not move focus to an empty message merely because results changed; ensure removing the last focused row leaves a meaningful focus destination.

## Observable acceptance

- Standalone fallback text follows the application locale; custom content retains its application-owned meaning.
- A successful zero-item response shows exactly one empty presentation. Uninitialized, loading and failed reads do not masquerade as successful emptiness.
- Refreshing retains accepted rows under the loading mask; subsequent empty success replaces them. An external loading condition suppresses empty content until it ends.
- Table empty content is inside the table's data area and spans the columns. Selection columns and table headers remain coherent.
- Optional actions activate once with ordinary button availability and keyboard behavior. No action, illustration, tab stop or live announcement is added by default.
- Check long messages, narrow containers, localized actions, RTL and dark mode in a browser. DOM coverage establishes wiring and state transitions, not geometry or assistive-technology acceptance.
