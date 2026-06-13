-- ========================================
-- Electro Motors — Batch 2: AVATR, DENZA, FCB (方程豹), Honda
-- Real specs from autohome.com.cn / official sites
-- Run in Supabase SQL Editor
-- ========================================

-- ══════════════════════════════════════════
-- AVATR 阿维塔 (6 моделей)
-- ══════════════════════════════════════════

INSERT INTO cars (slug, brand, model, year, price_usd, price_uah, range_km, battery_kwh, power_hp, acceleration_0_100, drive_type, body_type, color, mileage_km, status, is_new, description_ua, description_ru, images, thumbnail, specs) VALUES

-- 1. Avatr 06 RWD 650km
(
  'avatr-06-rwd-650km-2025',
  'Avatr', '06 RWD 650km', 2025,
  29000, 1197000, 650, 72.9, 343, 6.7,
  'RWD', 'SUV', 'White', 0, 'in_stock', TRUE,
  'Avatr 06 — компактний електричний SUV з платформою Huawei. Потужність 252 кВт, батарея CATL 72.9 кВт·г, запас ходу 650 км (CLTC). Система автопілоту Huawei ADS 4 з лідаром 192 лінії.',
  'Avatr 06 — компактный электрический SUV на платформе Huawei. Мощность 252 кВт, батарея CATL 72.9 кВт·ч, запас хода 650 км (CLTC). Система автопилота Huawei ADS 4 с лидаром 192 линии.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4625x1900x1620mm","wheelbase":"2765mm","motor_kw":252,"battery_type":"LFP CATL","platform":"800V","charge_time_fast":"30 хв (30-80%)","charge_time_slow":"7 год","warranty_years":3,"features":["Huawei ADS 4","192-лінійний лідар","Harmony OS","15.6\" центральний дисплей","Камера 360°","Підігрів сидінь","Панорамний дах","NFC ключ"]}'
),

-- 2. Avatr 06 AWD 600km
(
  'avatr-06-awd-600km-2025',
  'Avatr', '06 AWD 600km', 2025,
  35000, 1444000, 600, 72.9, 598, 3.9,
  'AWD', 'SUV', 'Black', 0, 'in_stock', TRUE,
  'Avatr 06 AWD — повнопривідна версія з подвійним мотором: передній 188 кВт + задній 252 кВт. Розгін 0-100 за 3.9 с. Huawei ADS 4 з лідаром.',
  'Avatr 06 AWD — полноприводная версия с двойным мотором: передний 188 кВт + задний 252 кВт. Разгон 0-100 за 3.9 с. Huawei ADS 4 с лидаром.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4625x1900x1620mm","wheelbase":"2765mm","motor_kw":"188+252","battery_type":"LFP CATL","platform":"800V","charge_time_fast":"25 хв (30-80%)","charge_time_slow":"7 год","warranty_years":3,"features":["Huawei ADS 4","192-лінійний лідар","Harmony OS","Двомоторний повний привід","15.6\" центральний дисплей","Камера 360°","Підігрів + вентиляція сидінь","Панорамний дах"]}'
),

-- 3. Avatr 07 RWD 650km
(
  'avatr-07-rwd-650km-2025',
  'Avatr', '07 RWD 650km', 2025,
  31000, 1279000, 650, 82.2, 343, 6.6,
  'RWD', 'SUV', 'Grey', 0, 'in_stock', TRUE,
  'Avatr 07 — середньорозмірний SUV (4825x1980x1620 мм). Мотор 252 кВт, батарея CATL 82.2 кВт·г, запас ходу 650 км. Huawei ADS 4, пневмопідвіска на Max+ версіях.',
  'Avatr 07 — среднеразмерный SUV (4825x1980x1620 мм). Мотор 252 кВт, батарея CATL 82.2 кВт·ч, запас хода 650 км. Huawei ADS 4, пневмоподвеска на Max+ версиях.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4825x1980x1620mm","wheelbase":"2940mm","motor_kw":252,"battery_type":"LFP CATL","platform":"800V","charge_time_fast":"25 хв (30-80%)","charge_time_slow":"7.5 год","warranty_years":3,"features":["Huawei ADS 4","192-лінійний лідар","Harmony OS","15.6\" центральний дисплей","Камера 360°","Підігрів сидінь","Електричний багажник","Панорамний дах"]}'
),

