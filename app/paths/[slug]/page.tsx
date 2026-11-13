import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LabBody } from "@/components/lab/mdx";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/layout/section-heading";
import { ModuleList } from "@/components/path/module-list";
import { PathProgress } from "@/components/path/path-progress";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getPath, getPathLabs, getPaths } from "@/lib/content";
import { firstAvailableLab, pathStats } from "@/lib/derive";
import { DIFFICULTY_LABELS, formatMinutes } from "@/lib/labels";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

  const labs = getPathLabs(page);
  const stats = pathStats(labs);
  const first = firstAvailableLab(labs);

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
      <div className="flex flex-col gap-4">
        <ul className="flex list-none flex-wrap gap-2 p-0">
          <li>
            <Badge>{DIFFICULTY_LABELS[page.difficulty]}</Badge>
          </li>
          <li>
            <Badge>
              {stats.available} of {stats.total}{" "}
              {stats.total === 1 ? "lab" : "labs"} available
            </Badge>
          </li>
          {stats.minutes > 0 ? (
            <li>
              <Badge>Total time: {formatMinutes(stats.minutes)}</Badge>
            </li>
          ) : null}
        </ul>
        <PathProgress total={stats.available} />
        {first ? (
          <div>
            <Link
              href={`/labs/${first.slug}`}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Start path
              <span className="sr-only">: {first.title}</span>
            </Link>
          </div>
        ) : null}
      </div>
      <LabBody source={page.body} />
      <section aria-labelledby="outcomes" className="flex flex-col gap-3">
        <SectionHeading id="outcomes" title="What you will be able to do" />
        <ul className="flex max-w-prose list-disc flex-col gap-1 pl-5">
          {page.outcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="modules" className="flex flex-col gap-4">
        <SectionHeading id="modules" title="Modules and labs" />
        <ModuleList modules={page.modules} labs={labs} />
      </section>
    </PageShell>
  );
}
