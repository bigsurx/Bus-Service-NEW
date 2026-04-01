import "server-only";
import { getAccessToken } from "./auth";
import type {
  CompanySettings,
  Country,
  VehicleSearchParams,
  VehicleSearchResult,
  OrderCreateParams,
  OrderUpdateParams,
  OrderConfirmParams,
  Order,
  ContactFormData,
} from "./types";

const API_BASE = "https://api.rentsyst.com/v1";
const API_BASE_V2 = "https://api.rentsyst.com/v2";

async function rentsystFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  const url = `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RentSyst API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function getSettings(): Promise<CompanySettings> {
  return rentsystFetch<CompanySettings>("/company/settings");
}

export async function getCountries(): Promise<Country[]> {
  return rentsystFetch<Country[]>("/resources/country");
}

export async function searchVehicles(
  params: VehicleSearchParams
): Promise<VehicleSearchResult> {
  // API requires "dates" as combined string: "YYYY-MM-DD HH:mm - YYYY-MM-DD HH:mm"
  const dates = `${params.date_from} - ${params.date_to}`;
  const query = new URLSearchParams({
    pickup_location: String(params.pickup_location),
    return_location: String(params.return_location),
    dates,
    per_page: String(params.per_page ?? 50),
    ...(params.lang ? { lang: params.lang } : {}),
  });
  return rentsystFetch<VehicleSearchResult>(`/booking/search?${query}`);
}

export async function createOrder(params: OrderCreateParams): Promise<Order> {
  // API requires combined "dates" format, not separate date_from/date_to
  const body = {
    vehicle_id: params.vehicle_id,
    pickup_location: params.pickup_location,
    return_location: params.return_location,
    dates: `${params.date_from} - ${params.date_to}`,
  };
  return rentsystFetch<Order>("/order/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateOrder(
  id: number,
  params: OrderUpdateParams
): Promise<Order> {
  const token = await getAccessToken();
  const url = `${API_BASE}/order/update/${id}`;

  // RentSyst API expects multipart/form-data for update
  const formData = new FormData();
  if (params.insurance != null) {
    formData.append("insurance", String(params.insurance));
  }
  if (params.extras) {
    for (const [extId, qty] of Object.entries(params.extras)) {
      if (qty > 0) formData.append(`extras[${extId}]`, String(qty));
    }
  }

  console.log("[updateOrder] POST", url);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RentSyst API error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Flatten a nested object into form-data key/value pairs.
 * Example: { drivers: [{ first_name: "John" }] } → "drivers[0][first_name]=John"
 */
function flattenToFormData(
  obj: Record<string, unknown>,
  prefix = "",
  entries: [string, string][] = []
): [string, string][] {
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (val === null || val === undefined) continue;
    if (Array.isArray(val)) {
      val.forEach((item, i) => {
        if (typeof item === "object" && item !== null) {
          flattenToFormData(item as Record<string, unknown>, `${fullKey}[${i}]`, entries);
        } else {
          entries.push([`${fullKey}[${i}]`, String(item)]);
        }
      });
    } else if (typeof val === "object") {
      flattenToFormData(val as Record<string, unknown>, fullKey, entries);
    } else {
      entries.push([fullKey, String(val)]);
    }
  }
  return entries;
}

// Confirm endpoint only works on V2 API (V1 returns 500)
// Response: { status, payment_link, payment_id, unique_number }
export async function confirmOrder(
  id: number,
  params: OrderConfirmParams
): Promise<{ status: string; payment_link?: string; payment_id?: string; unique_number?: string }> {
  const token = await getAccessToken();
  const url = `${API_BASE_V2}/order/confirm/${id}`;

  // V2 confirm expects multipart/form-data
  const formData = new FormData();

  params.drivers.forEach((driver, i) => {
    formData.append(`drivers[${i}][first_name]`, driver.first_name);
    formData.append(`drivers[${i}][last_name]`, driver.last_name);
    formData.append(`drivers[${i}][email]`, driver.email);
    formData.append(`drivers[${i}][phone]`, driver.phone);
    if (driver.country) formData.append(`drivers[${i}][country]`, driver.country);
  });

  formData.append("payment_method", params.payment_method);
  if (params.comment) formData.append("comment", params.comment);

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RentSyst API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function applyCoupon(
  orderId: number,
  coupon: string
): Promise<{ total: number; discount: number }> {
  return rentsystFetch(`/order/coupon/${orderId}`, {
    method: "POST",
    body: JSON.stringify({ coupon }),
  });
}

export async function submitContact(data: ContactFormData): Promise<unknown> {
  return rentsystFetch("/contact/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
