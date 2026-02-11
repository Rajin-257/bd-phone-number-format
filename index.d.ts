export type BdPhoneFormat = "local" | "international" | "e164" | "pretty" | "masked";
export type BdPhoneTransformBase = "local" | "core" | "international";

export type BdOperator = "Grameenphone" | "Airtel" | "Robi" | "Banglalink" | "Teletalk";
export type BdOperatorKey = "grameenphone" | "airtel" | "robi" | "banglalink" | "teletalk";
export type BdOperatorAlias =
  | "gp"
  | "bl"
  | "tt"
  | "grameenphone"
  | "airtel"
  | "robi"
  | "banglalink"
  | "teletalk"
  | "robi airtel"
  | "airtel robi"
  | "robi group"
  | "robigroup"
  | "robi-airtel"
  | "airtel group";

export type BdExpectedOperator = BdOperator | BdOperatorAlias | "Robi Group";

export declare const REASON_CODES: {
  readonly REQUIRED: "REQUIRED";
  readonly LETTER_NOT_ALLOWED: "LETTER_NOT_ALLOWED";
  readonly INVALID_PLUS_POSITION: "INVALID_PLUS_POSITION";
  readonly MISSING_DIGITS: "MISSING_DIGITS";
  readonly UNSUPPORTED_COUNTRY_CODE: "UNSUPPORTED_COUNTRY_CODE";
  readonly INVALID_LENGTH: "INVALID_LENGTH";
  readonly INVALID_START: "INVALID_START";
  readonly INVALID_OPERATOR_CODE: "INVALID_OPERATOR_CODE";
  readonly UNSUPPORTED_OPERATOR: "UNSUPPORTED_OPERATOR";
  readonly OPERATOR_MISMATCH: "OPERATOR_MISMATCH";
};

export type BdPhoneReasonCode = (typeof REASON_CODES)[keyof typeof REASON_CODES];

export interface BdPhoneOptions {
  allowMissingLeadingZero?: boolean;
  format?: BdPhoneFormat;
  expectedOperator?: BdExpectedOperator;
}

export interface BdPhoneTransformOptions extends BdPhoneOptions {
  base?: BdPhoneTransformBase;
  removeFromStart?: number;
  removeFromEnd?: number;
  prefix?: string;
  separator?: string;
  suffix?: string;
  suffixSeparator?: string;
}

export interface BdPhoneValidationFailure {
  isValid: false;
  input: string;
  reason: string;
  reasonCode: BdPhoneReasonCode;
}

export interface BdPhoneValidationSuccess {
  isValid: true;
  input: string;
  local: string;
  international: string;
  e164: string;
  pretty: string;
  masked: string;
  operatorCode: string;
  operatorKey: BdOperatorKey | null;
  operator: BdOperator | null;
}

export type BdPhoneValidationResult = BdPhoneValidationSuccess | BdPhoneValidationFailure;

export interface BdPhoneParseResult {
  input: string;
  cleaned: string;
  isValid: boolean;
  e164: string | null;
  national: string | null;
  carrierGuess: BdOperator | null;
  reasonCode: BdPhoneReasonCode | null;
  reason: string | null;
}

export function validateBdPhoneNumber(
  input: string | number | null | undefined,
  options?: BdPhoneOptions
): BdPhoneValidationResult;

export function isValidBdPhoneNumber(
  input: string | number | null | undefined,
  options?: BdPhoneOptions
): boolean;

export function formatBdPhoneNumber(
  input: string | number | null | undefined,
  format?: BdPhoneFormat,
  options?: BdPhoneOptions
): string | null;

export function normalizeBdPhoneNumber(
  input: string | number | null | undefined,
  options?: BdPhoneOptions
): string | null;

export function parseBdPhoneNumber(
  input: string | number | null | undefined,
  options?: BdPhoneOptions
): BdPhoneParseResult;

export function getBdPhoneOperator(
  input: string | number | null | undefined,
  options?: BdPhoneOptions
): BdOperator | null;

export function isBdPhoneOperator(
  input: string | number | null | undefined,
  operatorName: BdExpectedOperator,
  options?: BdPhoneOptions
): boolean;

export function customizeBdPhoneNumber(
  input: string | number | null | undefined,
  options?: BdPhoneTransformOptions
): string | null;

export function refactorBdPhoneNumber(
  input: string | number | null | undefined,
  options?: BdPhoneTransformOptions
): string | null;