-- 4. Avatr 07 AWD 610km
(
  'avatr-07-awd-610km-2025',
  'Avatr', '07 AWD 610km', 2025,
  38000, 1568000, 610, 82.2, 598, 3.9,
  'AWD', 'SUV', 'Black', 0, 'in_stock', TRUE,
  'Avatr 07 AWD — повнопривідна версія з двома моторами (передній 188 кВт + задній 252 кВт). Розгін 0-100 за 3.9 с. Пневмопідвіска CDC, 27 датчиків безпеки.',
  'Avatr 07 AWD — полноприводная версия с двумя моторами (передний 188 кВт + задний 252 кВт). Разгон 0-100 за 3.9 с. Пневмоподвеска CDC, 27 датчиков безопасности.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4825x1980x1620mm","wheelbase":"2940mm","motor_kw":"188+252","battery_type":"LFP CATL","platform":"800V","charge_time_fast":"25 хв (30-80%)","charge_time_slow":"7.5 год","warranty_years":3,"features":["Huawei ADS 4","192-лінійний лідар","Пневмопідвіска CDC","Harmony OS","Двомоторний повний привід","Камера 360°","Підігрів + вентиляція сидінь","Панорамний дах","27 датчиків безпеки"]}'
),

-- 5. Avatr 11 AWD 815km
(
  'avatr-11-awd-815km-2025',
  'Avatr', '11 Max AWD 815km', 2025,
  45000, 1857000, 815, 116, 547, 3.9,
  'AWD', 'SUV', 'White', 0, 'in_stock', TRUE,
  'Avatr 11 Max — великий SUV (4895x1970x1601 мм). Батарея CATL 116 кВт·г (NMC), запас ходу 815 км. Подвійний мотор: 165+237 кВт, 800V SiC платформа, зарядка до 240 кВт.',
  'Avatr 11 Max — большой SUV (4895x1970x1601 мм). Батарея CATL 116 кВт·ч (NMC), запас хода 815 км. Двойной мотор: 165+237 кВт, 800V SiC платформа, зарядка до 240 кВт.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4895x1970x1601mm","wheelbase":"2975mm","motor_kw":"165+237","battery_type":"NMC CATL 116kWh CTP 2.0","energy_density":"190 Wh/kg","platform":"800V SiC","max_charge_kw":240,"charge_time_fast":"25 хв (30-80%)","charge_time_slow":"7 год","warranty_years":3,"features":["Huawei ADS 4","800V SiC платформа","Зарядка 240 кВт","Пневмопідвіска","Електричні двері","Масаж сидінь","HUD дисплей","Dolby Atmos аудіо","Панорамний дах"]}'
),

-- 6. Avatr 12 RWD 705km
(
  'avatr-12-rwd-705km-2026',
  'Avatr', '12 RWD 705km', 2026,
  42000, 1733000, 705, 94.5, 682, 4.5,
  'RWD', 'Sedan', 'Black', 0, 'on_order', TRUE,
  'Avatr 12 — флагманський електроседан (Cd 0.21). Два задніх мотори по 251 кВт. Батарея 94.5 кВт·г (NMC), запас ходу 705 км. 896-лінійний лідар x4, Huawei ADS, 800V 6C зарядка.',
  'Avatr 12 — флагманский электроседан (Cd 0.21). Два задних мотора по 251 кВт. Батарея 94.5 кВт·ч (NMC), запас хода 705 км. 896-линейный лидар x4, Huawei ADS, 800V 6C зарядка.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"5020x1999x1460mm","wheelbase":"3020mm","motor_kw":"251+251","battery_type":"NMC CATL 94.5kWh","platform":"800V 6C","max_charge_kw":240,"charge_time_fast":"20 хв (30-80%)","charge_time_slow":"6.5 год","warranty_years":3,"features":["896-лінійний лідар x4","Huawei ADS","800V 6C зарядка","Cd 0.21","Frameless двері","Пневмопідвіска","Dolby Atmos","AR HUD","Масаж сидінь","Електричні двері"]}'
);


