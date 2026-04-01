// RentSyst API types

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  city_id: number;
  city_name?: string;
  country_id?: number;
  country_name?: string;
  lat?: number;
  lng?: number;
}

export interface Country {
  id: number;
  name: string;
  cities: City[];
}

export interface City {
  id: number;
  name: string;
  country_id: number;
  locations: Location[];
}

export interface CompanySettings {
  currency: string;
  currency_symbol: string;
  locations: Location[];
  payment_methods: PaymentMethod[];
  time_for_booking?: number;
  insurances: Insurance[];
  equipments: Equipment[];
}

export interface PaymentMethod {
  id: number | string; // API may return numeric or string IDs (e.g. "Card", "Cash")
  name: string;
  discount?: number;
}

export interface Insurance {
  id: number;
  name: string;
  price: number;
  description?: string;
}

export interface Equipment {
  id: number;
  name: string;
  price: number;
  max_count: number;
  description?: string;
}

export interface VehicleSearchParams {
  pickup_location: number | string;
  return_location: number | string;
  date_from: string; // YYYY-MM-DD HH:mm
  date_to: string;
  per_page?: number;
  lang?: string;
}

// Raw vehicle from RentSyst API
export interface VehicleRaw {
  id: string;
  brand: string;
  mark: string;
  group: string;
  type: string;
  body_type: string;
  year: number;
  number_seats: number;
  number_doors: number;
  transmission: string;
  fuel: string;
  price: number;
  min_price: number;
  total_price: string;
  count_days: number;
  currency: string;
  thumbnail: string;
  thumbnails: string[];
  photos: string[];
  mileage_limit: string;
  refill: string;
  large_bags: number;
  small_bags: number;
  options: unknown[];
  custom_fields: unknown[];
  color?: { title: string; code: string };
}

// Normalized vehicle for UI
export interface Vehicle {
  id: string;
  name: string;
  category?: string;
  thumbnail?: string;
  images?: string[];
  seats?: number;
  doors?: number;
  transmission?: string;
  fuel?: string;
  price_per_day: number;
  total_price?: number;
  count_days?: number;
  currency?: string;
  mileage_limit?: string;
}

export interface VehicleSearchResult {
  vehicles: VehicleRaw[];
  pagination?: { total: number; page: number; per_page: number };
}

export interface OrderCreateParams {
  vehicle_id: number;
  pickup_location: number | string;
  return_location: number | string;
  date_from: string;
  date_to: string;
}

export interface OrderUpdateParams {
  insurance?: number;
  extras?: Record<string, number>;
}

export interface OrderConfirmParams {
  drivers: DriverDetails[];
  payment_method: string;
  comment?: string;
}

export interface DriverDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country?: string;
}

export interface Order {
  id: number;
  status: string;
  vehicle: Vehicle;
  date_from: string;
  date_to: string;
  location: Location;
  location_return?: Location;
  insurance?: Insurance;
  equipments?: { equipment: Equipment; count: number }[];
  insurances?: Insurance[];
  options?: Equipment[];
  total: number;
  currency: string;
  currency_symbol: string;
  payment_url?: string;
}

export interface ContactFormData {
  name: string;
  surname?: string;
  phone: string;
  email?: string;
  notes?: string;
  vehicle_id?: string;
  location_id?: string;
}
