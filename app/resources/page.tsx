import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";

const section = getSection("/resources");

export const metadata = pageMetadata({ ...section, path: section.href });

export default function ResourcesPage() {
  return (
    <PageShell>
      <PageHeader
        title={section.title}
        description={section.description}
        breadcrumbs={[{ label: section.title }]}
      />
    </PageShell>
  );
}
