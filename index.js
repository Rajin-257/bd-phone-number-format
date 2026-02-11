"use strict";

const MOBILE_LOCAL_REGEX = /^01[3-9]\d{8}$/;

const REASON_CODES = Object.freeze({
  REQUIRED: "REQUIRED",
  LETTER_NOT_ALLOWED: "LETTER_NOT_ALLOWED",
  INVALID_PLUS_POSITION: "INVALID_PLUS_POSITION",
  MISSING_DIGITS: "MISSING_DIGITS",
  UNSUPPORTED_COUNTRY_CODE: "UNSUPPORTED_COUNTRY_CODE",
  INVALID_LENGTH: "INVALID_LENGTH",
  INVALID_START: "INVALID_START",
  INVALID_OPERATOR_CODE: "INVALID_OPERATOR_CODE",
  UNSUPPORTED_OPERATOR: "UNSUPPORTED_OPERATOR",
  OPERATOR_MISMATCH: "OPERATOR_MISMATCH"
});

const OPERATOR_NAME_BY_CODE = Object.freeze({
  "13": "grameenphone",
  "14": "banglalink",
  "15": "teletalk",
  "16": "airtel",
  "17": "grameenphone",
  "18": "robi",
  "19": "banglalink"
});

const OPERATOR_DISPLAY_BY_KEY = Object.freeze({
  grameenphone: "Grameenphone",
  airtel: "Airtel",
  robi: "Robi",
  banglalink: "Banglalink",
  teletalk: "Teletalk",
  robi_group: "Robi Group"
});

const OPERATOR_ALIASES = Object.freeze({
  gp: "grameenphone",
  grameenphone: "grameenphone",
  robi: "robi",
  airtel: "airtel",
  "robi airtel": "robi_group",
  "airtel robi": "robi_group",
  "robi group": "robi_group",
  robigroup: "robi_group",
  "robi-airtel": "robi_group",
  "airtel group": "robi_group",
  banglalink: "banglalink",
  bl: "banglalink",
  teletalk: "teletalk",
  tt: "teletalk"
});

function invalid(input, reason, reasonCode) {
  return {
    isValid: false,
    input: input == null ? "" : String(input),
    reason,
    reasonCode
  };
}

function toInputString(input) {
  return input == null ? "" : String(input);
}

function toCleanDigits(input) {
  return toInputString(input).replace(/\D/g, "");
}

function normalizeOperatorName(operatorName) {
  if (typeof operatorName !== "string") {
    return null;
  }

  const normalized = operatorName
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  return OPERATOR_ALIASES[normalized] || null;
}

function operatorLabelFromKey(operatorKey) {
  if (!operatorKey) {
    return null;
  }

  return OPERATOR_DISPLAY_BY_KEY[operatorKey] || null;
}

function operatorMatchesExpected(expectedOperatorKey, detectedOperatorKey) {
  if (expectedOperatorKey === "robi_group") {
    return detectedOperatorKey === "robi" || detectedOperatorKey === "airtel";
  }

  return expectedOperatorKey === detectedOperatorKey;
}

function resolveOperator(operatorCode) {
  const key = OPERATOR_NAME_BY_CODE[operatorCode];
  if (!key) {
    return null;
  }

  return operatorLabelFromKey(key);
}

