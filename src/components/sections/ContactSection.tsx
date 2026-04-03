"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          notes: `${data.get("service") || ""} ${data.get("message") || ""}`.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="bg-primary py-20 text-primary-foreground" id="contact">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left - info */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">
              {t("label")}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/60">
              {t("subtitle")}
            </p>

            <div className="mt-8 space-y-4">
              <a href="tel:+996500809996" className="flex items-center gap-3 text-primary-foreground/70 hover:text-accent">
                <Phone className="h-5 w-5" />
                +996 500 809 996
              </a>
              <a href="mailto:manager@bus-service.kg" className="flex items-center gap-3 text-primary-foreground/70 hover:text-accent">
                <Mail className="h-5 w-5" />
                manager@bus-service.kg
              </a>
              <div className="flex items-center gap-3 text-primary-foreground/70">
                <MapPin className="h-5 w-5" />
                Bishkek, Suerkulova St 1/5, Kyrgyzstan
              </div>
            </div>
          </div>

          {/* Right - form */}
          <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-8">
            <h3 className="text-lg font-bold">{t("formTitle")}</h3>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-primary-foreground/70">{t("name")} *</label>
                <input
                  name="name"
                  required
                  placeholder={t("namePlaceholder")}
                  className="w-full rounded-lg border border-primary-foreground/15 bg-primary-foreground/8 px-4 py-2.5 text-sm text-white placeholder:text-primary-foreground/40 focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-primary-foreground/70">{t("phone")} *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder={t("phonePlaceholder")}
                  className="w-full rounded-lg border border-primary-foreground/15 bg-primary-foreground/8 px-4 py-2.5 text-sm text-white placeholder:text-primary-foreground/40 focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-primary-foreground/70">{t("service")}</label>
                <select
                  name="service"
                  className="w-full rounded-lg border border-primary-foreground/15 bg-primary-foreground/8 px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
                >
                  <option value="">{t("servicePlaceholder")}</option>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <option key={i} className="text-foreground">{t(`serviceOptions.${i}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-primary-foreground/70">{t("message")}</label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder={t("messagePlaceholder")}
                  className="w-full rounded-lg border border-primary-foreground/15 bg-primary-foreground/8 px-4 py-2.5 text-sm text-white placeholder:text-primary-foreground/40 focus:border-accent focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-accent text-white hover:bg-brand-orange-hover"
              >
                {status === "loading" ? "..." : t("submit")}
              </Button>

              {status === "success" && (
                <p className="text-sm text-green-400">{t("success")}</p>
              )}
              {status === "error" && (
                <p className="text-sm text-red-400">{t("error")}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
