import { PageHeader } from "@/components/layout/page-header";
import { PageLinkList } from "@/components/layout/page-link-list";
import { PageShell } from "@/components/layout/page-shell";
import { getHubs } from "@/lib/content";
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
      <PageLinkList
        items={getHubs().map(({ slug, title, summary }) => ({
          href: `/hardware/${slug}`,
          title,
          summary,
        }))}
      />
    </PageShell>
  );
}
