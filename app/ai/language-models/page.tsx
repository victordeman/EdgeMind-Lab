import { notFound } from "next/navigation";

import { LabBody } from "@/components/lab/mdx";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { RelatedSections } from "@/components/layout/related-sections";
import {
  getAiPage,
  getLabs,
  getLabsForAiPage,
  getPaths,
  getResources,
} from "@/lib/content";
import { collectResources, pathsForTopic } from "@/lib/derive";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";

const section = getSection("/ai");
const page = getAiPage("language-models");

export const metadata = page
  ? pageMetadata({
      title: page.title,
      description: page.summary,
      path: "/ai/language-models",
    })
  : {};

export default function LanguageModelsPage() {
  if (!page) notFound();

  const labs = getLabsForAiPage("language-models");
  const labSlugs = new Set(labs.map((lab) => lab.slug));
  // Resources that belong to one of this page's labs.
  const resources = collectResources(getLabs(), getResources()).filter(
    (entry) => entry.lab && labSlugs.has(entry.lab.slug),
  );

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
      <LabBody source={page.body} />
      <RelatedSections
        idPrefix="ai"
        labs={labs}
        paths={pathsForTopic(getPaths(), getLabs(), "language-models")}
        resources={resources}
        references={page.references}
      />
    </PageShell>
  );
}
