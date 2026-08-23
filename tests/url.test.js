import test from "node:test";
import assert from "node:assert/strict";
import { normalizeUrl } from "../src/url.js";

test("adds HTTPS when a protocol is omitted", () => {
  assert.equal(normalizeUrl("example.com"), "https://example.com/");
});

test("keeps an explicit HTTP address", () => {
  assert.equal(normalizeUrl("http://example.com/path"), "http://example.com/path");
});

test("keeps paths, queries and fragments", () => {
  assert.equal(normalizeUrl("example.com/a?b=1#c"), "https://example.com/a?b=1#c");
});

test("rejects empty and unsupported addresses", () => {
  assert.throws(() => normalizeUrl(""), /Enter a web address/);
  assert.throws(() => normalizeUrl("mailto:test@example.com"), /valid web address/);
});
