import { MetadataRoute } from "next";
import { env } from "@/shared/config/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "https://localvista.pe";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/locales", "/locales/*", "/ingresar", "/registro"],
        disallow: ["/panel", "/panel/*", "/admin", "/admin/*", "/r/*", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
