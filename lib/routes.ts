import { getAiPages, getHubs, getLabs, getPaths } from "@/lib/content";

/** Top-level pages that exist regardless of content. */
export const STATIC_ROUTES = [
  "/",
  "/paths",
  "/labs",
  "/hardware",
  "/ai",
  "/resources",
  "/about",
] as const;

export type SiteRoute = {
  path: string;
  /** ISO date of the last content change, where the content records one. */
  lastModified?: string;
};

/** Every page of the site: the static routes plus one per content file. */
export function getSiteRoutes(): SiteRoute[] {
  return [
    ...STATIC_ROUTES.map((path) => ({ path })),
    ...getPaths().map(({ slug }) => ({ path: `/paths/${slug}` })),
    ...getLabs().map(({ slug, updated }) => ({
      path: `/labs/${slug}`,
      lastModified: updated,
    })),
    ...getHubs().map(({ slug }) => ({ path: `/hardware/${slug}` })),
    ...getAiPages().map(({ slug }) => ({ path: `/ai/${slug}` })),
  ];
}
