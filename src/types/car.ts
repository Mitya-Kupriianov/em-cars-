export interface Car {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price_usd: number;
  price_uah: number;
  old_price_usd?: number | null; // стара (зачеркнута) ціна для акції; 0/null — без знижки
  old_price_uah?: number | null;
  range_km: number;
  battery_kwh: number;
  power_hp: number;
  acceleration_0_100: number | null;
  trim: string;
  drive_type: string;
  body_type: string;
  color: string;
  city_ua?: string | null;
  city_ru?: string | null;
  city_en?: string | null;
  mileage_km: number;
  status: "in_stock" | "in_transit" | "on_order" | "sold" | "commission";
  is_new: boolean;
  is_visible: boolean;
  is_promo?: boolean;
  description_ua: string;
  description_ru: string;
  description_en?: string;
  images: string[];
  thumbnail: string;
  specs: CarSpecs;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CarSpecs {
  seats?: number;
  trunk_liters?: number;
  max_speed_kmh?: number;
  charge_time_fast?: string;
  charge_time_slow?: string;
  dimensions?: string;
  weight_kg?: number;
  warranty_years?: number;
  features?: string[];
}

export interface CarFilter {
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minRange?: number;
  bodyType?: string;
  status?: string;
  search?: string;
  sort?: "price_asc" | "price_desc" | "year_desc" | "range_desc";
}

export interface ContactRequest {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  car_id?: string;
  message?: string;
  type: "callback" | "test_drive" | "credit" | "trade_in" | "general";
  status?: "new" | "in_progress" | "done";
  created_at?: string;
}

export interface Office {
  city_ua: string;
  city_ru: string;
  city_en?: string;
  address_ua: string;
  address_ru: string;
  address_en?: string;
  phones: string[];
  lat?: number;
  lng?: number;
}