-- ══════════════════════════════════════════
-- DENZA 腾势 (4 моделі)
-- ══════════════════════════════════════════

INSERT INTO cars (slug, brand, model, year, price_usd, price_uah, range_km, battery_kwh, power_hp, acceleration_0_100, drive_type, body_type, color, mileage_km, status, is_new, description_ua, description_ru, images, thumbnail, specs) VALUES

-- 1. Denza D9 EV 620km
(
  'denza-d9-ev-620km-2025',
  'Denza', 'D9 EV 620km', 2025,
  48000, 1981000, 620, 103, 490, 6.9,
  'RWD', 'Minivan', 'Black', 0, 'in_stock', TRUE,
  'Denza D9 EV — преміальний електричний мінівен від BYD. 7 місць, батарея Blade 103 кВт·г, запас ходу 620 км. 800V платформа, подвійна зарядка (двопортова) до 200 кВт, 15 хв = 243 км.',
  'Denza D9 EV — премиальный электрический минивэн от BYD. 7 мест, батарея Blade 103 кВт·ч, запас хода 620 км. 800V платформа, двойная зарядка (двухпортовая) до 200 кВт, 15 мин = 243 км.',
  ARRAY[]::TEXT[], '',
  '{"seats":7,"dimensions":"5250x1960x1920mm","wheelbase":"3110mm","motor_kw":360,"battery_type":"LFP BYD Blade 103kWh","platform":"800V","max_charge_kw":200,"charge_time_fast":"30 хв (30-80%)","charge_time_slow":"9 год","warranty_years":3,"features":["BYD Blade Battery 103kWh","800V платформа","Подвійна зарядка (2 порти)","Nappa шкіра","Масаж сидінь 1+2 ряд","Електричні розсувні двері","Холодильник","15.6\" екран 2 ряд","Тяньшень Чжи Ян (DiPilot)","Камера 360°"]}'
),

-- 2. Denza N7 AWD 630km
(
  'denza-n7-awd-630km-2025',
  'Denza', 'N7 AWD 630km', 2025,
  37000, 1527000, 630, 91.3, 530, 3.9,
  'AWD', 'SUV', 'Grey', 0, 'in_stock', TRUE,
  'Denza N7 — спортивний SUV-купе з технологіями BYD. Подвійний мотор 390 кВт / 670 Нм, батарея 91.3 кВт·г, запас ходу 630 км. 800V SiC, подвійний лідар, DiPilot.',
  'Denza N7 — спортивный SUV-купе с технологиями BYD. Двойной мотор 390 кВт / 670 Нм, батарея 91.3 кВт·ч, запас хода 630 км. 800V SiC, двойной лидар, DiPilot.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4860x1935x1602mm","wheelbase":"2940mm","motor_kw":390,"motor_torque":"670 Нм","battery_type":"BYD Blade 91.3kWh","platform":"800V SiC","charge_time_fast":"15 хв = 350 км (подвійна зарядка)","charge_time_slow":"7 год","warranty_years":3,"features":["BYD e-Platform 3.0","800V SiC платформа","Подвійний лідар","DiPilot (Тяньшень Чжи Ян B)","Пневмопідвіска","Deya Audio 16 динаміків","HUD дисплей","Камера 360°","Вентильовані сидіння"]}'
),

