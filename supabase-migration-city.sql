-- ========================================
-- Migration: add city columns to cars
-- Run in Supabase SQL Editor (Dashboard > SQL Editor)
-- The city is chosen in the admin car form from the list of offices.
-- ========================================

ALTER TABLE cars ADD COLUMN IF NOT EXISTS city_ua TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS city_ru TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS city_en TEXT;
