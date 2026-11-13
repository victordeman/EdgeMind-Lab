import { CardGrid } from "@/components/layout/link-card";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { PathCard } from "@/components/path/path-card";
import { getPathLabs, getPaths } from "@/lib/content";
import { pathStats } from "@/lib/derive";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";

const section = getSection("/paths");

export const metadata = pageMetadata({ ...section, path: section.href });

export default function PathsPage() {
  return (
    <PageShell>
      <PageHeader
        title={section.title}
        description={section.description}
        breadcrumbs={[{ label: section.title }]}
      />
      <CardGrid>
        {getPaths().map((path) => (
          <li key={path.slug}>
            <PathCard path={path} stats={pathStats(getPathLabs(path))} />
          </li>
        ))}
      </CardGrid>
    </PageShell>
  );
}
