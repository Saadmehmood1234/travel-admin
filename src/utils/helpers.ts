
export function parseCurrencyValue(currencyString: string): number {
  const numericString = currencyString.replace(/[^\d.]/g, '');
  return parseFloat(numericString) || 0;
}