-- 3. Denza N8 EV 736km
(
  'denza-n8-ev-736km-2025',
  'Denza', 'N8 EV 736km', 2025,
  44000, 1816000, 736, 108.8, 313, 6.2,
  'RWD', 'SUV', 'White', 0, 'on_order', TRUE,
  'Denza N8 EV — 7-місний електричний SUV. Батарея Blade 108.8 кВт·г, запас ходу 736 км (задній привід). Повнопривідна версія: 430 кВт, 640 км. Розміри 4949x1950x1725 мм.',
  'Denza N8 EV — 7-местный электрический SUV. Батарея Blade 108.8 кВт·ч, запас хода 736 км (задний привод). Полноприводная версия: 430 кВт, 640 км. Размеры 4949x1950x1725 мм.',
  ARRAY[]::TEXT[], '',
  '{"seats":7,"dimensions":"4949x1950x1725mm","wheelbase":"2830mm","motor_kw":230,"motor_kw_awd":430,"battery_type":"LFP BYD Blade 108.8kWh","charge_time_fast":"25 хв (30-80%)","charge_time_slow":"8 год","warranty_years":3,"features":["BYD e-Platform 3.0","Blade Battery 108.8kWh","3 ряди сидінь","Електричний 3-й ряд","DiPilot","Панорамний дах","Камера 360°","Підігрів + вентиляція 1 ряд"]}'
),

-- 4. Denza N9 PHEV 1302km
(
  'denza-n9-phev-2025',
  'Denza', 'N9', 2025,
  55000, 2270000, 200, 46.9, 925, 3.9,
  'AWD', 'SUV', 'Black', 0, 'on_order', TRUE,
  'Denza N9 — флагманський SUV (5258x2030x1830 мм). 2.0T + 3 мотори, сумарна потужність 680 кВт, 0-100 за 3.9 с. Батарея 46.9 кВт·г, EV 200 км, загальний пробіг 1302 км. Хмарна підвіска Yun Nian-A.',
  'Denza N9 — флагманский SUV (5258x2030x1830 мм). 2.0T + 3 мотора, суммарная мощность 680 кВт, 0-100 за 3.9 с. Батарея 46.9 кВт·ч, EV 200 км, общий пробег 1302 км. Облачная подвеска Yun Nian-A.',
  ARRAY[]::TEXT[], '',
  '{"seats":7,"dimensions":"5258x2030x1830mm","wheelbase":"3125mm","engine":"2.0T 152kW","motor_kw":"200+240+240 (680 кВт загалом)","battery_type":"LFP BYD Blade 46.9kWh","total_range_km":1302,"ev_range_km":200,"charge_time_fast":"20 хв (30-80%)","warranty_years":3,"features":["2.0T + 3 мотори (680 кВт)","Хмарна підвіска Yun Nian-A","DiPilot 300 (лідар)","Лазерні фари","BOSE аудіо","Масаж сидінь","HUD дисплей","Камера 360°","Електричні двері","6 місць / 7 місць"]}'
);


-- ══════════════════════════════════════════
-- FCB 方程豹 Fangchengbao (4 моделі)
-- ══════════════════════════════════════════

INSERT INTO cars (slug, brand, model, year, price_usd, price_uah, range_km, battery_kwh, power_hp, acceleration_0_100, drive_type, body_type, color, mileage_km, status, is_new, description_ua, description_ru, images, thumbnail, specs) VALUES

-- 1. FCB 钛3 Ti3 RWD 501km (纯电)
(
  'fcb-ti3-rwd-501km-2025',
  'FCB', 'Ti3 (钛3) RWD 501km', 2025,
  19000, 784000, 501, 73.0, 272, 6.9,
  'RWD', 'SUV', 'White', 0, 'in_stock', TRUE,
  'FCB Ti3 (方程豹 钛3) — компактний електричний SUV від BYD. Батарея Blade 73 кВт·г, 800V платформа, запас ходу 501 км. Дисплей 15.6", HUD 12", аудіосистема Devialet.',
  'FCB Ti3 (方程豹 钛3) — компактный электрический SUV от BYD. Батарея Blade 73 кВт·ч, 800V платформа, запас хода 501 км. Дисплей 15.6", HUD 12", аудиосистема Devialet.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4530x1920x1650mm","wheelbase":"2790mm","motor_kw":200,"battery_type":"LFP BYD Blade 73kWh","platform":"800V","charge_time_fast":"0.08 год (30-80%)","charge_time_slow":"9.3 год","warranty_years":3,"features":["800V платформа","BYD Blade Battery","15.6\" центральний дисплей","12\" HUD","Devialet аудіо","Камера 360°","Підігрів сидінь","Дрон Lingyan (опція)"]}'
),

