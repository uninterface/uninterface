# UiTabsOptions

Import from `@uninterface/uninterface`.

Options for createUiTabsControl: required `selectedKey: string`, optional `id: string`. Both supplied strings must be nonempty. The selected key identifies the initial panel. The optional id must be document-unique and stable through hydration; omit it in Vue setup to use Vue useId. Outside setup the client-only default is a module sequence; SSR callers must supply an id. Verify independent compositions have distinct IDs and server/client use the same explicit identity.

See [createUiTabsControl](../functions/createUiTabsControl.md) and the [panels guide](../../guides/panels.md).
