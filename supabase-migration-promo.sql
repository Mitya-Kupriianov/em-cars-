-- ========================================
-- Migration: add promo flag to cars
-- Run in Supabase SQL Editor (Dashboard > SQL Editor)
-- is_promo marks a car as an "Акційна пропозиція" — featured in the
-- "Популярні моделі" block on the homepage.
-- ========================================

ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_promo BOOLEAN DEFAULT FALSE;