function parseNonNegativeInteger(value, fieldName) {
  if (value == null) {
    return 0;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${fieldName} must be a non-negative integer.`);
  }

  return value;
}

function getTransformBase(result, base) {
  const selectedBase = base || "local";

  switch (selectedBase) {
    case "local":
      return result.local;
    case "core":
      return result.local.slice(1);
    case "international":
      return result.international;
    default:
      throw new Error("Unsupported base. Use one of: local, core, international.");
  }
}

function toLocalCandidate(input, options) {
  if (input == null) {
    return invalid(input, "Phone number is required.", REASON_CODES.REQUIRED);
  }

  const raw = String(input).trim();
  if (!raw) {
    return invalid(input, "Phone number is required.", REASON_CODES.REQUIRED);
  }

  if (/[A-Za-z]/.test(raw)) {
    return invalid(input, "Phone number cannot contain letters.", REASON_CODES.LETTER_NOT_ALLOWED);
  }

  const plusMatches = raw.match(/\+/g);
  const plusCount = plusMatches ? plusMatches.length : 0;
  if (plusCount > 1 || (plusCount === 1 && !raw.startsWith("+"))) {
    return invalid(
      input,
      "Plus sign is only allowed once at the beginning.",
      REASON_CODES.INVALID_PLUS_POSITION
    );
  }

  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return invalid(input, "Phone number must contain digits.", REASON_CODES.MISSING_DIGITS);
  }

  let local;

  if (raw.startsWith("+")) {
    if (!digits.startsWith("880")) {
      return invalid(
        input,
        "Only Bangladesh country code +880 is supported.",
        REASON_CODES.UNSUPPORTED_COUNTRY_CODE
      );
    }
    local = `0${digits.slice(3)}`;
  } else if (digits.startsWith("00880")) {
    local = `0${digits.slice(5)}`;
  } else if (digits.startsWith("880")) {
    local = `0${digits.slice(3)}`;
  } else if (digits.startsWith("0")) {
    local = digits;
  } else if (options.allowMissingLeadingZero && /^1\d{9}$/.test(digits)) {
    local = `0${digits}`;
  } else {
    local = digits;
  }

  if (local.length !== 11) {
    return invalid(
      input,
      "Bangladesh mobile numbers must be 11 digits in local format.",
      REASON_CODES.INVALID_LENGTH
    );
  }

  if (!/^01\d{9}$/.test(local)) {
    return invalid(
      input,
      "Bangladesh mobile numbers must start with 01.",
      REASON_CODES.INVALID_START
    );
  }

  if (!MOBILE_LOCAL_REGEX.test(local)) {
    return invalid(
      input,
      "Invalid Bangladesh mobile operator code.",
      REASON_CODES.INVALID_OPERATOR_CODE
    );
  }

  return {
    isValid: true,
    input: raw,
    local
  };
}

function buildValidResult(base) {
  const local = base.local;
  const core = local.slice(1);
  const operatorCode = local.slice(1, 3);
  const operatorKey = OPERATOR_NAME_BY_CODE[operatorCode] || null;
  const operator = resolveOperator(operatorCode);

  return {
    isValid: true,
    input: base.input,
    local,
    international: `880${core}`,
    e164: `+880${core}`,
    pretty: `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`,
    masked: `${local.slice(0, 3)}****${local.slice(7)}`,
    operatorCode,
    operatorKey,
    operator
  };
}

function validateBdPhoneNumber(input, options = {}) {
  const expectedOperatorKey =
    options.expectedOperator == null ? null : normalizeOperatorName(options.expectedOperator);

  if (options.expectedOperator != null && !expectedOperatorKey) {
    return invalid(
      input,
      "Unsupported operator. Use one of: Grameenphone, Airtel, Robi, Banglalink, Teletalk, Robi Group.",
      REASON_CODES.UNSUPPORTED_OPERATOR
    );
  }

  const candidate = toLocalCandidate(input, {
    allowMissingLeadingZero: options.allowMissingLeadingZero !== false
  });

  if (!candidate.isValid) {
    return candidate;
  }

  const result = buildValidResult(candidate);

  if (expectedOperatorKey) {
    if (!operatorMatchesExpected(expectedOperatorKey, result.operatorKey)) {
      return invalid(
        result.input,
        `Phone number operator mismatch. Expected ${operatorLabelFromKey(expectedOperatorKey)}.`,
        REASON_CODES.OPERATOR_MISMATCH
      );
    }
  }

  return result;
}

function isValidBdPhoneNumber(input, options = {}) {
  return validateBdPhoneNumber(input, options).isValid;
}

function formatBdPhoneNumber(input, format = "local", options = {}) {
  const result = validateBdPhoneNumber(input, options);
  if (!result.isValid) {
    return null;
  }

  switch (format) {
    case "local":
      return result.local;
    case "international":
      return result.international;
    case "e164":
      return result.e164;
    case "pretty":
      return result.pretty;
    case "masked":
      return result.masked;
    default:
      throw new Error(
        "Unsupported format. Use one of: local, international, e164, pretty, masked."
      );
  }
}

function normalizeBdPhoneNumber(input, options = {}) {
  const format = options.format || "e164";
  return formatBdPhoneNumber(input, format, options);
}

function parseBdPhoneNumber(input, options = {}) {
  const validated = validateBdPhoneNumber(input, options);

  if (!validated.isValid) {
    return {
      input: toInputString(input),
      cleaned: toCleanDigits(input),
      isValid: false,
      e164: null,
      national: null,
      carrierGuess: null,
      reasonCode: validated.reasonCode,
      reason: validated.reason
    };
  }

  return {
    input: toInputString(input),
    cleaned: validated.local,
    isValid: true,
    e164: validated.e164,
    national: validated.local,
    carrierGuess: validated.operator,
    reasonCode: null,
    reason: null
  };
}

function customizeBdPhoneNumber(input, options = {}) {
  const result = validateBdPhoneNumber(input, options);
  if (!result.isValid) {
    return null;
  }

  const removeFromStart = parseNonNegativeInteger(options.removeFromStart, "removeFromStart");
  const removeFromEnd = parseNonNegativeInteger(options.removeFromEnd, "removeFromEnd");

  const baseValue = getTransformBase(result, options.base);
  if (removeFromStart + removeFromEnd >= baseValue.length) {
    throw new Error("Cannot remove all digits. Decrease removeFromStart/removeFromEnd.");
  }

  const trimmed = baseValue.slice(removeFromStart, baseValue.length - removeFromEnd);
  const prefix = options.prefix == null ? "" : String(options.prefix);
  const separator = options.separator == null ? "" : String(options.separator);
  const suffix = options.suffix == null ? "" : String(options.suffix);
  const suffixSeparator = options.suffixSeparator == null ? "" : String(options.suffixSeparator);

  let transformed;
  if (prefix && separator) {
    transformed = `${prefix}${separator}${trimmed}`;
  } else {
    transformed = `${prefix}${trimmed}`;
  }

  if (suffix && suffixSeparator) {
    return `${transformed}${suffixSeparator}${suffix}`;
  }

  return `${transformed}${suffix}`;
}

function refactorBdPhoneNumber(input, options = {}) {
  return customizeBdPhoneNumber(input, options);
}

function getBdPhoneOperator(input, options = {}) {
  const result = validateBdPhoneNumber(input, options);
  if (!result.isValid) {
    return null;
  }

  return result.operator;
}

function isBdPhoneOperator(input, operatorName, options = {}) {
  const expectedOperatorKey = normalizeOperatorName(operatorName);
  if (!expectedOperatorKey) {
    throw new Error(
      "Unsupported operator. Use one of: Grameenphone, Airtel, Robi, Banglalink, Teletalk, Robi Group."
    );
  }

  const validated = validateBdPhoneNumber(input, options);
  if (!validated.isValid) {
    return false;
  }

  return operatorMatchesExpected(expectedOperatorKey, validated.operatorKey);
}

module.exports = {
  REASON_CODES,
  validateBdPhoneNumber,
  isValidBdPhoneNumber,
  formatBdPhoneNumber,
  normalizeBdPhoneNumber,
  parseBdPhoneNumber,
  customizeBdPhoneNumber,
  refactorBdPhoneNumber,
  getBdPhoneOperator,
  isBdPhoneOperator
};
