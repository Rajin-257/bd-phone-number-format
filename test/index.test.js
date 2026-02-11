"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateBdPhoneNumber,
  isValidBdPhoneNumber,
  formatBdPhoneNumber,
  normalizeBdPhoneNumber
} = require("../index");

test("accepts valid local Bangladesh mobile number", () => {
  const result = validateBdPhoneNumber("01712345678");
  assert.equal(result.isValid, true);
  assert.equal(result.local, "01712345678");
  assert.equal(result.e164, "+8801712345678");
  assert.equal(result.pretty, "017-123-45678");
});

test("accepts numbers with country code", () => {
  assert.equal(isValidBdPhoneNumber("+8801712345678"), true);
  assert.equal(isValidBdPhoneNumber("8801712345678"), true);
  assert.equal(isValidBdPhoneNumber("008801712345678"), true);
});

test("normalizes different inputs", () => {
  assert.equal(normalizeBdPhoneNumber("+880 1712-345678"), "+8801712345678");
  assert.equal(formatBdPhoneNumber("01712345678", "international"), "8801712345678");
  assert.equal(formatBdPhoneNumber("01712345678", "masked"), "017****5678");
});

test("can accept missing leading zero when enabled", () => {
  assert.equal(isValidBdPhoneNumber("1712345678"), true);
  assert.equal(
    isValidBdPhoneNumber("1712345678", { allowMissingLeadingZero: false }),
    false
  );
});

test("rejects invalid length and invalid prefixes", () => {
  assert.equal(isValidBdPhoneNumber("0171234567"), false);
  assert.equal(isValidBdPhoneNumber("02712345678"), false);
  assert.equal(isValidBdPhoneNumber("01212345678"), false);
});

test("returns reason for invalid numbers", () => {
  const result = validateBdPhoneNumber("abc01712345678");
  assert.equal(result.isValid, false);
  assert.equal(result.reason, "Phone number cannot contain letters.");
});

test("returns null for formatting invalid input", () => {
  assert.equal(formatBdPhoneNumber("016123", "e164"), null);
});

test("throws when format value is unsupported", () => {
  assert.throws(() => formatBdPhoneNumber("01712345678", "raw"), {
    message: /Unsupported format/
  });
});
