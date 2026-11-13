import { Suspense } from "react";

import { LabBrowser } from "@/components/lab/lab-browser";
import { LabList } from "@/components/lab/lab-list";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { getLabs, getPathLabs, getPaths } from "@/lib/content";
import type { LabSummary } from "@/lib/lab-filters";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";

const section = getSection("/labs");

export const metadata = pageMetadata({ ...section, path: section.href });

/** Labs in learning-path order. Every lab is in exactly one path; any stray lab goes last. */
function orderedSummaries(): LabSummary[] {
  const ordered = getPaths().flatMap((learningPath) =>
    getPathLabs(learningPath),
  );
  const listed = new Set(ordered.map((lab) => lab.slug));
  const strays = getLabs().filter((lab) => !listed.has(lab.slug));
  return [...ordered, ...strays].map(
    ({
      slug,
      title,
      summary,
      hardware,
      topics,
      difficulty,
      estimatedMinutes,
      status,
    }) => ({
      slug,
      title,
      summary,
      hardware,
      topics,
      difficulty,
      estimatedMinutes,
      status,
    }),
  );
}

export default function LabsPage() {
  const labs = orderedSummaries();

  return (
    <PageShell>
      <PageHeader
        title={section.title}
        description={section.description}
        breadcrumbs={[{ label: section.title }]}
      />
      {/* The filter reads the URL on the client; without JavaScript the full list below is shown. */}
      <Suspense fallback={<LabList labs={labs} />}>
        <LabBrowser labs={labs} />
      </Suspense>
    </PageShell>
  );
}
