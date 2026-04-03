"use client";

import { useTranslations } from "next-intl";
import { useBookingStore } from "@/stores/booking";
import { Check } from "lucide-react";

// Steps displayed: Search (always done) → Vehicle → Extras → Confirm
const stepKeys = [0, 1, 2, 3];

export function StepIndicator() {
  const t = useTranslations("booking");
  const currentStep = useBookingStore((s) => s.currentStep);

  return (
    <div className="flex items-center justify-center gap-2">
      {stepKeys.map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              step < currentStep
                ? "bg-accent text-white"
                : step === currentStep
                  ? "bg-accent text-white ring-4 ring-accent/20"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {step < currentStep ? <Check className="h-4 w-4" /> : step + 1}
          </div>
          <span
            className={`ml-2 hidden text-sm font-medium sm:inline ${
              step === currentStep ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {t(`steps.${step}`)}
          </span>
          {step < 3 && (
            <div
              className={`mx-3 h-px w-8 sm:w-12 ${
                step < currentStep ? "bg-accent" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
