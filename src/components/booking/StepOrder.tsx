"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useBookingStore } from "@/stores/booking";
import { CountdownTimer } from "./CountdownTimer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const driverSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  country: z.string().optional(),
});

type DriverForm = z.infer<typeof driverSchema>;

export function StepOrder() {
  const t = useTranslations("booking");
  const store = useBookingStore();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DriverForm>({
    resolver: zodResolver(driverSchema),
  });

  async function onSubmit(data: DriverForm) {
    if (!store.orderId) return;
    setConfirming(true);
    setError(null);

    try {
      // Confirm order with driver details and payment method
      const selectedPayment = store.paymentMethods.find(
        (pm) => pm.id === (store.paymentMethodId ?? store.paymentMethods[0]?.id)
      );

      const res = await fetch(`/api/orders/${store.orderId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drivers: [data],
          // Send payment method ID — the API expects the ID, not the name
          payment_method: String(selectedPayment?.id ?? store.paymentMethods[0]?.id ?? 1),
        }),
      });

      if (res.ok) {
        const order = await res.json();
        // Server builds the full Stripe payment URL from V2 response
        const paymentUrl = order.payment_url;
        store.confirmOrder(paymentUrl);

        if (paymentUrl) {
          window.location.href = paymentUrl;
        }
      } else {
        const errData = await res.json().catch(() => null);
        setError(errData?.error || t("confirmError"));
      }
    } catch (e) {
      console.error("Confirmation failed:", e);
      setError(t("confirmError"));
    } finally {
      setConfirming(false);
    }
  }

  if (store.orderConfirmed) {
    return (
      <div className="py-12 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h3 className="mt-4 text-2xl font-extrabold">{t("bookingConfirmed")}</h3>
        {store.paymentUrl && (
          <p className="mt-2 text-muted-foreground">{t("redirecting")}</p>
        )}
        <Button
          onClick={() => store.reset()}
          variant="outline"
          className="mt-6"
        >
          {t("backToSearch")}
        </Button>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none";
  const errorClass = "mt-1 text-xs text-red-500";

  return (
    <div className="space-y-6">
      <CountdownTimer />

      {/* Order summary */}
      <div className="rounded-lg bg-muted p-4">
        <h3 className="text-sm font-bold">{t("orderSummary")}</h3>
        <div className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("vehicle")}</span>
            <span className="font-medium">{store.selectedVehicle?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("dates")}</span>
            <span className="font-medium">
              {store.pickupDate} — {store.returnDate}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5">
            <span className="font-bold">{t("total")}</span>
            <span className="text-lg font-extrabold text-accent">
              {store.currencySymbol}{store.orderTotal}
            </span>
          </div>
        </div>
      </div>

      {/* Driver details form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-sm font-bold">{t("driverDetails")}</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("firstName")} *</label>
            <input {...register("first_name")} className={inputClass} />
            {errors.first_name && <p className={errorClass}>{t("validation.firstNameRequired")}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("lastName")} *</label>
            <input {...register("last_name")} className={inputClass} />
            {errors.last_name && <p className={errorClass}>{t("validation.lastNameRequired")}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("email")} *</label>
            <input {...register("email")} type="email" className={inputClass} />
            {errors.email && <p className={errorClass}>{t("validation.invalidEmail")}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("phoneNumber")} *</label>
            <input {...register("phone")} type="tel" className={inputClass} />
            {errors.phone && <p className={errorClass}>{t("validation.phoneRequired")}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("country")}</label>
          <input {...register("country")} className={inputClass} />
        </div>

        {/* Payment method */}
        {store.paymentMethods.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold">{t("paymentMethod")}</h3>
            <div className="space-y-2">
              {store.paymentMethods.map((pm) => (
                <label
                  key={pm.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-accent/50"
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={(store.paymentMethodId ?? store.paymentMethods[0]?.id) === pm.id}
                    onChange={() => store.setPaymentMethodId(pm.id)}
                    className="accent-accent"
                  />
                  <span className="text-sm font-medium">{pm.name}</span>
                  {pm.discount && pm.discount > 0 && (
                    <span className="text-xs text-green-600">-{pm.discount}%</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={confirming}
          className="w-full bg-accent text-white hover:bg-brand-orange-hover"
          size="lg"
        >
          {confirming ? t("confirming") : t("confirmBooking")}
        </Button>
      </form>
    </div>
  );
}
