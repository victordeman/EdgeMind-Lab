import type { MetadataRoute } from "next";

import { getSiteRoutes } from "@/lib/routes";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return getSiteRoutes().map(({ path, lastModified }) => ({
    url: new URL(path, site.url).toString(),
    lastModified,
  }));
}
