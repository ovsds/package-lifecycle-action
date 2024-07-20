export const parseBoolean = (value: string): boolean => {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`Invalid boolean value: ${value}`);
};

export const parseNumber = (value: string): number => {
  const number = parseInt(value, 10);
  if (isNaN(number)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return number;
};

const validateNonNegative = (value: number): void => {
  if (value < 0) {
    throw new Error(`Invalid ${value}, must be >= 0`);
  }
};

export const parseNonNegativeNumber = (value: string): number => {
  const number = parseNumber(value);
  validateNonNegative(number);
  return number;
};

export const parseNonEmptyString = (value: string | undefined): string => {
  if (!value) {
    throw new Error(`Invalid ${value}, must be a non-empty string`);
  }
  if (value.trim() === "") {
    throw new Error(`Invalid ${value}, must be a non-empty string`);
  }
  return value;
};
