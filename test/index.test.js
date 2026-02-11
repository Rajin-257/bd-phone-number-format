"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateBdPhoneNumber,
  isValidBdPhoneNumber,
  formatBdPhoneNumber,
  normalizeBdPhoneNumber,
  getBdPhoneOperator,
  isBdPhoneOperator
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

test("detects mobile operator from prefix", () => {
  const gp = validateBdPhoneNumber("01712345678");
  assert.equal(gp.isValid, true);
  assert.equal(gp.operator, "Grameenphone");

  assert.equal(getBdPhoneOperator("01612345678"), "Robi");
  assert.equal(getBdPhoneOperator("01512345678"), "Teletalk");
  assert.equal(getBdPhoneOperator("01912345678"), "Banglalink");
});

test("checks expected operator through options and helper", () => {
  assert.equal(
    isValidBdPhoneNumber("01812345678", { expectedOperator: "robi" }),
    true
  );
  assert.equal(
    isValidBdPhoneNumber("01812345678", { expectedOperator: "Grameenphone" }),
    false
  );
  assert.equal(isBdPhoneOperator("01712345678", "gp"), true);
  assert.equal(isBdPhoneOperator("01712345678", "robi"), false);
});

test("throws for unsupported operator in helper", () => {
  assert.throws(() => isBdPhoneOperator("01712345678", "unknown-operator"), {
    message: /Unsupported operator/
  });
});
