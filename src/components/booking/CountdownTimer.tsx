"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useBookingStore } from "@/stores/booking";
import { Clock } from "lucide-react";

export function CountdownTimer() {
  const t = useTranslations("booking");
  const { timerStart, timerDuration, reset } = useBookingStore();
  const [remaining, setRemaining] = useState(timerDuration);

  useEffect(() => {
    if (!timerStart) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - timerStart;
      const left = Math.max(0, timerDuration - elapsed);
      setRemaining(left);

      if (left <= 0) {
        clearInterval(interval);
        reset();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStart, timerDuration, reset]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  if (!timerStart) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-4 py-2 text-sm">
      <Clock className="h-4 w-4 text-accent" />
      <span className="text-muted-foreground">{t("bookingHold")}</span>
      <span className="font-mono font-bold text-accent">
        {minutes}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
