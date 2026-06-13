-- Renames all Ukrainian "_uk" columns/keys to "_ua" to match the code.
-- Idempotent and safe: each rename only runs if the old column still exists,
-- so re-running (or running on a DB that already has some renamed) is harmless.
-- RUN THIS ONCE in the Supabase SQL Editor — until it runs, Ukrainian content
-- will be missing on the site (the code now reads *_ua, the DB still has *_uk).

DO $$
DECLARE
  r record;
  renames text[][] := ARRAY[
    -- table,        old column,       new column
    ['cars',     'description_uk', 'description_ua'],
    ['banners',  'title_uk',       'title_ua'],
    ['banners',  'subtitle_uk',    'subtitle_ua'],
    ['reviews',  'title_uk',       'title_ua'],
    ['offices',  'city_uk',        'city_ua'],
    ['offices',  'address_uk',     'address_ua']
  ];
  i int;
BEGIN
  FOR i IN 1 .. array_length(renames, 1) LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = renames[i][1] AND column_name = renames[i][2]
    ) THEN
      EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I',
                     renames[i][1], renames[i][2], renames[i][3]);
    END IF;
  END LOOP;
END $$;

-- model_specs stores localized labels as JSON keys inside the spec_sheet jsonb,
-- so rename the keys "name_uk" -> "name_ua" and "param_uk" -> "param_ua" in the data.
UPDATE model_specs
SET spec_sheet = REPLACE(
                   REPLACE(spec_sheet::text, '"name_uk"', '"name_ua"'),
                   '"param_uk"', '"param_ua"'
                 )::jsonb
WHERE spec_sheet::text LIKE '%_uk%';

-- English description column for cars (used by the admin "Опис (EN)" field).
ALTER TABLE cars ADD COLUMN IF NOT EXISTS description_en text DEFAULT '';
