import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { ResourceBrowser } from "@/components/resources/resource-browser";
import { ResourceList } from "@/components/resources/resource-list";
import { getLabs, getResources } from "@/lib/content";
import { collectResources } from "@/lib/derive";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";

const section = getSection("/resources");

export const metadata = pageMetadata({ ...section, path: section.href });

export default function ResourcesPage() {
  const entries = collectResources(getLabs(), getResources());
  return (
    <PageShell>
      <PageHeader
        title={section.title}
        description={section.description}
        breadcrumbs={[{ label: section.title }]}
      />
      {/* The fallback is the full list, which is what a visitor without JavaScript sees. */}
      <Suspense fallback={<ResourceList entries={entries} />}>
        <ResourceBrowser entries={entries} />
      </Suspense>
    </PageShell>
  );
}
