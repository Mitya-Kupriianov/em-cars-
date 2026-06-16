-- ========================================
-- Electro Motors — Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ========================================
--
-- ВНИМАНИЕ ПО БЕЗОПАСНОСТИ (RLS):
-- Единственный источник правды по RLS-политикам — supabase/rls-policies.sql.
-- Запускайте этот файл, чтобы создать таблицы, а СРАЗУ ПОСЛЕ — rls-policies.sql.
-- Здесь НИКОГДА не должно быть политик вида `FOR ALL USING (TRUE)`: они дают
-- публичной роли anon полный доступ на запись/удаление по публичному ключу.
-- Модель доступа: запись — только сервер под service-role (в обход RLS),
-- анониму — лишь чтение публичного контента и вставка заявок.
-- ========================================

-- 1. Cars table
CREATE TABLE cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price_usd INTEGER NOT NULL,
  price_uah INTEGER NOT NULL DEFAULT 0,
  range_km INTEGER NOT NULL DEFAULT 0,
  battery_kwh NUMERIC(5,1) DEFAULT 0,
  power_hp INTEGER DEFAULT 0,
  acceleration_0_100 NUMERIC(3,1),
  drive_type TEXT DEFAULT 'FWD',
  trim TEXT DEFAULT '',
  body_type TEXT DEFAULT 'EV',
  color TEXT DEFAULT '',
  city_ua TEXT,
  city_ru TEXT,
  city_en TEXT,
  mileage_km INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'on_order', 'sold')),
  is_new BOOLEAN DEFAULT TRUE,
  is_visible BOOLEAN DEFAULT TRUE,
  is_promo BOOLEAN DEFAULT FALSE,
  description_ua TEXT DEFAULT '',
  description_ru TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  thumbnail TEXT DEFAULT '',
  specs JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Contact requests table
CREATE TABLE contact_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  message TEXT,
  type TEXT NOT NULL CHECK (type IN ('callback', 'test_drive', 'credit', 'general')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Admin users (uses Supabase Auth, this tracks role)
CREATE TABLE admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'manager')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Brands table
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Brand models table
CREATE TABLE brand_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, name)
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands are viewable by everyone" ON brands FOR SELECT USING (true);
CREATE POLICY "Brands are editable by admins" ON brands FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Brand models are viewable by everyone" ON brand_models FOR SELECT USING (true);
CREATE POLICY "Brand models are editable by admins" ON brand_models FOR ALL USING (auth.uid() IN (SELECT id FROM admin_users));

-- 6. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Row Level Security
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Cars: аноним видит только видимые машины; запись — только service-role.
-- (Фильтр по archived_at добавляется в supabase/rls-policies.sql, где колонка
--  уже точно существует.)
CREATE POLICY "Cars are viewable by everyone"
  ON cars FOR SELECT USING (is_visible IS NOT FALSE);

-- Contact requests: anyone can insert, only admins can read/update
CREATE POLICY "Anyone can submit a contact request"
  ON contact_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contact requests"
  ON contact_requests FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Admins can update contact requests"
  ON contact_requests FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- Admin users: only admins see admin list
CREATE POLICY "Admins can view admin list"
  ON admin_users FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- 6. Indexes
CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_price ON cars(price_usd);
CREATE INDEX idx_contact_requests_status ON contact_requests(status);
CREATE INDEX idx_contact_requests_created ON contact_requests(created_at DESC);

-- 7. Storage bucket for car images
-- Run this separately or via Dashboard > Storage:
-- Create bucket "car-images" with public access

