# JSON Viewer Pro

Clean, fast JSON viewer for Chrome. Automatically detects and formats JSON responses with a collapsible tree view, search, and syntax highlighting. No ads, no tracking, no donation popups.

## Features

- Auto-detect JSON pages in Chrome
- Collapsible tree view with syntax highlighting
- Search across keys and values
- Copy individual values or JSONPath-style paths
- Toggle between formatted tree view and raw JSON
- Light, dark, and auto (system) themes
- URL detection — clickable links in string values
- File size display

## Installation

### From Chrome Web Store (coming soon)
1. Install from the Chrome Web Store
2. Navigate to any JSON URL (e.g., a REST API endpoint)
3. JSON is automatically formatted

### Local Development
1. Open `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select this directory
4. Navigate to any JSON URL to test

## Testing

```bash
node tests/test-core.mjs
```

Open `tests/test-json-detection.html` in a browser for in-browser tests.
Use `tests/sample.json` as a local test file (serve with a local HTTP server).

## Privacy

This extension:
- Does NOT collect personal data
- Does NOT track your browsing
- Does NOT inject ads, donation popups, or promotional content
- Stores settings locally using Chrome's storage API
- See our full [Privacy Policy](PRIVACY_POLICY.md)

## Store Listing Copy

### Title (max 45 chars)
JSON Viewer Pro

### Short Description (max 132 chars)
Clean, fast JSON viewer with tree view, search, and syntax highlighting. No ads, no tracking, no popups.

### Detailed Description
JSON Viewer Pro automatically detects and formats JSON responses in your browser.

Features:
- Collapsible tree view with syntax highlighting
- Search across keys and values with highlighting
- Copy individual values or full JSON paths
- Toggle between formatted and raw JSON
- Light, dark, and auto themes (follows your system preference)
- URL detection — clickable links in string values
- File size display in the toolbar

Why JSON Viewer Pro?
- Zero tracking or analytics — your data stays on your device
- No ads, donation popups, or injected content
- Fast and lightweight
- Clean, modern UI with dark mode support
- Open source

### Category
Developer Tools

### Search Keywords
json, json viewer, json formatter, json editor, json tree, json pretty print, api response viewer, developer tools
