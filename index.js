"use strict";

const MOBILE_LOCAL_REGEX = /^01[3-9]\d{8}$/;

function invalid(input, reason) {
  return {
    isValid: false,
    input: input == null ? "" : String(input),
    reason
  };
}

function toLocalCandidate(input, options) {
  if (input == null) {
    return invalid(input, "Phone number is required.");
  }

  const raw = String(input).trim();
  if (!raw) {
    return invalid(input, "Phone number is required.");
  }

  if (/[A-Za-z]/.test(raw)) {
    return invalid(input, "Phone number cannot contain letters.");
  }

  const plusMatches = raw.match(/\+/g);
  const plusCount = plusMatches ? plusMatches.length : 0;
  if (plusCount > 1 || (plusCount === 1 && !raw.startsWith("+"))) {
    return invalid(input, "Plus sign is only allowed once at the beginning.");
  }

  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return invalid(input, "Phone number must contain digits.");
  }

  let local;

  if (raw.startsWith("+")) {
    if (!digits.startsWith("880")) {
      return invalid(input, "Only Bangladesh country code +880 is supported.");
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
    return invalid(input, "Bangladesh mobile numbers must be 11 digits in local format.");
  }

  if (!/^01\d{9}$/.test(local)) {
    return invalid(input, "Bangladesh mobile numbers must start with 01.");
  }

  if (!MOBILE_LOCAL_REGEX.test(local)) {
    return invalid(input, "Invalid Bangladesh mobile operator code.");
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

  return {
    isValid: true,
    input: base.input,
    local,
    international: `880${core}`,
    e164: `+880${core}`,
    pretty: `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`,
    masked: `${local.slice(0, 3)}****${local.slice(7)}`,
    operatorCode: local.slice(1, 3)
  };
}

function validateBdPhoneNumber(input, options = {}) {
  const candidate = toLocalCandidate(input, {
    allowMissingLeadingZero: options.allowMissingLeadingZero !== false
  });

  if (!candidate.isValid) {
    return candidate;
  }

  return buildValidResult(candidate);
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

module.exports = {
  validateBdPhoneNumber,
  isValidBdPhoneNumber,
  formatBdPhoneNumber,
  normalizeBdPhoneNumber
};
