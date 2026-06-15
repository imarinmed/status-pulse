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

/**
 * Returns a stable calendar-day key (YYYY-MM-DD) in UTC for grouping
 * commit activity into discrete days.
 */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns the ISO 8601 week key for a timestamp as `YYYY-Www`
 * (e.g. `2026-W12`). Uses UTC to avoid timezone drift between
 * server and client renders.
 */
export function isoWeekKey(iso: string): string {
  const date = new Date(
    Date.UTC(
      new Date(iso).getUTCFullYear(),
      new Date(iso).getUTCMonth(),
      new Date(iso).getUTCDate()
    )
  );
  // Shift to Thursday of the current ISO week so the year matches.
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const weekNo = Math.ceil(((date.getTime() - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
}

/**
 * Returns the UTC Monday (start of ISO week) for a timestamp.
 * Useful for aligning week buckets onto a continuous timeline.
 */
export function isoWeekStart(iso: string): Date {
  const d = new Date(iso);
  const utc = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
  const day = utc.getUTCDay() || 7; // Sun=0 -> 7
  utc.setUTCDate(utc.getUTCDate() - (day - 1));
  return utc;
}

/** Compact `MMM d` label for a Date (e.g. `Mar 4`). */
export function shortWeekLabel(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
