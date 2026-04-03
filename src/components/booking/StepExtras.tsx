"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useBookingStore } from "@/stores/booking";
import { CountdownTimer } from "./CountdownTimer";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Minus, Tag } from "lucide-react";

export function StepExtras() {
  const t = useTranslations("booking");
  const store = useBookingStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [saving, setSaving] = useState(false);

  const insurances = store.orderInsurances;
  const options = store.orderOptions;
  const sym = store.currencySymbol || "$";

  // Calculate the displayed total live based on user's equipment selections.
  // The API-provided orderTotal includes the pre-selected extras,
  // so we compute the delta from the initial quantities.
  const displayTotal = useMemo(() => {
    let delta = 0;
    for (const opt of options) {
      const initialQty = opt.quantity; // what the API pre-selected
      const currentQty = store.selectedEquipment[opt.id] ?? 0;
      const diff = currentQty - initialQty;
      delta += diff * parseFloat(opt.price_day) * (store.selectedVehicle?.count_days || 1);
    }
    return Math.max(0, store.orderTotal + delta);
  }, [options, store.selectedEquipment, store.orderTotal, store.selectedVehicle?.count_days]);

  async function applyCoupon() {
    if (!couponInput || !store.orderId) return;
    setCouponStatus("loading");
    try {
      const res = await fetch(`/api/orders/${store.orderId}/coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupon: couponInput }),
      });
      if (res.ok) {
        const data = await res.json();
        store.setCoupon(couponInput, data.discount ?? 0);
        if (data.total_price) store.setOrderTotal(parseFloat(data.total_price));
        else if (data.total) store.setOrderTotal(data.total);
        setCouponStatus("success");
      } else {
        setCouponStatus("error");
      }
    } catch {
      setCouponStatus("error");
    }
  }

  async function handleContinue() {
    if (!store.orderId) return;
    setSaving(true);
    try {
      // Always send all extras (including 0s) so the API recalculates
      const extras: Record<string, number> = {};
      for (const opt of store.orderOptions) {
        extras[String(opt.id)] = store.selectedEquipment[opt.id] ?? 0;
      }
      const body: Record<string, unknown> = { extras };
      if (store.selectedInsurance) body.insurance = store.selectedInsurance;

      const res = await fetch(`/api/orders/${store.orderId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedTotal = parseFloat(data.total_price) || data.total;
        if (updatedTotal) store.setOrderTotal(updatedTotal);
      }
      store.setStep(3);
    } catch (e) {
      console.error("Update failed:", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <CountdownTimer />

      {/* Insurance */}
      {insurances.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <Shield className="h-4 w-4 text-accent" />
            {t("insurance")}
          </h3>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-accent/50">
              <input
                type="radio"
                name="insurance"
                checked={store.selectedInsurance === null}
                onChange={() => store.setSelectedInsurance(null)}
                className="accent-accent"
              />
              <span className="text-sm">{t("noInsurance")}</span>
            </label>
            {insurances.map((ins) => (
              <label
                key={ins.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3 transition-colors hover:border-accent/50"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="insurance"
                    checked={store.selectedInsurance === ins.id}
                    onChange={() => store.setSelectedInsurance(ins.id)}
                    className="accent-accent"
                  />
                  <div>
                    <span className="text-sm font-medium">{ins.title}</span>
                    {ins.description && (
                      <p className="text-xs text-muted-foreground">{ins.description}</p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-accent">
                  {sym}{ins.price}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Equipment / Options */}
      {options.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold">{t("equipment")}</h3>
          <div className="space-y-2">
            {options.map((opt) => {
              const count = store.selectedEquipment[opt.id] ?? 0;
              return (
                <div
                  key={opt.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex-1 pr-4">
                    <span className="text-sm font-medium">{opt.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {sym}{opt.price_day}/{t("perDay").replace("/", "")}
                    </span>
                    {opt.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{opt.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => store.setEquipmentCount(opt.id, Math.max(0, count - 1))}
                      disabled={count === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-sm disabled:opacity-30"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{count}</span>
                    <button
                      onClick={() =>
                        store.setEquipmentCount(opt.id, Math.min(opt.max_quantity, count + 1))
                      }
                      disabled={count >= opt.max_quantity}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-sm disabled:opacity-30"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coupon */}
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
          <Tag className="h-4 w-4 text-accent" />
          {t("coupon")}
        </h3>
        <div className="flex gap-2">
          <input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder={t("coupon")}
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <Button
            variant="outline"
            onClick={applyCoupon}
            disabled={!couponInput || couponStatus === "loading"}
          >
            {t("applyCoupon")}
          </Button>
        </div>
        {couponStatus === "success" && (
          <p className="mt-1 text-xs text-green-600">{t("couponApplied")}</p>
        )}
        {couponStatus === "error" && (
          <p className="mt-1 text-xs text-red-500">{t("couponError")}</p>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-lg bg-muted p-4">
        <span className="font-medium">{t("total")}</span>
        <span className="text-xl font-extrabold text-accent">
          {sym}{displayTotal.toFixed(2)}
        </span>
      </div>

      <Button
        onClick={handleContinue}
        disabled={saving}
        className="w-full bg-accent text-white hover:bg-brand-orange-hover"
        size="lg"
      >
        {saving ? "..." : t("continue")}
      </Button>
    </div>
  );
}
