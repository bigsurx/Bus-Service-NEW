"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Users, Fuel, Cog, ChevronLeft, ChevronRight } from "lucide-react";
import type { Vehicle } from "@/lib/types";

export function VehicleCard({
  vehicle,
  onSelect,
  selecting,
}: {
  vehicle: Vehicle;
  onSelect: () => void;
  selecting: boolean;
}) {
  const t = useTranslations("booking");
  const images = vehicle.images?.length ? vehicle.images : vehicle.thumbnail ? [vehicle.thumbnail] : [];
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(images.length - 1, index));
      setCurrent(clamped);
      scrollRef.current?.scrollTo({ left: clamped * scrollRef.current.offsetWidth, behavior: "smooth" });
    },
    [images.length]
  );

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    if (idx !== current) setCurrent(idx);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      {/* Image carousel */}
      <div className="group relative aspect-[16/10] bg-muted">
        {images.length > 0 ? (
          <>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex h-full snap-x snap-mandatory overflow-x-auto scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
            >
              {images.map((src, i) => (
                <div key={i} className="relative h-full w-full flex-shrink-0 snap-center">
                  <Image
                    src={src}
                    alt={`${vehicle.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>

            {/* Arrow buttons (desktop hover) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); scrollTo(current - 1); }}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 disabled:opacity-0"
                  disabled={current === 0}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); scrollTo(current + 1); }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 disabled:opacity-0"
                  disabled={current === images.length - 1}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); scrollTo(i); }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === current ? "w-4 bg-white" : "w-1.5 bg-white/50"
                    }`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Users className="h-12 w-12" />
          </div>
        )}
        {vehicle.category && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            {vehicle.category}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-base font-bold">{vehicle.name}</h3>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {vehicle.seats && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {vehicle.seats} {t("seats")}
            </span>
          )}
          {vehicle.transmission && (
            <span className="flex items-center gap-1">
              <Cog className="h-3.5 w-3.5" />
              {vehicle.transmission}
            </span>
          )}
          {vehicle.fuel && (
            <span className="flex items-center gap-1">
              <Fuel className="h-3.5 w-3.5" />
              {vehicle.fuel}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <div>
          <span className="text-lg font-extrabold text-accent">
            {vehicle.currency ?? "$"}
            {vehicle.price_per_day}
          </span>
          <span className="text-xs text-muted-foreground">{t("perDay")}</span>
          {vehicle.total_price && vehicle.count_days && (
            <div className="text-xs text-muted-foreground">
              {vehicle.currency ?? "$"}{vehicle.total_price} / {vehicle.count_days}d
            </div>
          )}
        </div>
        <Button
          onClick={onSelect}
          disabled={selecting}
          size="sm"
          className="bg-accent text-white hover:bg-brand-orange-hover"
        >
          {selecting ? t("selecting") : t("select")}
        </Button>
      </div>
    </div>
  );
}
