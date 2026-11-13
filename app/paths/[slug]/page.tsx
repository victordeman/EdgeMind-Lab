import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { getPath, getPaths } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";

const section = getSection("/paths");

// Only slugs with a content file exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPaths().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/paths/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = getPath(slug);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.summary,
    path: `/paths/${slug}`,
  });
}

export default async function PathPage({ params }: PageProps<"/paths/[slug]">) {
  const { slug } = await params;
  const page = getPath(slug);
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
