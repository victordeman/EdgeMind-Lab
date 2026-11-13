import { CardGrid, LinkCard } from "@/components/layout/link-card";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/layout/section-heading";
import { PathCard } from "@/components/path/path-card";
import {
  getAiPages,
  getLabs,
  getLabsForAiPage,
  getPathLabs,
  getPaths,
} from "@/lib/content";
import { pathStats, pathsForTopic } from "@/lib/derive";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";

const section = getSection("/ai");

export const metadata = pageMetadata({ ...section, path: section.href });

export default function AiPage() {
  // The AI paths are the paths that contain a lab with an AI topic.
  const labs = getLabs();
  const aiSlugs = new Set(
    [
      ...pathsForTopic(getPaths(), labs, "language-models"),
      ...pathsForTopic(getPaths(), labs, "ai-agents"),
    ].map((path) => path.slug),
  );
  const aiPaths = getPaths().filter((path) => aiSlugs.has(path.slug));

  return (
    <PageShell>
      <PageHeader
        title={section.title}
        description={section.description}
        breadcrumbs={[{ label: section.title }]}
      />
      <section aria-labelledby="ai-topics" className="flex flex-col gap-4">
        <SectionHeading id="ai-topics" title="Topics" />
        <CardGrid>
          {getAiPages().map(({ slug, title, summary }) => {
            const count = getLabsForAiPage(slug).length;
            return (
              <li key={slug}>
                <LinkCard
                  href={`/ai/${slug}`}
                  title={title}
                  summary={summary}
                  footer={
                    <span className="text-muted-foreground">
                      {count} {count === 1 ? "lab" : "labs"}
                    </span>
                  }
                />
              </li>
            );
          })}
        </CardGrid>
      </section>
      <section aria-labelledby="ai-paths" className="flex flex-col gap-4">
        <SectionHeading id="ai-paths" title="AI learning paths" />
        <CardGrid>
          {aiPaths.map((path) => (
            <li key={path.slug}>
              <PathCard path={path} stats={pathStats(getPathLabs(path))} />
            </li>
          ))}
        </CardGrid>
      </section>
    </PageShell>
  );
}
