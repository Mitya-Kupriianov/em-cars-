-- Allow the new "commission" car status (Комісійне авто).
-- The cars.status column has a CHECK constraint; recreate it with the extra value.
-- Includes 'in_transit' too (already used by the app) so the constraint matches reality.
ALTER TABLE cars DROP CONSTRAINT IF EXISTS cars_status_check;
ALTER TABLE cars ADD CONSTRAINT cars_status_check
  CHECK (status IN ('in_stock', 'in_transit', 'on_order', 'sold', 'commission'));
