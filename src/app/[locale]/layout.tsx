import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingButtons } from "@/components/layout/FloatingButtons";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });

  const titles: Record<string, string> = {
    en: "Bus Service — Passenger Transportation in Kyrgyzstan, Kazakhstan, Uzbekistan",
    ru: "Bus Service — Пассажирские перевозки в Кыргызстане, Казахстане, Узбекистане",
    de: "Bus Service — Personenbeförderung in Kirgisistan, Kasachstan, Usbekistan",
  };

  return {
    title: titles[locale] ?? titles.en,
    description: t("subtitle"),
    openGraph: {
      title: titles[locale] ?? titles.en,
      description: t("subtitle"),
      siteName: "Bus Service",
      locale,
      type: "website",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ru" | "de")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingButtons />
    </NextIntlClientProvider>
  );
}
