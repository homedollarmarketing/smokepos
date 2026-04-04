/**
 * Format number as UGX currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "UGX 1,000")
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return 'UGX 0';
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