-- 2. FCB 钛3 Ti3 AWD 501km
(
  'fcb-ti3-awd-501km-2025',
  'FCB', 'Ti3 (钛3) AWD 501km', 2025,
  23000, 949000, 501, 73.0, 422, 4.9,
  'AWD', 'SUV', 'Black', 0, 'in_stock', TRUE,
  'FCB Ti3 AWD — повнопривідна версія з двома моторами (110+200 кВт). Розгін 0-100 за 4.9 с, максимальна швидкість 201 км/год. BYD Blade Battery, 800V.',
  'FCB Ti3 AWD — полноприводная версия с двумя моторами (110+200 кВт). Разгон 0-100 за 4.9 с, максимальная скорость 201 км/ч. BYD Blade Battery, 800V.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4530x1920x1650mm","wheelbase":"2790mm","motor_kw":"110+200","max_speed_kmh":201,"battery_type":"LFP BYD Blade 73kWh","platform":"800V","charge_time_fast":"0.08 год (30-80%)","charge_time_slow":"9.3 год","warranty_years":3,"features":["800V платформа","Двомоторний повний привід","BYD Blade Battery","15.6\" центральний дисплей","12\" HUD","Devialet аудіо","Камера 360°","Підігрів + вентиляція сидінь","Панорамний дах"]}'
),

-- 3. FCB 豹5 Bao5 DMO AWD
(
  'fcb-bao5-dmo-awd-2025',
  'FCB', 'Bao5 (豹5) DMO AWD', 2025,
  34000, 1403000, 125, 31.8, 660, 4.8,
  'AWD', 'SUV', 'Green', 0, 'in_stock', TRUE,
  'FCB Bao5 (方程豹 豹5) — електричний позашляховик з DMO+ платформою BYD. 1.5T + два мотори, загальна потужність 485 кВт / 760 Нм. EV запас ходу 125 км, загальний 1200+ км. Підвіска Cloud Nian-P.',
  'FCB Bao5 (方程豹 豹5) — электрический внедорожник с DMO+ платформой BYD. 1.5T + два мотора, общая мощность 485 кВт / 760 Нм. EV запас хода 125 км, общий 1200+ км. Подвеска Cloud Nian-P.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4890x1970x1920mm","wheelbase":"2800mm","engine":"1.5T 143kW","motor_kw":"485 кВт загалом","motor_torque":"760 Нм","battery_type":"LFP BYD Blade 31.8kWh","ev_range_km":125,"total_range_km":1200,"charge_time_fast":"5 хв (10-70%)","warranty_years":3,"features":["DMO+ платформа","BYD Blade Battery","Хмарна підвіска Yun Nian-P Ultra","Huawei ADS 4.0","6 кВт зовнішнє живлення","Блокування диференціала","Камера 360°","Підігрів сидінь"]}'
),

-- 4. FCB 豹8 Bao8 DMO AWD 7-seat
(
  'fcb-bao8-dmo-awd-2025',
  'FCB', 'Bao8 (豹8) DMO AWD 7-seat', 2025,
  52000, 2146000, 125, 36.8, 748, 4.8,
  'AWD', 'SUV', 'Black', 0, 'on_order', TRUE,
  'FCB Bao8 (方程豹 豹8) — великий позашляховик (5 / 6 / 7 місць). 2.0T + три мотори, потужність 550 кВт / 760 Нм. EV 125 км, загальний 1200 км. Huawei ADS 4.0, підвіска Cloud Nian-P.',
  'FCB Bao8 (方程豹 豹8) — большой внедорожник (5 / 6 / 7 мест). 2.0T + три мотора, мощность 550 кВт / 760 Нм. EV 125 км, общий 1200 км. Huawei ADS 4.0, подвеска Cloud Nian-P.',
  ARRAY[]::TEXT[], '',
  '{"seats":"5/6/7","dimensions":"5195x2000x1920mm","wheelbase":"3025mm","engine":"2.0T 180kW","motor_kw":"200(F)+300(R) = 550 кВт","motor_torque":"760 Нм","battery_type":"LFP BYD Blade 36.8kWh","ev_range_km":125,"total_range_km":1200,"warranty_years":3,"features":["DMO+ платформа","2.0T + 3 мотори (550 кВт)","Huawei ADS 4.0","Хмарна підвіска Yun Nian-P","6 кВт зовнішнє живлення","Блокування диференціала","Камера 360°","Масаж сидінь","3 ряди сидінь","BOSE аудіо"]}'
);


