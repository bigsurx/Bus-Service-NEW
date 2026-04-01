"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useBookingStore } from "@/stores/booking";
import { VehicleCard } from "./VehicleCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function StepVehicles() {
  const t = useTranslations("booking");
  const store = useBookingStore();
  const [selectingId, setSelectingId] = useState<string | null>(null);

  async function handleSelect(vehicleId: string) {
    const vehicle = store.vehicles.find((v) => String(v.id) === vehicleId);
    if (!vehicle || !store.pickupLocation) return;

    setSelectingId(vehicleId);
    try {
      const returnLoc =
        store.differentReturnLocation && store.returnLocation
          ? store.returnLocation
          : store.pickupLocation;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: Number(vehicle.id),
          pickup_location: store.pickupLocation.id,
          return_location: returnLoc.id,
          date_from: `${store.pickupDate} ${store.pickupTime}`,
          date_to: `${store.returnDate} ${store.returnTime}`,
        }),
      });

      if (res.ok) {
        const order = await res.json();
        store.selectVehicle(vehicle);
        store.setOrderId(order.order_id);
        // API may return total under "total_price" (string) or "total" (number)
        const orderTotal = parseFloat(order.total_price) || order.total || vehicle.total_price || vehicle.price_per_day;
        store.setOrderTotal(orderTotal);
        store.setOrderExtras(order.insurances || [], order.options || []);
        store.startTimer();
        store.setStep(2);
      }
    } catch (e) {
      console.error("Order creation failed:", e);
    } finally {
      setSelectingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => store.setStep(0)}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t("backToSearch")}
        </Button>
        <span className="text-sm text-muted-foreground">
          {store.vehicles.length} {t("vehiclesFound")}
        </span>
      </div>

      {store.vehicles.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">{t("noVehicles")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {store.vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelect={() => handleSelect(String(vehicle.id))}
              selecting={selectingId === String(vehicle.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
