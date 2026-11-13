import { PageHeader } from "@/components/layout/page-header";
import { PageLinkList } from "@/components/layout/page-link-list";
import { PageShell } from "@/components/layout/page-shell";
import { getLabs } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";

const section = getSection("/labs");

export const metadata = pageMetadata({ ...section, path: section.href });

export default function LabsPage() {
  return (
    <PageShell>
      <PageHeader
        title={section.title}
        description={section.description}
        breadcrumbs={[{ label: section.title }]}
      />
      <PageLinkList
        items={getLabs().map(({ slug, title, summary }) => ({
          href: `/labs/${slug}`,
          title,
          summary,
        }))}
      />
    </PageShell>
  );
}