-- ══════════════════════════════════════════
-- HONDA 本田 (7 моделей)
-- ══════════════════════════════════════════

INSERT INTO cars (slug, brand, model, year, price_usd, price_uah, range_km, battery_kwh, power_hp, acceleration_0_100, drive_type, body_type, color, mileage_km, status, is_new, description_ua, description_ru, images, thumbnail, specs) VALUES

-- 1. Honda e:NS1 510km
(
  'honda-ens1-510km-2024',
  'Honda', 'e:NS1 510km', 2024,
  22000, 908000, 510, 68.8, 204, 7.8,
  'FWD', 'SUV', 'White', 0, 'in_stock', TRUE,
  'Honda e:NS1 — електричний кросовер від Dongfeng Honda. Мотор 150 кВт / 310 Нм, батарея 68.8 кВт·г (NMC), запас ходу 510 км (CLTC). Платформа e:N Architecture F.',
  'Honda e:NS1 — электрический кроссовер от Dongfeng Honda. Мотор 150 кВт / 310 Нм, батарея 68.8 кВт·ч (NMC), запас хода 510 км (CLTC). Платформа e:N Architecture F.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4390x1790x1560mm","wheelbase":"2610mm","motor_kw":150,"motor_torque":"310 Нм","battery_type":"NMC 68.8kWh","charge_time_fast":"30 хв (30-80%)","charge_time_slow":"8 год","warranty_years":3,"features":["Honda CONNECT 3.0","Honda Sensing","10.25\" дисплей","LED фари","Камера 360°","Підігрів сидінь","e:N Architecture F"]}'
),

-- 2. Honda e:NS1 420km
(
  'honda-ens1-420km-2024',
  'Honda', 'e:NS1 420km', 2024,
  18500, 763000, 420, 53.6, 182, 8.5,
  'FWD', 'SUV', 'Blue', 0, 'in_stock', TRUE,
  'Honda e:NS1 420km — версія зі стандартною батареєю 53.6 кВт·г. Мотор 134 кВт, запас ходу 420 км. Доступна ціна з повним набором Honda Sensing.',
  'Honda e:NS1 420km — версия со стандартной батареей 53.6 кВт·ч. Мотор 134 кВт, запас хода 420 км. Доступная цена с полным набором Honda Sensing.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4390x1790x1560mm","wheelbase":"2610mm","motor_kw":134,"motor_torque":"310 Нм","battery_type":"NMC 53.6kWh","charge_time_fast":"35 хв (30-80%)","charge_time_slow":"9 год","warranty_years":3,"features":["Honda CONNECT 3.0","Honda Sensing","10.25\" дисплей","LED фари","Камера заднього виду","e:N Architecture F"]}'
),

-- 3. Honda e:NP1 510km
(
  'honda-enp1-510km-2024',
  'Honda', 'e:NP1 极湃1 510km', 2024,
  23000, 949000, 510, 68.8, 204, 7.8,
  'FWD', 'SUV', 'Black', 0, 'in_stock', TRUE,
  'Honda e:NP1 极湃1 — електричний кросовер від GAC Honda. Мотор 150 кВт / 310 Нм, батарея 68.8 кВт·г, запас ходу 510 км. Вертикальний дисплей 15.1", Honda CONNECT 3.0.',
  'Honda e:NP1 极湃1 — электрический кроссовер от GAC Honda. Мотор 150 кВт / 310 Нм, батарея 68.8 кВт·ч, запас хода 510 км. Вертикальный дисплей 15.1", Honda CONNECT 3.0.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4388x1790x1560mm","wheelbase":"2610mm","motor_kw":150,"motor_torque":"310 Нм","battery_type":"NMC 68.8kWh","charge_time_fast":"30 хв (30-80%)","charge_time_slow":"8 год","warranty_years":3,"features":["Honda CONNECT 3.0","Honda Sensing","15.1\" вертикальний дисплей","LED фари","Камера 360°","Бездротова зарядка телефону","e:N Architecture F"]}'
),

