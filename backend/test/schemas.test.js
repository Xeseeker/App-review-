const test = require("node:test");
const assert = require("node:assert/strict");
const { appInput, searchCode } = require("../src/schemas/appSchemas");
const { normalizeApp } = require("../src/utils/appNormalizer");

const validApp = {
  name: "Example App",
  search_code: "game-25",
  description: "A valid description.",
  play_store_url:
    "https://play.google.com/store/apps/details?id=com.example.app",
};

test("normalizes valid search codes", () => {
  assert.equal(searchCode.parse(" game-25 "), "GAME-25");
});

test("defaults new apps to published state", () => {
  assert.equal(
    normalizeApp({ ...validApp, status: undefined }).status,
    "published",
  );
  assert.equal(normalizeApp({ ...validApp, status: "draft" }).status, "draft");
});

test("rejects unsupported outbound URLs", () => {
  assert.equal(
    appInput.safeParse({
      ...validApp,
      play_store_url: "https://google.example.com/store/apps/details?id=x",
    }).success,
    false,
  );
});
