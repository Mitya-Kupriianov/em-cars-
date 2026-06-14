import type { MetadataRoute } from "next";

const BASE_URL = "https://electro-motors.top";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/sign-in", "/sign-up"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
