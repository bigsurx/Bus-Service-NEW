"use client";

import { useBookingStore } from "@/stores/booking";
import { StepIndicator } from "./StepIndicator";
import { StepVehicles } from "./StepVehicles";
import { StepExtras } from "./StepExtras";
import { StepOrder } from "./StepOrder";

export function BookingWizard() {
  const currentStep = useBookingStore((s) => s.currentStep);

  // Step 0 (search) is now in the hero — wizard only shows for steps 1+
  if (currentStep < 1) return null;

  const steps: Record<number, React.ComponentType> = {
    1: StepVehicles,
    2: StepExtras,
    3: StepOrder,
  };
  const StepComponent = steps[currentStep];
  if (!StepComponent) return null;

  return (
    <section className="py-16" id="booking">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <StepIndicator />
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <StepComponent />
        </div>
      </div>
    </section>
  );
}