-- 4. Honda Ye S7 烨S7 620km
(
  'honda-ye-s7-620km-2025',
  'Honda', 'Ye S7 (烨S7) 620km', 2025,
  28000, 1156000, 620, 89.8, 476, 4.6,
  'AWD', 'SUV', 'Silver', 0, 'in_stock', TRUE,
  'Honda Ye S7 (烨S7) — новий електричний SUV від Dongfeng Honda. Подвійний мотор 150+200 кВт = 350 кВт, батарея CATL 89.8 кВт·г (NMC), запас ходу 620 км. Платформа Honda W Architecture.',
  'Honda Ye S7 (烨S7) — новый электрический SUV от Dongfeng Honda. Двойной мотор 150+200 кВт = 350 кВт, батарея CATL 89.8 кВт·ч (NMC), запас хода 620 км. Платформа Honda W Architecture.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4750x1930x1625mm","wheelbase":"2930mm","motor_kw":"150+200 (350 кВт)","motor_torque":"680 Нм","battery_type":"NMC CATL 89.8kWh","charge_time_fast":"20 хв (30-80%)","charge_time_slow":"7 год","warranty_years":3,"features":["Honda W Architecture","Honda Sensing 360","15.6\" центральний дисплей","AR HUD","Qualcomm 8155 чіп","LED Matrix фари","Камера 360°","Підігрів + вентиляція сидінь","Панорамний дах"]}'
),

-- 5. Honda Ye S7 RWD 620km
(
  'honda-ye-s7-rwd-620km-2025',
  'Honda', 'Ye S7 (烨S7) RWD 620km', 2025,
  24000, 990000, 620, 89.8, 272, 6.8,
  'RWD', 'SUV', 'White', 0, 'in_stock', TRUE,
  'Honda Ye S7 RWD — задньопривідна версія з мотором 200 кВт. Батарея CATL 89.8 кВт·г, запас ходу 620 км. Honda Sensing 360, дисплей 15.6".',
  'Honda Ye S7 RWD — заднеприводная версия с мотором 200 кВт. Батарея CATL 89.8 кВт·ч, запас хода 620 км. Honda Sensing 360, дисплей 15.6".',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4750x1930x1625mm","wheelbase":"2930mm","motor_kw":200,"battery_type":"NMC CATL 89.8kWh","charge_time_fast":"20 хв (30-80%)","charge_time_slow":"7 год","warranty_years":3,"features":["Honda W Architecture","Honda Sensing 360","15.6\" центральний дисплей","LED Matrix фари","Камера 360°","Підігрів сидінь","Панорамний дах"]}'
),

-- 6. Honda Ye P7 烨P7 620km AWD
(
  'honda-ye-p7-awd-620km-2025',
  'Honda', 'Ye P7 (烨P7) AWD 620km', 2025,
  29000, 1197000, 620, 89.8, 476, 4.6,
  'AWD', 'SUV', 'Grey', 0, 'in_stock', TRUE,
  'Honda Ye P7 (烨P7) — електричний кросовер від GAC Honda. Двомоторний повний привід 350 кВт, батарея CATL 89.8 кВт·г, запас ходу 620 км. BOSE аудіо 12 динаміків.',
  'Honda Ye P7 (烨P7) — электрический кроссовер от GAC Honda. Двухмоторный полный привод 350 кВт, батарея CATL 89.8 кВт·ч, запас хода 620 км. BOSE аудіо 12 динаміків.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4750x1930x1625mm","wheelbase":"2930mm","motor_kw":"150+200 (350 кВт)","battery_type":"NMC CATL 89.8kWh","charge_time_fast":"20 хв (30-80%)","charge_time_slow":"7 год","warranty_years":3,"features":["Honda W Architecture","Honda Sensing 360","15.6\" центральний дисплей","AR HUD","BOSE аудіо 12 динаміків","LED Matrix фари","Камера 360°","Підігрів + вентиляція сидінь","Панорамний дах","Бездротова зарядка"]}'
),

