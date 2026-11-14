/**
 * Sensitive Identifier Masking & Privacy Utilities
 * For Tomattto Food Delivery Platform
 */

/**
 * Masks Aadhaar number to standard format: XXXX-XXXX-1234
 * Preserves only the last 4 digits for privacy compliance.
 */
export function maskAadhaar(aadhaar?: string | null): string {
  if (!aadhaar) return 'XXXX-XXXX-XXXX';
  const digits = aadhaar.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `XXXX-XXXX-${digits.slice(-4)}`;
  }
  return 'XXXX-XXXX-XXXX';
}

/**
 * Masks PAN card number to standard format: XXXXX1234X
 * Standard Indian PAN format: 5 letters, 4 digits, 1 letter.
 * Masks the first 5 characters to protect taxpayer identity.
 */
export function maskPan(pan?: string | null): string {
  if (!pan) return 'XXXXX1234X';
  const clean = pan.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (clean.length === 10) {
    return `XXXXX${clean.slice(5)}`;
  }
  if (clean.length >= 4) {
    return `XXXXX${clean.slice(-4)}`;
  }
  return 'XXXXX1234X';
}

/**
 * Masks Bank Account number preserving last 4 digits: •••• •••• 1234
 */
export function maskBankAccount(account?: string | null): string {
  if (!account) return '•••• •••• ••••';
  const digits = account.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `•••• •••• ${digits.slice(-4)}`;
  }
  return '•••• •••• ••••';
}
