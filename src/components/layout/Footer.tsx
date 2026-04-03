import { useTranslations } from "next-intl";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/assets/images/logo.jpg"
                alt="Bus Service"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-lg font-bold">Bus Service</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
              {t("desc")}
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary-foreground/50">
              {t("servicesTitle")}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#services" className="text-primary-foreground/70 transition-colors hover:text-accent">Bus Rental</a></li>
              <li><a href="#services" className="text-primary-foreground/70 transition-colors hover:text-accent">Minibus Rental</a></li>
              <li><a href="#services" className="text-primary-foreground/70 transition-colors hover:text-accent">SUV Rental</a></li>
              <li><a href="#services" className="text-primary-foreground/70 transition-colors hover:text-accent">VIP Transport</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary-foreground/50">
              {t("companyTitle")}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#about" className="text-primary-foreground/70 transition-colors hover:text-accent">{t("aboutUs")}</a></li>
              <li><a href="#services" className="text-primary-foreground/70 transition-colors hover:text-accent">{t("fleetCatalog")}</a></li>
              <li><a href="#contact" className="text-primary-foreground/70 transition-colors hover:text-accent">{t("contactUs")}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary-foreground/50">
              {t("contactTitle")}
            </h3>
            <address className="space-y-3 text-sm not-italic">
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+996500809996" className="hover:text-accent">+996 500 809 996</a>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:manager@bus-service.kg" className="hover:text-accent">manager@bus-service.kg</a>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <MapPin className="h-4 w-4 shrink-0" />
                Bishkek, Suerkulova 1/5
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <Clock className="h-4 w-4 shrink-0" />
                {t("open247")}
              </div>
            </address>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 sm:flex-row">
          <p className="text-xs text-primary-foreground/50">
            {t("copyright", { year: String(year) })}
          </p>
          <div className="flex gap-4 text-xs text-primary-foreground/50">
            <a href="#" className="hover:text-accent">{t("privacy")}</a>
            <a href="#" className="hover:text-accent">{t("terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
