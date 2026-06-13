-- Adds English columns to the offices table and backfills English city/address values.
-- Safe to run multiple times: columns use IF NOT EXISTS, and the UPDATEs only touch
-- rows where the English value is still empty (so anything you already filled by hand
-- — e.g. Kyiv — is left untouched).

ALTER TABLE offices ADD COLUMN IF NOT EXISTS city_en text;
ALTER TABLE offices ADD COLUMN IF NOT EXISTS address_en text;

-- Backfill English city names (matched on the Ukrainian name)
UPDATE offices SET city_en = 'Kyiv'          WHERE city_ua = 'Київ'          AND (city_en IS NULL OR city_en = '');
UPDATE offices SET city_en = 'Odesa'         WHERE city_ua = 'Одеса'         AND (city_en IS NULL OR city_en = '');
UPDATE offices SET city_en = 'Lviv'          WHERE city_ua = 'Львів'         AND (city_en IS NULL OR city_en = '');
UPDATE offices SET city_en = 'Kharkiv'       WHERE city_ua = 'Харків'        AND (city_en IS NULL OR city_en = '');
UPDATE offices SET city_en = 'Dnipro'        WHERE city_ua = 'Дніпро'        AND (city_en IS NULL OR city_en = '');
UPDATE offices SET city_en = 'Vinnytsia'     WHERE city_ua = 'Вінниця'       AND (city_en IS NULL OR city_en = '');
UPDATE offices SET city_en = 'Uzhhorod'      WHERE city_ua = 'Ужгород'       AND (city_en IS NULL OR city_en = '');
UPDATE offices SET city_en = 'Kropyvnytskyi' WHERE city_ua = 'Кропивницький' AND (city_en IS NULL OR city_en = '');

-- Backfill English addresses
UPDATE offices SET address_en = '11 Holosiivska St.'            WHERE city_ua = 'Київ'          AND (address_en IS NULL OR address_en = '');
UPDATE offices SET address_en = '23 Chornomorskoho Kozatstva St.' WHERE city_ua = 'Одеса'       AND (address_en IS NULL OR address_en = '');
UPDATE offices SET address_en = '129A Pasichna St.'            WHERE city_ua = 'Львів'         AND (address_en IS NULL OR address_en = '');
UPDATE offices SET address_en = '25 Nauky Ave.'               WHERE city_ua = 'Харків'        AND (address_en IS NULL OR address_en = '');
UPDATE offices SET address_en = '53b Zaporizke Hwy.'          WHERE city_ua = 'Дніпро'        AND (address_en IS NULL OR address_en = '');
UPDATE offices SET address_en = '94 Nemyrivske Hwy.'          WHERE city_ua = 'Вінниця'       AND (address_en IS NULL OR address_en = '');
UPDATE offices SET address_en = '5 Mytraka St.'               WHERE city_ua = 'Ужгород'       AND (address_en IS NULL OR address_en = '');
UPDATE offices SET address_en = '33/32 Akademika Tamma St.'    WHERE city_ua = 'Кропивницький' AND (address_en IS NULL OR address_en = '');
