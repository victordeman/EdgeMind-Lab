import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { getHub, getHubs } from "@/lib/content";
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
    </PageShell>
  );
}
