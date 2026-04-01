import type { MetadataRoute } from "next";

const baseUrl = "https://bus-service.kg";
const locales = ["en", "ru", "de"];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/contacts"];

  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    }))
  );
}
