export const parseNumberInput = (value: string, fieldName: string): number => {
  if (!value) throw new Error(`${fieldName} cannot be empty`);

  const parsed = Number(value);
  if (isNaN(parsed) || !Number.isInteger(parsed)) {
    throw new Error(`${fieldName} must be a valid integer`);
  }
  if (parsed < 0) throw new Error(`${fieldName} must be non-negative`);
  if (parsed > Number.MAX_SAFE_INTEGER) {
    throw new Error(`${fieldName} exceeds maximum safe integer value`);
  }

  return parsed;
};
