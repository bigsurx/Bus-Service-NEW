import { useTranslations } from "next-intl";
import { Shield, Clock, Users, Truck, DollarSign } from "lucide-react";

export function TrustBar() {
  const t = useTranslations("trust");

  const items = [
    { icon: Shield, label: t("safety") },
    { icon: Clock, label: t("support") },
    { icon: Users, label: t("drivers") },
    { icon: Truck, label: t("fleet") },
    { icon: DollarSign, label: t("pricing") },
  ];

  return (
    <div className="border-y border-border bg-muted/50 py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 sm:gap-10 sm:px-6">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <item.icon className="h-4 w-4 text-accent" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
