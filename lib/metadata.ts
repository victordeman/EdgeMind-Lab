import type { Metadata } from "next";

import { site } from "@/lib/site";

const openGraphDefaults = {
  type: "website",
  siteName: site.name,
  locale: "en",
} as const;

export const rootMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    ...openGraphDefaults,
    title: site.name,
    description: site.description,
    url: "/",
  },
};

type PageMetadataInput = {
  title: string;
  description: string;
  /** Site-relative path of the page, for example "/labs". */
  path: string;
};

/**
 * Metadata for one page. Open Graph is repeated here because a page that sets
 * `openGraph` replaces the layout's object instead of merging into it.
 */
export function pageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...openGraphDefaults,
      title: `${title} | ${site.name}`,
      description,
      url: path,
    },
  };
}
