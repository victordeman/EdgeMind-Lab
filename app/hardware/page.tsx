import { CardGrid, LinkCard } from "@/components/layout/link-card";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { getHubs, getLabsByHardware } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";

const section = getSection("/hardware");

export const metadata = pageMetadata({ ...section, path: section.href });

export default function HardwarePage() {
  return (
    <PageShell>
      <PageHeader
        title={section.title}
        description={section.description}
        breadcrumbs={[{ label: section.title }]}
      />
      <CardGrid>
        {getHubs().map(({ slug, title, summary }) => {
          const count = getLabsByHardware(slug).length;
          return (
            <li key={slug}>
              <LinkCard
                href={`/hardware/${slug}`}
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
    </PageShell>
  );
}
