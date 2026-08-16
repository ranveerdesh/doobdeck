function getInviteCodes(): string[] {
  const raw = process.env.INVITE_CODES ?? "";
  return raw.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
}

export function isValidInviteCode(code: string): boolean {
  return getInviteCodes().includes(code);
}

export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase();
}
