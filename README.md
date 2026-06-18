# GitLab Comment Priority Buttons

Chrome extension that adds priority emoji buttons and `Alt+1` through `Alt+4` shortcuts to GitLab comment editors.

The loadable Chrome extension lives in:

```text
chrome-extension/
```

The extension is allowed to load on HTTPS pages, but the content script exits unless the current hostname is `gitlab` or starts with `gitlab.`.

## Local install

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `chrome-extension` folder.
5. Refresh GitLab.