-- 7. Honda MN-V Premium 480km
(
  'honda-mn-v-premium-480km-2024',
  'Honda', 'MN-V Premium 480km', 2024,
  20500, 846000, 480, 61.3, 163, 9.0,
  'FWD', 'SUV', 'Red', 0, 'in_stock', TRUE,
  'Honda MN-V Premium — топова комплектація компактного електрокросовера. Мотор 120 кВт, батарея 61.3 кВт·г, запас ходу 480 км. Шкіряний салон, панорамний дах, Honda Sensing.',
  'Honda MN-V Premium — топовая комплектация компактного электрокроссовера. Мотор 120 кВт, батарея 61.3 кВт·ч, запас хода 480 км. Кожаный салон, панорамная крыша, Honda Sensing.',
  ARRAY[]::TEXT[], '',
  '{"seats":5,"dimensions":"4324x1785x1535mm","wheelbase":"2610mm","motor_kw":120,"battery_type":"NMC 61.3kWh","charge_time_fast":"35 хв (30-80%)","charge_time_slow":"9 год","warranty_years":2,"features":["Honda Sensing","Шкіряний салон","Панорамний дах","LED фари","Камера 360°","Підігрів сидінь","Бездротова зарядка телефону","8\" сенсорний дисплей"]}'
);


-- ══════════════════════════════════════════
-- Бренди та моделі для фільтрів каталогу
-- ══════════════════════════════════════════

INSERT INTO brands (name, sort_order) VALUES
  ('Avatr', 10),
  ('Denza', 11),
  ('FCB', 12),
  ('Honda', 13)
ON CONFLICT (name) DO NOTHING;

-- Avatr models
INSERT INTO brand_models (brand_id, name, sort_order)
SELECT b.id, m.name, m.sort_order
FROM brands b
CROSS JOIN (VALUES
  ('06 RWD 650km', 1), ('06 AWD 600km', 2),
  ('07 RWD 650km', 3), ('07 AWD 610km', 4),
  ('11 Max AWD 815km', 5),
  ('12 RWD 705km', 6)
) AS m(name, sort_order)
WHERE b.name = 'Avatr'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Denza models
INSERT INTO brand_models (brand_id, name, sort_order)
SELECT b.id, m.name, m.sort_order
FROM brands b
CROSS JOIN (VALUES
  ('D9 EV 620km', 1), ('N7 AWD 630km', 2),
  ('N8 EV 736km', 3), ('N9', 4)
) AS m(name, sort_order)
WHERE b.name = 'Denza'
ON CONFLICT (brand_id, name) DO NOTHING;

-- FCB models
INSERT INTO brand_models (brand_id, name, sort_order)
SELECT b.id, m.name, m.sort_order
FROM brands b
CROSS JOIN (VALUES
  ('Ti3 (钛3) RWD 501km', 1), ('Ti3 (钛3) AWD 501km', 2),
  ('Bao5 (豹5) DMO AWD', 3), ('Bao8 (豹8) DMO AWD 7-seat', 4)
) AS m(name, sort_order)
WHERE b.name = 'FCB'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Honda models
INSERT INTO brand_models (brand_id, name, sort_order)
SELECT b.id, m.name, m.sort_order
FROM brands b
CROSS JOIN (VALUES
  ('e:NS1 420km', 1), ('e:NS1 510km', 2),
  ('e:NP1 极湃1 510km', 3),
  ('Ye S7 (烨S7) RWD 620km', 4), ('Ye S7 (烨S7) 620km', 5),
  ('Ye P7 (烨P7) AWD 620km', 6),
  ('MN-V Premium 480km', 7)
) AS m(name, sort_order)
WHERE b.name = 'Honda'
ON CONFLICT (brand_id, name) DO NOTHING;
