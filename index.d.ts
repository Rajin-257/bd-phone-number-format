export type BdPhoneFormat = "local" | "international" | "e164" | "pretty" | "masked";

export interface BdPhoneOptions {
  allowMissingLeadingZero?: boolean;
  format?: BdPhoneFormat;
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
