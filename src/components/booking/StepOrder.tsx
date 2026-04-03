"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useBookingStore } from "@/stores/booking";
import { CountdownTimer } from "./CountdownTimer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Upload, X, Loader2, FileImage } from "lucide-react";

const driverSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  country: z.string().optional(),
  license_num: z.string().optional(),
  license_from: z.string().optional(),
  license_to: z.string().optional(),
});

type DriverForm = z.infer<typeof driverSchema>;

interface UploadedFile {
  id: string;
  url: string;
  name: string;
}

export function StepOrder() {
  const t = useTranslations("booking");
  const store = useBookingStore();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // License photo upload state
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DriverForm>({
    resolver: zodResolver(driverSchema),
  });

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (uploadedPhotos.length + files.length > 2) return; // max 2 photos

    setUploading(true);
    setUploadError(null);

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setUploadedPhotos((prev) => [
            ...prev,
            { id: String(data.id), url: data.url, name: file.name },
          ]);
        } else {
          setUploadError(t("uploadFailed"));
        }
      } catch {
        setUploadError(t("uploadFailed"));
      }
    }

    setUploading(false);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(id: string) {
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  async function onSubmit(data: DriverForm) {
    if (!store.orderId) return;
    setConfirming(true);
    setError(null);

    try {
      const selectedPayment = store.paymentMethods.find(
        (pm) => pm.id === (store.paymentMethodId ?? store.paymentMethods[0]?.id)
      );

      // Merge license fields + photo IDs into driver data
      const driverData = {
        ...data,
        ...(uploadedPhotos.length > 0 && {
          license_photo: uploadedPhotos.map((p) => p.id),
        }),
      };

      const res = await fetch(`/api/orders/${store.orderId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drivers: [driverData],
          payment_method: String(
            selectedPayment?.id ?? store.paymentMethods[0]?.id ?? 1
          ),
        }),
      });

      if (res.ok) {
        const order = await res.json();
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
        <h3 className="mt-4 text-2xl font-extrabold">
          {t("bookingConfirmed")}
        </h3>
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
              {store.currencySymbol || "$"}
              {store.orderTotal}
            </span>
          </div>
        </div>
      </div>

      {/* Driver details form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-sm font-bold">{t("driverDetails")}</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("firstName")} *
            </label>
            <input {...register("first_name")} className={inputClass} />
            {errors.first_name && (
              <p className={errorClass}>
                {t("validation.firstNameRequired")}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("lastName")} *
            </label>
            <input {...register("last_name")} className={inputClass} />
            {errors.last_name && (
              <p className={errorClass}>
                {t("validation.lastNameRequired")}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("email")} *
            </label>
            <input
              {...register("email")}
              type="email"
              className={inputClass}
            />
            {errors.email && (
              <p className={errorClass}>{t("validation.invalidEmail")}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("phoneNumber")} *
            </label>
            <input
              {...register("phone")}
              type="tel"
              className={inputClass}
            />
            {errors.phone && (
              <p className={errorClass}>{t("validation.phoneRequired")}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("country")}
          </label>
          <input {...register("country")} className={inputClass} />
        </div>

        {/* ── Driver License ── */}
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-bold">{t("licenseDetails")}</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            {t("licensePhotoHint")}
          </p>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("licenseNumber")}
            </label>
            <input {...register("license_num")} className={inputClass} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t("licenseIssueDate")}
              </label>
              <input
                {...register("license_from")}
                type="date"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t("licenseExpiryDate")}
              </label>
              <input
                {...register("license_to")}
                type="date"
                className={inputClass}
              />
            </div>
          </div>

          {/* License photo upload */}
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium">
              {t("licensePhoto")}
            </label>

            {/* Uploaded previews */}
            {uploadedPhotos.length > 0 && (
              <div className="mb-3 flex gap-3">
                {uploadedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2"
                  >
                    <FileImage className="h-4 w-4 text-accent" />
                    <span className="max-w-[120px] truncate text-xs text-foreground">
                      {photo.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload area */}
            {uploadedPhotos.length < 2 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFileUpload(e.dataTransfer.files);
                }}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-6 transition-colors hover:border-accent hover:bg-accent/5"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {uploading ? t("uploading") : t("licensePhoto")}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            )}

            {uploadError && (
              <p className="mt-1 text-xs text-red-500">{uploadError}</p>
            )}
          </div>
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
                    checked={
                      (store.paymentMethodId ??
                        store.paymentMethods[0]?.id) === pm.id
                    }
                    onChange={() => store.setPaymentMethodId(pm.id)}
                    className="accent-accent"
                  />
                  <span className="text-sm font-medium">{pm.name}</span>
                  {pm.discount && pm.discount > 0 && (
                    <span className="text-xs text-green-600">
                      -{pm.discount}%
                    </span>
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
          disabled={confirming || uploading}
          className="w-full bg-accent text-white hover:bg-brand-orange-hover"
          size="lg"
        >
          {confirming ? t("confirming") : t("confirmBooking")}
        </Button>
      </form>
    </div>
  );
}
