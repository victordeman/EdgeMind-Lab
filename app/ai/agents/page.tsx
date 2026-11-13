import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { getAiPage } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";

const section = getSection("/ai");
const page = getAiPage("agents");

export const metadata = page
  ? pageMetadata({
      title: page.title,
      description: page.summary,
      path: "/ai/agents",
    })
  : {};

export default function AgentsPage() {
  if (!page) notFound();

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
    </PageShell>
  );
}
