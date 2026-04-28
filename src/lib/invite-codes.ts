/**
 * Valid invite codes for account creation
 * Add or remove codes as needed - they cannot contain spaces
 * This is a simple configuration; for production, consider using a database
 */
export const VALID_INVITE_CODES = [
  "DOOBDECK2024",
  "FILMMAKER",
  "STILLS",
] as const;

/**
 * Validate an invite code
 * @param code - The invite code to validate
 * @returns true if the code is valid, false otherwise
 */
export function isValidInviteCode(code: string): boolean {
  return VALID_INVITE_CODES.includes(code as any);
}

/**
 * Normalize invite code (trim whitespace and convert to uppercase)
 * @param code - The raw invite code input
 * @returns The normalized invite code
 */
export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase();
}
