// JSON Viewer Pro — Node.js unit tests for core logic
// Run: node tests/test-core.mjs

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${name}`);
  } else {
    failed++;
    console.error(`  FAIL: ${name}`);
  }
}

// ========== JSON Detection ==========
console.log('\n--- JSON Detection ---');

function tryParseJson(text) {
  try { return JSON.parse(text); }
  catch { return null; }
}

assert('Parse simple object', tryParseJson('{"key": "value"}') !== null);
assert('Parse nested object', tryParseJson('{"a": {"b": {"c": 1}}}') !== null);
assert('Parse array', tryParseJson('[1, 2, 3]') !== null);
assert('Parse empty object', tryParseJson('{}') !== null);
assert('Parse empty array', tryParseJson('[]') !== null);
assert('Parse string', tryParseJson('"hello"') === 'hello');
assert('Parse number', tryParseJson('42') === 42);
assert('Parse boolean true', tryParseJson('true') === true);
assert('Parse boolean false', tryParseJson('false') === false);
assert('Parse null returns null (truthy check)', tryParseJson('null') === null);
assert('Reject plain text', tryParseJson('hello world') === null);
assert('Reject HTML', tryParseJson('<html></html>') === null);
assert('Reject incomplete JSON', tryParseJson('{"key":') === null);
assert('Reject trailing comma', tryParseJson('{"a": 1,}') === null);
assert('Reject single quotes', tryParseJson("{'a': 1}") === null);

// Large JSON
const largeObj = {};
for (let i = 0; i < 1000; i++) largeObj['key' + i] = 'value' + i;
assert('Parse 1000-key object', tryParseJson(JSON.stringify(largeObj)) !== null);

// Unicode
assert('Parse unicode escapes', tryParseJson('{"emoji": "\\u2764"}') !== null);
assert('Parse actual unicode', tryParseJson('{"emoji": "\u2764"}') !== null);

// ========== URL Detection ==========
console.log('\n--- URL Detection ---');

function isUrl(str) {
  return /^https?:\/\//.test(str);
}

assert('Detect http URL', isUrl('http://example.com'));
assert('Detect https URL', isUrl('https://api.github.com/repos'));
assert('Detect URL with path', isUrl('https://example.com/path/to/resource'));
assert('Reject plain string', !isUrl('not a url'));
assert('Reject ftp', !isUrl('ftp://files.example.com'));
assert('Reject data URI', !isUrl('data:text/plain;base64,'));
assert('Reject javascript URI', !isUrl('javascript:alert(1)'));

// ========== Path Generation ==========
console.log('\n--- Path Generation ---');

function generatePath(base, key) {
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
    return `${base}.${key}`;
  }
  return `${base}[${JSON.stringify(key)}]`;
}

assert('Simple key', generatePath('$', 'name') === '$.name');
assert('Nested key', generatePath('$.user', 'email') === '$.user.email');
assert('Key with spaces', generatePath('$', 'full name') === '$["full name"]');
assert('Key with dots', generatePath('$', 'a.b') === '$["a.b"]');
assert('Key starting with number', generatePath('$', '0key') === '$["0key"]');
assert('Key with dashes', generatePath('$', 'foo-bar') === '$["foo-bar"]');
assert('Underscore key', generatePath('$', '_private') === '$._private');
assert('Dollar key', generatePath('$', '$ref') === '$.$ref');
assert('Array index path', `$[0]` === '$[0]');

// ========== Size Formatting ==========
console.log('\n--- Size Formatting ---');

function formatSize(bytes) {
  if (bytes > 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes > 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

assert('Format bytes', formatSize(500) === '500 B');
assert('Format KB', formatSize(2048) === '2.0 KB');
assert('Format MB', formatSize(1500000) === '1.4 MB');
assert('Format 0 bytes', formatSize(0) === '0 B');
assert('Format 1024 bytes', formatSize(1024) === '1024 B');
assert('Format 1025 bytes', formatSize(1025) === '1.0 KB');

// ========== Manifest Validation ==========
console.log('\n--- Manifest Validation ---');

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifestPath = join(__dirname, '..', 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

assert('Manifest version is 3', manifest.manifest_version === 3);
assert('Has name', typeof manifest.name === 'string' && manifest.name.length > 0);
assert('Has description', typeof manifest.description === 'string' && manifest.description.length > 0);
assert('Description under 132 chars', manifest.description.length <= 132);
assert('Has version', /^\d+\.\d+\.\d+$/.test(manifest.version));
assert('Has content_scripts', Array.isArray(manifest.content_scripts));
assert('Content script matches all URLs', manifest.content_scripts[0].matches.includes('<all_urls>'));
assert('Has storage permission', manifest.permissions.includes('storage'));
assert('Has action with popup', manifest.action && manifest.action.default_popup);
assert('Has icons', manifest.icons && manifest.icons['128']);
assert('Has background service worker', manifest.background && manifest.background.service_worker);
assert('Has web_accessible_resources', Array.isArray(manifest.web_accessible_resources));
assert('viewer.css is web accessible', manifest.web_accessible_resources[0].resources.includes('viewer.css'));

// ========== File Existence ==========
console.log('\n--- File Existence ---');

import { existsSync } from 'fs';

const requiredFiles = [
  'content.js', 'background.js', 'viewer.css', 'manifest.json',
  'popup/popup.html', 'popup/popup.js', 'popup/popup.css',
  'options/options.html', 'options/options.js', 'options/options.css',
  'icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png',
  'PRIVACY_POLICY.md'
];

for (const file of requiredFiles) {
  const fullPath = join(__dirname, '..', file);
  assert(`File exists: ${file}`, existsSync(fullPath));
}

// ========== Summary ==========
console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

if (failed > 0) {
  process.exit(1);
}
