-- English title column for video reviews (used by the admin "Назва (EN)" field).
-- Safe to run multiple times.
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title_en text DEFAULT '';
