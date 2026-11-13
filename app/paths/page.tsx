import { PageHeader } from "@/components/layout/page-header";
import { PageLinkList } from "@/components/layout/page-link-list";
import { PageShell } from "@/components/layout/page-shell";
import { getPaths } from "@/lib/content";
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
      <PageLinkList
        items={getPaths().map(({ slug, title, summary }) => ({
          href: `/paths/${slug}`,
          title,
          summary,
        }))}
      />
    </PageShell>
  );
}
