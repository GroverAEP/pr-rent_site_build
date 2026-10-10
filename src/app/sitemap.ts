import { MetadataRoute } from "next";
import { getRepositories } from "@/shared/db/factory";
import { env } from "@/shared/config/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "https://localvista.pe";
  const repos = getRepositories();

  // Obtener locales publicados
  let localesUrls: MetadataRoute.Sitemap = [];
  try {
    const { items } = await repos.locales.search({ estado: "publicado", limit: 200 });
    localesUrls = items.map((local) => ({
      url: `${baseUrl}/locales/${local.slug}`,
      lastModified: new Date(local.updated_at || local.created_at),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error generando sitemap para locales:", error);
  }

  // Rutas estáticas principales
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/locales`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ingresar`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/registro`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...localesUrls];
}