-- 8. Seed data (initial cars from electro-motors.top)
INSERT INTO cars (slug, brand, model, year, price_usd, price_uah, range_km, battery_kwh, power_hp, acceleration_0_100, drive_type, body_type, color, mileage_km, status, is_new, description_ua, description_ru, images, thumbnail, specs) VALUES
(
  'byd-song-plus-ev-520km-premium-2024',
  'BYD', 'Song Plus EV 520KM Premium', 2024,
  26000, 1073000, 505, 71.8, 184, 8.5,
  'FWD', 'EV', 'Grey', 0, 'in_stock', TRUE,
  'BYD Song Plus EV — сучасний електричний SUV з технологією Blade Battery. Простора кабіна, передові системи безпеки та вражаючий запас ходу.',
  'BYD Song Plus EV — современный электрический SUV с технологией Blade Battery. Просторный салон, передовые системы безопасности и впечатляющий запас хода.',
  ARRAY['https://electro-motors.top/image/cache/catalog/emfotoecar/byd/songplusev/songplusev1-1000x562.jpeg'],
  'https://electro-motors.top/image/cache/catalog/emfotoecar/byd/songplusev/songplusev1-1000x562.jpeg',
  '{"seats":5,"trunk_liters":574,"max_speed_kmh":170,"charge_time_fast":"30 хв (30-80%)","charge_time_slow":"8 год","warranty_years":3,"features":["Blade Battery","360° камера","Adaptive Cruise Control","Панорамний дах","Шкіряний салон"]}'
),
(
  'volkswagen-id4-crozz-pure-plus-2024',
  'Volkswagen', 'ID.4 Crozz Pure+', 2024,
  28500, 1176000, 550, 84.8, 204, 8.2,
  'RWD', 'EV', 'White', 0, 'in_stock', TRUE,
  'Volkswagen ID.4 Crozz — преміальний електрокросовер від німецького концерну. Відмінна якість збірки, інтуїтивний інтерфейс та великий запас ходу.',
  'Volkswagen ID.4 Crozz — премиальный электрокроссовер от немецкого концерна. Отличное качество сборки, интуитивный интерфейс и большой запас хода.',
  ARRAY['https://electro-motors.top/image/cache/catalog/electrocars/id4/vw-id4-pure-7-1000x562.jpg'],
  'https://electro-motors.top/image/cache/catalog/electrocars/id4/vw-id4-pure-7-1000x562.jpg',
  '{"seats":5,"trunk_liters":543,"max_speed_kmh":160,"charge_time_fast":"38 хв (5-80%)","charge_time_slow":"7.5 год","warranty_years":3,"features":["ID. Light","Travel Assist","Панорамний дах","Wireless CarPlay","Matrix LED"]}'
),
(
  'honda-mn-v-basic-2024',
  'Honda', 'MN-V Basic', 2024,
  18500, 763000, 480, 61.3, 163, 9.4,
  'FWD', 'EV', 'Blue', 0, 'in_stock', TRUE,
  'Honda MN-V — компактний електричний кросовер з надійною японською якістю. Ідеальний варіант для міста з хорошим запасом ходу.',
  'Honda MN-V — компактный электрический кроссовер с надёжным японским качеством. Идеальный вариант для города с хорошим запасом хода.',
  ARRAY['https://electro-motors.top/image/cache/catalog/electrocars/m-nv/mnv-base-1000x562.jpg'],
  'https://electro-motors.top/image/cache/catalog/electrocars/m-nv/mnv-base-1000x562.jpg',
  '{"seats":5,"trunk_liters":437,"max_speed_kmh":140,"charge_time_fast":"35 хв (30-80%)","charge_time_slow":"9 год","warranty_years":2,"features":["Honda Sensing","LED фари","Сенсорний дисплей 8\"","Камера заднього виду"]}'
),
(
  'zeekr-001-you-100kwh-2024',
  'Zeekr', '001 YOU 100kWh', 2024,
  42000, 1733000, 656, 100, 544, 3.8,
  'AWD', 'EV', 'Black', 0, 'in_stock', TRUE,
  'Zeekr 001 — флагманський електромобіль від преміального бренду Geely. Неймовірна динаміка, розкішний салон та максимальний запас ходу.',
  'Zeekr 001 — флагманский электромобиль от премиального бренда Geely. Невероятная динамика, роскошный салон и максимальный запас хода.',
  ARRAY['https://electro-motors.top/image/cache/catalog/electrocars/m-nv/mnv-base-1000x562.jpg'],
  'https://electro-motors.top/image/cache/catalog/electrocars/m-nv/mnv-base-1000x562.jpg',
  '{"seats":5,"trunk_liters":560,"max_speed_kmh":200,"charge_time_fast":"25 хв (10-80%)","charge_time_slow":"6.5 год","warranty_years":3,"features":["Air Suspension","Yamaha Audio 15 динаміків","Автопілот NZP","HUD дисплей","Електричні двері","Frameless двері"]}'
),
(
  'avatr-07-fwd-2025',
  'Avatr', '07 FWD', 2025,
  35000, 1444000, 621, 92, 295, 5.9,
  'FWD', 'EV', 'White', 0, 'on_order', TRUE,
  'Avatr 07 — стильний електрокросовер спільного виробництва Huawei, CATL та Changan. Технологічно насичений автомобіль з розумною системою водіння.',
  'Avatr 07 — стильный электрокроссовер совместного производства Huawei, CATL и Changan. Технологически насыщенный автомобиль с умной системой вождения.',
  ARRAY['https://electro-motors.top/image/cache/catalog/electrocars/m-nv/mnv-base-1000x562.jpg'],
  'https://electro-motors.top/image/cache/catalog/electrocars/m-nv/mnv-base-1000x562.jpg',
  '{"seats":5,"trunk_liters":530,"max_speed_kmh":180,"charge_time_fast":"20 хв (30-80%)","charge_time_slow":"7 год","warranty_years":3,"features":["Huawei ADS 2.0","Harmony OS","CATL Qilin Battery","AR HUD","23 динаміки"]}'
),
(
  'byd-seal-premium-awd-2024',
  'BYD', 'Seal Premium AWD', 2024,
  34000, 1403000, 520, 82.5, 530, 3.8,
  'AWD', 'EV', 'Silver', 0, 'in_stock', TRUE,
  'BYD Seal — спортивний електроседан з технологією Cell-to-Body. Конкурент Tesla Model 3 з кращим оснащенням за нижчою ціною.',
  'BYD Seal — спортивный электроседан с технологией Cell-to-Body. Конкурент Tesla Model 3 с лучшим оснащением по более низкой цене.',
  ARRAY['https://electro-motors.top/image/cache/catalog/emfotoecar/byd/songplusev/songplusev1-1000x562.jpeg'],
  'https://electro-motors.top/image/cache/catalog/emfotoecar/byd/songplusev/songplusev1-1000x562.jpeg',
  '{"seats":5,"trunk_liters":400,"max_speed_kmh":180,"charge_time_fast":"26 хв (30-80%)","charge_time_slow":"10 год","warranty_years":3,"features":["Cell-to-Body","iTAC","Dynaudio Audio","NFC ключ","Вентильовані сидіння"]}'
);

-- 7. Banners table (hero slider)
CREATE TABLE banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ua TEXT DEFAULT '',
  title_ru TEXT DEFAULT '',
  subtitle_ua TEXT DEFAULT '',
  subtitle_ru TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  link TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners_public_read" ON banners FOR SELECT USING (is_active = TRUE);
-- Запись только через service-role (в обход RLS). Политику FOR ALL не создаём.

-- 8. Model specs table (trim comparison sheets)
CREATE TABLE model_specs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  spec_sheet JSONB NOT NULL DEFAULT '{"trims":[],"categories":[]}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand, model)
);

ALTER TABLE model_specs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "model_specs_public_read" ON model_specs FOR SELECT USING (true);
-- Запись только через service-role (в обход RLS). Политику FOR ALL не создаём.

CREATE TRIGGER model_specs_updated_at
  BEFORE UPDATE ON model_specs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 9. Reviews (video testimonials)
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ua TEXT NOT NULL DEFAULT '',
  title_ru TEXT NOT NULL DEFAULT '',
  youtube_id TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
-- Запись только через service-role (в обход RLS). Политику FOR ALL не создаём.
