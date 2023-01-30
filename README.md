## Addons

### Injection to the main menu

* Provide custom layout ([AdminLayout](./src/admin/AdminLayout.tsx)) into `AdminUI`.
* Add `Menu.Item` to the [MainMenu](./src/admin/menu/MainMenu.tsx).

### Adding a custom page

```jsx
    <CustomRoutes>
        <Route path={'/addon'} element={<MyAddon/>} />
    </CustomRoutes>
```

### Adding localization messages

See [i18nProvider.ts](src/i18nProvider.ts)

https://github.com/benwinding/react-admin-import-csv#translation-i18n


### dataProvider customization (?)