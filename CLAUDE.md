# JSON Viewer Pro — Chrome Extension

## What This Is
A Chrome extension that auto-detects JSON responses and renders them as an interactive tree view with search, syntax highlighting, and theme support. Privacy-first: no tracking, no ads, no donation popups.

## Architecture
- **content.js** — Content script injected on all pages. Detects JSON via `document.contentType` (fast path) with fallback heuristics for Chrome's built-in JSON viewer. Renders the tree UI.
- **background.js** — Service worker for extension lifecycle events.
- **popup/** — Browser action popup with enable/disable toggle and theme selector.
- **options/** — Full options page for advanced settings.
- **viewer.css** — Styles for the tree view, toolbar, search, and themes (light/dark/auto).
- **icons/** — Extension icons (16, 48, 128px).

## Key Implementation Details
- All DOM elements use `jvp-` prefix to avoid conflicts with page styles
- JSON detection: `document.contentType === 'application/json'` is the primary check. Fallback accepts Chrome's `json-formatter-container` sibling element.
- Tree nodes are collapsible. Toggle state uses `jvp-collapsed` class.
- Search highlights matches with `jvp-search-match` class.
- Themes stored in `chrome.storage.sync`.

## Running Tests
```bash
node tests/test-core.mjs
```
- 67 unit tests covering JSON detection, tree rendering, search, copy, themes
- `tests/test-json-detection.html` for in-browser testing
- `tests/sample.json` for local test data

## Conventions
- Manifest V3, no external dependencies
- Version: semver starting at 0.x (1.x = production-ready)
- All user-facing strings in HTML, not JS
- Privacy policy must be kept current with any permission changes
- Do NOT add Claude/AI as co-author or contributor in commits, PRs, or code
