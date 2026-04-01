import { setRequestLocale } from "next-intl/server";
import { ContactSection } from "@/components/sections/ContactSection";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContactsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContactSection />;
}
