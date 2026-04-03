"use client";

import { useTranslations } from "next-intl";
import { Bus, Truck, Mountain, Crown, Globe, ThumbsUp, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const serviceKeys = ["bus", "minibus", "suv", "vip", "tours", "rental"] as const;
const serviceIcons = [Bus, Truck, Mountain, Crown, Globe, ThumbsUp];

export function ServicesSection() {
  const t = useTranslations("services");

  return (
    <section className="py-20" id="services">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {t("label")}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serviceKeys.map((key, i) => {
            const Icon = serviceIcons[i];
            return (
              <Reveal key={key} delay={i * 0.1}>
              <article
                className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg h-full"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{t(`${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`${key}.desc`)}
                </p>
                <a
                  href="#contact"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-brand-orange-hover"
                >
                  {t(`${key}.link`)}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
