export type BdPhoneFormat = "local" | "international" | "e164" | "pretty" | "masked";
export type BdOperator = "Grameenphone" | "Robi" | "Banglalink" | "Teletalk";
export type BdPhoneTransformBase = "local" | "core" | "international";

export interface BdPhoneOptions {
  allowMissingLeadingZero?: boolean;
  format?: BdPhoneFormat;
  expectedOperator?: BdOperator | string;
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
  operator: BdOperator | null;
}

export type BdPhoneValidationResult = BdPhoneValidationSuccess | BdPhoneValidationFailure;

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

export function getBdPhoneOperator(
  input: string | number | null | undefined,
  options?: BdPhoneOptions
): BdOperator | null;

export function isBdPhoneOperator(
  input: string | number | null | undefined,
  operatorName: string,
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
