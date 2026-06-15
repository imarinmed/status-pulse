-- Add per-commit line change tracking for contributor impact metrics.

ALTER TABLE commits
  ADD COLUMN IF NOT EXISTS additions INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deletions INTEGER NOT NULL DEFAULT 0;
