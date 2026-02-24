// JSON Viewer Pro — Content Script
// Detects JSON responses and replaces with a formatted tree view.

(function () {
  'use strict';

  // Only run on the top frame
  if (window !== window.top) return;

  // Detect if the page content is JSON
  function isJsonPage() {
    const body = document.body;
    if (!body) return false;

    // Fast path: check document.contentType (set by the server's Content-Type header)
    if (document.contentType === 'application/json' || document.contentType === 'text/json') {
      const pre = body.querySelector('pre');
      if (pre) {
        try { JSON.parse(pre.textContent); return true; } catch { /* fall through */ }
      }
    }

    // Fallback: Chrome renders raw JSON inside a <pre> element.
    // Modern Chrome also adds a <div class="json-formatter-container"> sibling.
    const pre = body.querySelector('pre');
    if (!pre) return false;

    const children = Array.from(body.childNodes).filter(
      (n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim())
    );
    // Accept: just <pre>, or <pre> + Chrome's json-formatter-container
    const isSimple = children.length === 1 && children[0] === pre;
    const isChromeJson = children.length === 2 && children[0] === pre &&
      children[1].classList && children[1].classList.contains('json-formatter-container');
    if (!isSimple && !isChromeJson) return false;

    try {
      JSON.parse(pre.textContent);
      return true;
    } catch {
      return false;
    }
  }

  function getJsonFromPage() {
    const pre = document.body.querySelector('pre');
    if (!pre) return null;
    try {
      return JSON.parse(pre.textContent);
    } catch {
      return null;
    }
  }

  // Render a JSON value as a DOM tree
  function renderValue(value, key, depth, path) {
    const type = Array.isArray(value)
      ? 'array'
      : value === null
        ? 'null'
        : typeof value;

    if (type === 'object' || type === 'array') {
      return renderCollapsible(value, key, type, depth, path);
    }
    return renderPrimitive(value, key, type, path);
  }

  function renderCollapsible(obj, key, type, depth, path) {
    const isArray = type === 'array';
    const entries = isArray ? obj : Object.entries(obj);
    const count = isArray ? obj.length : Object.keys(obj).length;
    const bracket = isArray ? ['[', ']'] : ['{', '}'];

    const container = el('div', 'jvp-node jvp-collapsible');
    container.dataset.path = path;
    container.dataset.depth = depth;

    // Toggle row
    const toggle = el('span', 'jvp-toggle');
    toggle.textContent = '\u25BC'; // down arrow
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');

    const header = el('div', 'jvp-header');
    header.appendChild(toggle);

    if (key !== null) {
      const keyEl = el('span', 'jvp-key');
      keyEl.textContent = JSON.stringify(key);
      header.appendChild(keyEl);
      header.appendChild(text(': '));
    }

    const bracketOpen = el('span', 'jvp-bracket');
    bracketOpen.textContent = bracket[0];
    header.appendChild(bracketOpen);

    const countEl = el('span', 'jvp-count');
    countEl.textContent = isArray
      ? `${count} item${count !== 1 ? 's' : ''}`
      : `${count} key${count !== 1 ? 's' : ''}`;
    header.appendChild(countEl);

    // Copy path button
    const copyBtn = el('button', 'jvp-copy-path');
    copyBtn.textContent = '\u2398'; // copy symbol
    copyBtn.title = `Copy path: ${path}`;
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(path);
      copyBtn.textContent = '\u2713';
      setTimeout(() => (copyBtn.textContent = '\u2398'), 1200);
    });
    header.appendChild(copyBtn);

    container.appendChild(header);

    // Children
    const childrenEl = el('div', 'jvp-children');
    if (isArray) {
      obj.forEach((item, i) => {
        childrenEl.appendChild(renderValue(item, i, depth + 1, `${path}[${i}]`));
      });
    } else {
      for (const [k, v] of Object.entries(obj)) {
        const childPath = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k)
          ? `${path}.${k}`
          : `${path}[${JSON.stringify(k)}]`;
        childrenEl.appendChild(renderValue(v, k, depth + 1, childPath));
      }
    }

    const bracketClose = el('div', 'jvp-bracket-close');
    bracketClose.textContent = bracket[1];
    childrenEl.appendChild(bracketClose);

    container.appendChild(childrenEl);

    // Collapse toggle
    const toggleCollapse = () => {
      const collapsed = container.classList.toggle('jvp-collapsed');
      toggle.textContent = collapsed ? '\u25B6' : '\u25BC';
    };

    header.addEventListener('click', toggleCollapse);
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCollapse();
      }
    });

    // Auto-collapse large nodes at depth > 1
    if (depth > 1 && count > 10) {
      toggleCollapse();
    }

    return container;
  }

  function renderPrimitive(value, key, type, path) {
    const row = el('div', 'jvp-node jvp-primitive');
    row.dataset.path = path;

    if (key !== null) {
      const keyEl = el('span', 'jvp-key');
      keyEl.textContent = JSON.stringify(key);
      row.appendChild(keyEl);
      row.appendChild(text(': '));
    }

    const valEl = el('span', `jvp-value jvp-${type}`);
    if (type === 'string') {
      valEl.textContent = JSON.stringify(value);
      // Detect URLs in strings
      if (/^https?:\/\//.test(value)) {
        const link = el('a', 'jvp-link');
        link.href = value;
        link.textContent = JSON.stringify(value);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        valEl.textContent = '';
        valEl.appendChild(link);
      }
    } else if (value === null) {
      valEl.textContent = 'null';
    } else if (type === 'boolean') {
      valEl.textContent = String(value);
    } else {
      valEl.textContent = String(value);
    }
    row.appendChild(valEl);

    // Copy value button
    const copyBtn = el('button', 'jvp-copy-path');
    copyBtn.textContent = '\u2398';
    copyBtn.title = `Copy: ${path}`;
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(
        type === 'string' ? value : JSON.stringify(value)
      );
      copyBtn.textContent = '\u2713';
      setTimeout(() => (copyBtn.textContent = '\u2398'), 1200);
    });
    row.appendChild(copyBtn);

    return row;
  }

  // DOM helpers
  function el(tag, className) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }

  function text(str) {
    return document.createTextNode(str);
  }

  // Toolbar
  function createToolbar(data, rawText) {
    const toolbar = el('div', 'jvp-toolbar');

    // Search
    const searchBox = el('input', 'jvp-search');
    searchBox.type = 'text';
    searchBox.placeholder = 'Search keys and values\u2026';
    searchBox.addEventListener('input', () => {
      const query = searchBox.value.toLowerCase().trim();
      highlightSearch(query);
    });
    toolbar.appendChild(searchBox);

    // Toggle: Tree / Raw
    const toggleRaw = el('button', 'jvp-btn');
    toggleRaw.textContent = 'Raw';
    toggleRaw.addEventListener('click', () => {
      const tree = document.getElementById('jvp-tree');
      const raw = document.getElementById('jvp-raw');
      if (!tree || !raw) return;
      const showingTree = !tree.classList.contains('jvp-hidden');
      tree.classList.toggle('jvp-hidden', showingTree);
      raw.classList.toggle('jvp-hidden', !showingTree);
      toggleRaw.textContent = showingTree ? 'Tree' : 'Raw';
    });
    toolbar.appendChild(toggleRaw);

    // Copy all
    const copyAll = el('button', 'jvp-btn');
    copyAll.textContent = 'Copy';
    copyAll.addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      copyAll.textContent = 'Copied!';
      setTimeout(() => (copyAll.textContent = 'Copy'), 1200);
    });
    toolbar.appendChild(copyAll);

    // Expand all
    const expandAll = el('button', 'jvp-btn');
    expandAll.textContent = 'Expand All';
    expandAll.addEventListener('click', () => {
      document.querySelectorAll('.jvp-collapsed').forEach((node) => {
        node.classList.remove('jvp-collapsed');
        const t = node.querySelector('.jvp-toggle');
        if (t) t.textContent = '\u25BC';
      });
    });
    toolbar.appendChild(expandAll);

    // Collapse all
    const collapseAll = el('button', 'jvp-btn');
    collapseAll.textContent = 'Collapse All';
    collapseAll.addEventListener('click', () => {
      document.querySelectorAll('.jvp-collapsible').forEach((node) => {
        node.classList.add('jvp-collapsed');
        const t = node.querySelector('.jvp-toggle');
        if (t) t.textContent = '\u25B6';
      });
    });
    toolbar.appendChild(collapseAll);

    // Info
    const info = el('span', 'jvp-info');
    const size = new Blob([rawText]).size;
    const sizeStr =
      size > 1048576
        ? `${(size / 1048576).toFixed(1)} MB`
        : size > 1024
          ? `${(size / 1024).toFixed(1)} KB`
          : `${size} B`;
    info.textContent = sizeStr;
    toolbar.appendChild(info);

    return toolbar;
  }

  function highlightSearch(query) {
    // Clear previous highlights
    document.querySelectorAll('.jvp-search-match').forEach((el) => {
      el.classList.remove('jvp-search-match');
    });
    document.querySelectorAll('.jvp-search-hidden').forEach((el) => {
      el.classList.remove('jvp-search-hidden');
    });

    if (!query) return;

    // Find all nodes that match
    const allNodes = document.querySelectorAll('.jvp-node');
    let matchCount = 0;

    allNodes.forEach((node) => {
      const keys = node.querySelectorAll(':scope > .jvp-key, :scope > .jvp-header > .jvp-key');
      const values = node.querySelectorAll(':scope > .jvp-value');
      let matches = false;

      keys.forEach((k) => {
        if (k.textContent.toLowerCase().includes(query)) {
          matches = true;
          k.classList.add('jvp-search-match');
        }
      });

      values.forEach((v) => {
        if (v.textContent.toLowerCase().includes(query)) {
          matches = true;
          v.classList.add('jvp-search-match');
        }
      });

      if (matches) {
        matchCount++;
        // Expand parent collapsed nodes
        let parent = node.parentElement;
        while (parent) {
          if (parent.classList.contains('jvp-collapsed')) {
            parent.classList.remove('jvp-collapsed');
            const t = parent.querySelector('.jvp-toggle');
            if (t) t.textContent = '\u25BC';
          }
          parent = parent.parentElement;
        }
      }
    });
  }

  // Main
  function init() {
    chrome.storage.sync.get('settings', (data) => {
      const settings = data.settings || { enabled: true, theme: 'auto' };
      if (!settings.enabled) return;

      if (!isJsonPage()) return;

      const jsonData = getJsonFromPage();
      if (jsonData === null) return;

      const rawText = document.body.querySelector('pre').textContent;

      // Replace page content
      document.body.textContent = '';
      document.title = 'JSON Viewer Pro — ' + document.title;

      // Determine theme
      const theme = settings.theme || 'auto';
      let darkMode = false;
      if (theme === 'dark') {
        darkMode = true;
      } else if (theme === 'auto') {
        darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      document.body.className = darkMode ? 'jvp-dark' : 'jvp-light';

      // Inject CSS
      const cssUrl = chrome.runtime.getURL('viewer.css');
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssUrl;
      document.head.appendChild(link);

      // Build UI
      const root = el('div', 'jvp-root');

      // Toolbar
      root.appendChild(createToolbar(jsonData, rawText));

      // Tree view
      const treeContainer = el('div', 'jvp-tree-container');
      treeContainer.id = 'jvp-tree';
      treeContainer.appendChild(renderValue(jsonData, null, 0, '$'));
      root.appendChild(treeContainer);

      // Raw view (hidden by default)
      const rawContainer = el('pre', 'jvp-raw jvp-hidden');
      rawContainer.id = 'jvp-raw';
      rawContainer.textContent = JSON.stringify(jsonData, null, 2);
      root.appendChild(rawContainer);

      document.body.appendChild(root);
    });
  }

  init();
})();
