import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BomTable } from "@/components/lab/bom-table";
import { DownloadList } from "@/components/lab/download-list";
import { LabHeader } from "@/components/lab/lab-header";
import { LabNav } from "@/components/lab/lab-nav";
import { LabOverview } from "@/components/lab/lab-overview";
import { LabBody } from "@/components/lab/mdx";
import { ReferenceList } from "@/components/lab/reference-list";
import { SafetyCallout } from "@/components/lab/safety-callout";
import { TableOfContents } from "@/components/lab/table-of-contents";
import { PageShell } from "@/components/layout/page-shell";
import { getLab, getLabs } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { buildLabToc } from "@/lib/toc";

// Only slugs with a content file exist; anything else is a 404.
export const dynamicParams = false;

// Planned labs are included: they render a short "Coming soon" page.
export function generateStaticParams() {
  return getLabs().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/labs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lab = getLab(slug);
  if (!lab) return {};
  return pageMetadata({
    title: lab.title,
    description: lab.summary,
    path: `/labs/${slug}`,
  });
}

export default async function LabPage({ params }: PageProps<"/labs/[slug]">) {
  const { slug } = await params;
  const lab = getLab(slug);
  if (!lab) notFound();

  if (lab.status === "planned") {
    return (
      <PageShell>
        <LabHeader lab={lab} />
        <LabOverview lab={lab} />
        <LabNav slug={lab.slug} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <LabHeader lab={lab} />
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_15rem]">
        <TableOfContents items={buildLabToc(lab)} />
        <article className="flex min-w-0 flex-col gap-10">
          <LabOverview lab={lab} />
          <BomTable items={lab.bom} />
          <SafetyCallout notes={lab.safety} />
          <LabBody source={lab.body} />
          <DownloadList downloads={lab.downloads} />
          <ReferenceList references={lab.references} />
          <LabNav slug={lab.slug} />
        </article>
      </div>
    </PageShell>
  );
}
