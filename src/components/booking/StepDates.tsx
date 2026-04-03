"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useBookingStore } from "@/stores/booking";
import { DatePicker, type DatePickerHandle } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";
import type { Location } from "@/lib/types";

export function StepDates() {
  const t = useTranslations("booking");
  const store = useBookingStore();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const returnDateRef = useRef<DatePickerHandle>(null);

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          store.setSettings(data);
          setAllLocations(data.locations || []);
        }
      } catch (e) {
        console.error("Failed to fetch settings:", e);
      } finally {
        setLoading(false);
      }
    }
    if (!store.settings) fetchSettings();
    else setAllLocations(store.locations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!store.pickupLocation) newErrors.location = t("validation.locationRequired");
    if (!store.pickupDate) newErrors.pickupDate = t("validation.pickupDateRequired");
    if (!store.returnDate) newErrors.returnDate = t("validation.returnDateRequired");
    if (store.pickupDate && store.returnDate && store.returnDate < store.pickupDate) {
      newErrors.returnDate = t("validation.returnAfterPickup");
    }
    if (store.differentReturnLocation && !store.returnLocation) {
      newErrors.returnLocation = t("validation.returnLocationRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSearch() {
    if (!validate()) return;

    setSearching(true);
    try {
      const returnLoc =
        store.differentReturnLocation && store.returnLocation
          ? store.returnLocation
          : store.pickupLocation;

      const res = await fetch("/api/vehicles/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup_location: store.pickupLocation!.id,
          return_location: returnLoc!.id,
          date_from: `${store.pickupDate} ${store.pickupTime}`,
          date_to: `${store.returnDate} ${store.returnTime}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const vehicles = Array.isArray(data) ? data : data.vehicles || [];
        store.setVehicles(vehicles);
        store.setStep(1);
      }
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setSearching(false);
    }
  }

  function handleLocationChange(value: string, type: "pickup" | "return") {
    const loc = allLocations.find((l) => l.id === Number(value)) ?? null;
    if (type === "pickup") {
      store.setPickupLocation(loc);
      if (loc) setErrors((prev) => { const { location, ...rest } = prev; return rest; });
    } else {
      store.setReturnLocation(loc);
      if (loc) setErrors((prev) => { const { returnLocation, ...rest } = prev; return rest; });
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const returnMinDate = store.pickupDate ? new Date(store.pickupDate + "T00:00:00") : today;

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none";

  return (
    <div className="space-y-6">
      {/* Pickup location */}
      <div>
        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4 text-accent" />
          {t("pickupLocation")}
        </label>
        <select
          className={`${inputClass} ${errors.location ? "!border-red-400" : ""}`}
          value={store.pickupLocation?.id ?? ""}
          onChange={(e) => handleLocationChange(e.target.value, "pickup")}
          disabled={loading}
        >
          <option value="">{loading ? "..." : t("selectLocation")}</option>
          {allLocations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} {loc.city_name ? `(${loc.city_name})` : ""}
            </option>
          ))}
        </select>
        {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
      </div>

      {/* Different return toggle */}
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={store.differentReturnLocation}
          onChange={(e) => store.setDifferentReturnLocation(e.target.checked)}
          className="h-4 w-4 rounded border-input accent-accent"
        />
        {t("differentReturn")}
      </label>

      {/* Return location */}
      {store.differentReturnLocation && (
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-accent" />
            {t("returnLocation")}
          </label>
          <select
            className={`${inputClass} ${errors.returnLocation ? "!border-red-400" : ""}`}
            value={store.returnLocation?.id ?? ""}
            onChange={(e) => handleLocationChange(e.target.value, "return")}
          >
            <option value="">{t("selectLocation")}</option>
            {allLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} {loc.city_name ? `(${loc.city_name})` : ""}
              </option>
            ))}
          </select>
          {errors.returnLocation && <p className="mt-1 text-xs text-red-500">{errors.returnLocation}</p>}
        </div>
      )}

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
            {t("pickupDate")}
          </label>
          <DatePicker
            value={store.pickupDate}
            onChange={(v) => {
              store.setPickupDate(v);
              setErrors((prev) => { const { pickupDate, ...rest } = prev; return rest; });
            }}
            minDate={today}
            placeholder={t("selectDate")}
            className={errors.pickupDate ? "[&>button]:!border-red-400" : ""}
            onAfterSelect={() => {
              setTimeout(() => returnDateRef.current?.open(), 150);
            }}
          />
          {errors.pickupDate && <p className="mt-1 text-xs text-red-500">{errors.pickupDate}</p>}
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
            {t("returnDate")}
          </label>
          <DatePicker
            ref={returnDateRef}
            value={store.returnDate}
            onChange={(v) => {
              store.setReturnDate(v);
              setErrors((prev) => { const { returnDate, ...rest } = prev; return rest; });
            }}
            minDate={returnMinDate}
            placeholder={t("selectDate")}
            className={errors.returnDate ? "[&>button]:!border-red-400" : ""}
          />
          {errors.returnDate && <p className="mt-1 text-xs text-red-500">{errors.returnDate}</p>}
        </div>
      </div>

      {/* Times */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 text-sm font-medium">{t("pickupTime")}</label>
          <TimePicker
            value={store.pickupTime}
            onChange={(v) => store.setPickupTime(v)}
          />
        </div>
        <div>
          <label className="mb-1.5 text-sm font-medium">{t("returnTime")}</label>
          <TimePicker
            value={store.returnTime}
            onChange={(v) => store.setReturnTime(v)}
          />
        </div>
      </div>

      {/* Search */}
      <Button
        onClick={handleSearch}
        disabled={searching}
        className="w-full bg-accent text-white hover:bg-brand-orange-hover"
        size="lg"
      >
        {searching ? (
          t("searching")
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            {t("search")}
          </>
        )}
      </Button>
    </div>
  );
}
