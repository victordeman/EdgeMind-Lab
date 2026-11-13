import { PageHeader } from "@/components/layout/page-header";
import { PageLinkList } from "@/components/layout/page-link-list";
import { PageShell } from "@/components/layout/page-shell";
import { getAiPages } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";

const section = getSection("/ai");

export const metadata = pageMetadata({ ...section, path: section.href });

export default function AiPage() {
  return (
    <PageShell>
      <PageHeader
        title={section.title}
        description={section.description}
        breadcrumbs={[{ label: section.title }]}
      />
      <PageLinkList
        items={getAiPages().map(({ slug, title, summary }) => ({
          href: `/ai/${slug}`,
          title,
          summary,
        }))}
      />
    </PageShell>
  );
}
