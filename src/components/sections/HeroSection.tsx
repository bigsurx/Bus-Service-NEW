"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useBookingStore } from "@/stores/booking";
import { DatePicker, type DatePickerHandle } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { MapPin, Clock, Search, ChevronDown } from "lucide-react";
import type { Location } from "@/lib/types";

/* ────────────────────────────────────────────────────────── */

export function HeroSection() {
  const t = useTranslations("hero");
  const tb = useTranslations("booking");
  const store = useBookingStore();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [searching, setSearching] = useState(false);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const returnDateRef = useRef<DatePickerHandle>(null);

  /* ── Fetch company settings on mount ── */
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      setLoadError(false);
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          store.setSettings(data);
          setAllLocations(data.locations || []);
        } else {
          console.error("Settings API error:", res.status);
          setLoadError(true);
        }
      } catch (e) {
        console.error("Failed to fetch settings:", e);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    if (!store.settings) fetchSettings();
    else setAllLocations(store.locations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Handlers ── */

  function pickLocation(value: string) {
    const loc = allLocations.find((l) => l.id === Number(value)) ?? null;
    store.setPickupLocation(loc);
    if (loc) clearError("location");
  }

  function pickReturnLocation(value: string) {
    const loc = allLocations.find((l) => l.id === Number(value)) ?? null;
    store.setReturnLocation(loc);
    if (loc) clearError("returnLocation");
  }

  function clearError(key: string) {
    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!store.pickupLocation) e.location = tb("validation.locationRequired");
    if (!store.pickupDate) e.pickupDate = tb("validation.pickupDateRequired");
    if (!store.returnDate) e.returnDate = tb("validation.returnDateRequired");
    if (store.pickupDate && store.returnDate && store.returnDate < store.pickupDate) {
      e.returnDate = tb("validation.returnAfterPickup");
    }
    if (store.differentReturnLocation && !store.returnLocation) {
      e.returnLocation = tb("validation.returnLocationRequired");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
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
        store.setVehicles(Array.isArray(data) ? data : data.vehicles || []);
        store.setStep(1);
        setTimeout(() => {
          document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setSearching(false);
    }
  }

  /* ── Derived state ── */

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const returnMinDate = store.pickupDate
    ? new Date(store.pickupDate + "T00:00:00")
    : today;

  /* ── Shared classes ── */

  const fieldHeight = "h-[42px]";
  const inputBase =
    `${fieldHeight} w-full rounded-lg border bg-white px-3 text-sm text-gray-900 transition-colors focus:border-accent focus:outline-none`;

  /* ────────────────────────────────── JSX ────────────────────────────────── */

  return (
    <section
      className="relative flex min-h-[90vh] items-center bg-primary"
      id="home"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/assets/images/hero-bus.jpg"
          alt="Bus Service fleet"
          fill
          priority
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary/90" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        {/* ── Heading ── */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("badge")}
          </div>

          <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t("title")} {t("title2")}
            <br />
            <em className="not-italic text-accent">{t("titleEm")}</em>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* ── Search bar ── */}
        <div className="mx-auto mt-10 max-w-6xl">
          <div className="rounded-2xl bg-white/95 px-5 py-5 shadow-2xl backdrop-blur-sm sm:px-6 sm:py-6">
            {/* Row of fields */}
            <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-[2fr_1.5fr_1.5fr_auto]">

              {/* ─ 1. Location ─ */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  {tb("pickupLocation")}
                </label>
                <select
                  className={`${inputBase} ${errors.location ? "border-red-400" : "border-gray-200"}`}
                  value={store.pickupLocation?.id ?? ""}
                  onChange={(e) => pickLocation(e.target.value)}
                  disabled={loading || loadError}
                >
                  <option value="">
                    {loading
                      ? "..."
                      : loadError
                        ? "⚠ Service unavailable"
                        : tb("selectLocation")}
                  </option>
                  {allLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                      {loc.city_name ? ` (${loc.city_name})` : ""}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <p className="mt-1 text-xs text-red-500">{errors.location}</p>
                )}
              </div>

              {/* ─ 2. Pick-up date + time ─ */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {tb("pickupDate")}
                </label>
                <div className="flex gap-2">
                  <DatePicker
                    value={store.pickupDate}
                    onChange={(v) => {
                      store.setPickupDate(v);
                      clearError("pickupDate");
                    }}
                    minDate={today}
                    placeholder={tb("selectDate")}
                    className="flex-1"
                    hasError={!!errors.pickupDate}
                    onAfterSelect={() => returnDateRef.current?.open()}
                  />
                  <TimePicker
                    value={store.pickupTime}
                    onChange={(v) => store.setPickupTime(v)}
                    className="w-[5.5rem] shrink-0"
                  />
                </div>
                {errors.pickupDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.pickupDate}</p>
                )}
              </div>

              {/* ─ 3. Drop-off date + time ─ */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {tb("returnDate")}
                </label>
                <div className="flex gap-2">
                  <DatePicker
                    ref={returnDateRef}
                    value={store.returnDate}
                    onChange={(v) => {
                      store.setReturnDate(v);
                      clearError("returnDate");
                    }}
                    minDate={returnMinDate}
                    placeholder={tb("selectDate")}
                    className="flex-1"
                    hasError={!!errors.returnDate}
                  />
                  <TimePicker
                    value={store.returnTime}
                    onChange={(v) => store.setReturnTime(v)}
                    className="w-[5.5rem] shrink-0"
                  />
                </div>
                {errors.returnDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.returnDate}</p>
                )}
              </div>

              {/* ─ 4. Search button ─ */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className={`${fieldHeight} flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-8 text-sm font-bold text-white transition-colors hover:bg-brand-orange-hover disabled:opacity-50 lg:w-auto`}
                >
                  {searching ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="lg:hidden">{tb("search")}</span>
                </button>
              </div>
            </div>

            {/* ── Bottom row: different return checkbox ── */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={store.differentReturnLocation}
                  onChange={(e) =>
                    store.setDifferentReturnLocation(e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 accent-accent"
                />
                {tb("differentReturn")}
              </label>

              {store.differentReturnLocation && (
                <div className="w-full sm:flex-1">
                  <select
                    className={`${inputBase} ${errors.returnLocation ? "border-red-400" : "border-gray-200"}`}
                    value={store.returnLocation?.id ?? ""}
                    onChange={(e) => pickReturnLocation(e.target.value)}
                  >
                    <option value="">{tb("selectLocation")}</option>
                    {allLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                        {loc.city_name ? ` (${loc.city_name})` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.returnLocation && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.returnLocation}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-6 text-center sm:grid-cols-4">
          {[
            { value: "4+", label: t("statYears") },
            { value: "50+", label: t("statVehicles") },
            { value: "8", label: t("statDrivers") },
            { value: "3", label: t("statCountries") },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-extrabold text-accent">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-white/40">
        <span className="text-xs">{t("scroll")}</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </div>
    </section>
  );
}
