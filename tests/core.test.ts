import { describe, it, expect } from 'vitest';
import { formatSize, generatePath, isUrl } from '../entrypoints/content';

// ========== JSON Detection ==========
describe('JSON parsing', () => {
  function tryParseJson(text: string) {
    try { return JSON.parse(text); }
    catch { return null; }
  }

  it('parses simple object', () => expect(tryParseJson('{"key": "value"}')).not.toBeNull());
  it('parses nested object', () => expect(tryParseJson('{"a": {"b": {"c": 1}}}')).not.toBeNull());
  it('parses array', () => expect(tryParseJson('[1, 2, 3]')).not.toBeNull());
  it('parses empty object', () => expect(tryParseJson('{}')).not.toBeNull());
  it('parses empty array', () => expect(tryParseJson('[]')).not.toBeNull());
  it('parses string', () => expect(tryParseJson('"hello"')).toBe('hello'));
  it('parses number', () => expect(tryParseJson('42')).toBe(42));
  it('parses boolean true', () => expect(tryParseJson('true')).toBe(true));
  it('parses boolean false', () => expect(tryParseJson('false')).toBe(false));
  it('parses null', () => expect(tryParseJson('null')).toBeNull());
  it('rejects plain text', () => expect(tryParseJson('hello world')).toBeNull());
  it('rejects HTML', () => expect(tryParseJson('<html></html>')).toBeNull());
  it('rejects incomplete JSON', () => expect(tryParseJson('{"key":')).toBeNull());
  it('rejects trailing comma', () => expect(tryParseJson('{"a": 1,}')).toBeNull());
  it('rejects single quotes', () => expect(tryParseJson("{'a': 1}")).toBeNull());

  it('parses 1000-key object', () => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < 1000; i++) obj['key' + i] = 'value' + i;
    expect(tryParseJson(JSON.stringify(obj))).not.toBeNull();
  });

  it('parses unicode escapes', () => expect(tryParseJson('{"emoji": "\\u2764"}')).not.toBeNull());
  it('parses actual unicode', () => expect(tryParseJson('{"emoji": "\u2764"}')).not.toBeNull());
});

// ========== URL Detection ==========
describe('URL detection', () => {
  it('detects http URL', () => expect(isUrl('http://example.com')).toBe(true));
  it('detects https URL', () => expect(isUrl('https://api.github.com/repos')).toBe(true));
  it('detects URL with path', () => expect(isUrl('https://example.com/path/to/resource')).toBe(true));
  it('rejects plain string', () => expect(isUrl('not a url')).toBe(false));
  it('rejects ftp', () => expect(isUrl('ftp://files.example.com')).toBe(false));
  it('rejects data URI', () => expect(isUrl('data:text/plain;base64,')).toBe(false));
  it('rejects javascript URI', () => expect(isUrl('javascript:alert(1)')).toBe(false));
});

// ========== Path Generation ==========
describe('path generation', () => {
  it('simple key', () => expect(generatePath('$', 'name')).toBe('$.name'));
  it('nested key', () => expect(generatePath('$.user', 'email')).toBe('$.user.email'));
  it('key with spaces', () => expect(generatePath('$', 'full name')).toBe('$["full name"]'));
  it('key with dots', () => expect(generatePath('$', 'a.b')).toBe('$["a.b"]'));
  it('key starting with number', () => expect(generatePath('$', '0key')).toBe('$["0key"]'));
  it('key with dashes', () => expect(generatePath('$', 'foo-bar')).toBe('$["foo-bar"]'));
  it('underscore key', () => expect(generatePath('$', '_private')).toBe('$._private'));
  it('dollar key', () => expect(generatePath('$', '$ref')).toBe('$.$ref'));
});

// ========== Size Formatting ==========
describe('size formatting', () => {
  it('formats bytes', () => expect(formatSize(500)).toBe('500 B'));
  it('formats KB', () => expect(formatSize(2048)).toBe('2.0 KB'));
  it('formats MB', () => expect(formatSize(1500000)).toBe('1.4 MB'));
  it('formats 0 bytes', () => expect(formatSize(0)).toBe('0 B'));
  it('formats 1024 bytes', () => expect(formatSize(1024)).toBe('1024 B'));
  it('formats 1025 bytes', () => expect(formatSize(1025)).toBe('1.0 KB'));
});
