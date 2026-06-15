/**
 * Identity helpers for highlighting Iñaki Marin's (imarin) contributions
 * across the Status Pulse dashboard.
 */

export const IMARIN_PROFILE = {
  handle: "imarin",
  displayName: "Iñaki Marin",
  email: "ignacio.marin@marem.io",
  initials: "IM",
  role: "Lead Engineer · CMC Metrics",
} as const;

export const FOCUS_REPO_SLUGS = [
  "rdu-ai-cmc-metrics-api",
  "rdu-ai-cmc-metrics-ui",
] as const;

export type FocusRepoSlug = (typeof FOCUS_REPO_SLUGS)[number];

export function isImarin(
  authorEmail: string | null | undefined,
  authorName?: string | null
): boolean {
  if (authorEmail && authorEmail.toLowerCase() === IMARIN_PROFILE.email) {
    return true;
  }
  if (authorName && /i[ñn]aki\s+marin/i.test(authorName)) {
    return true;
  }
  return false;
}

export function isFocusRepo(slug: string | null | undefined): slug is FocusRepoSlug {
  if (!slug) return false;
  return (FOCUS_REPO_SLUGS as readonly string[]).includes(slug);
}

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

export function commitTitle(message: string): string {
  return message.split("\n")[0] ?? message;
}
