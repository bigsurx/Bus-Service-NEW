import { useTranslations } from "next-intl";
import Image from "next/image";
import { Check } from "lucide-react";

const flags: Record<string, string> = {
  kg: "\u{1F1F0}\u{1F1EC}",
  kz: "\u{1F1F0}\u{1F1FF}",
  uz: "\u{1F1FA}\u{1F1FF}",
  ae: "\u{1F1E6}\u{1F1EA}",
};

export function AboutSection() {
  const t = useTranslations("about");

  return (
    <section className="bg-muted/50 py-20" id="about">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Image */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="/assets/images/fleet-general.webp"
                alt="Bus Service fleet"
                width={640}
                height={440}
                className="h-auto w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 flex flex-col items-center rounded-xl bg-accent px-5 py-4 text-white shadow-lg sm:-bottom-6 sm:-right-6">
              <div className="text-3xl font-extrabold">4+</div>
              <div className="text-xs font-semibold">{t("label")}</div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              {t("label")}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>

            <ul className="mt-6 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Check className="h-3 w-3 text-accent" />
                  </span>
                  <span className="text-sm">{t(`facts.${i}`)}</span>
                </li>
              ))}
            </ul>

            {/* Geography */}
            <div className="mt-8">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t("geoTitle")}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {Object.entries(flags).map(([code, flag]) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium"
                  >
                    <span className="text-base">{flag}</span>
                    {t(`countries.${code}`)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
