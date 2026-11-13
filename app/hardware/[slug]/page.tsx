import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LabBody } from "@/components/lab/mdx";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { RelatedSections } from "@/components/layout/related-sections";
import {
  getHub,
  getHubs,
  getLabs,
  getLabsByHardware,
  getPaths,
  getResources,
} from "@/lib/content";
import {
  collectResources,
  pathsForHardware,
  resourcesForHardware,
} from "@/lib/derive";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";

const section = getSection("/hardware");

// Only slugs with a content file exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getHubs().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/hardware/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = getHub(slug);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.summary,
    path: `/hardware/${slug}`,
  });
}

export default async function HardwareHubPage({
  params,
}: PageProps<"/hardware/[slug]">) {
  const { slug } = await params;
  const page = getHub(slug);
  if (!page) notFound();

  const labs = getLabsByHardware(page.slug);
  const resources = resourcesForHardware(
    collectResources(getLabs(), getResources()),
    page.slug,
  );

  return (
    <PageShell>
      <PageHeader
        title={page.title}
        description={page.summary}
        breadcrumbs={[
          { label: section.title, href: section.href },
          { label: page.title },
        ]}
      />
      <LabBody source={page.body} />
      <RelatedSections
        idPrefix="hub"
        labs={labs}
        paths={pathsForHardware(getPaths(), getLabs(), page.slug)}
        resources={resources}
        references={page.references}
      />
    </PageShell>
  );
}
