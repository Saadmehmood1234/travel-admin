// utils/helpers.ts
export function parseCurrencyValue(currencyString: string): number {
  // Remove any non-digit characters except decimal point
  const numericString = currencyString.replace(/[^\d.]/g, '');
  return parseFloat(numericString) || 0;
}