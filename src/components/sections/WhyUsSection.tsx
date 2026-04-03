"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";

export function WhyUsSection() {
  const t = useTranslations("whyUs");

  return (
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {t("label")}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/60">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Reveal key={i} delay={i * 0.08}>
            <div
              className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 h-full"
            >
              <div className="text-3xl font-extrabold text-accent">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-3 text-base font-bold">
                {t(`reasons.${i}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-foreground/60">
                {t(`reasons.${i}.desc`)}
              </p>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
