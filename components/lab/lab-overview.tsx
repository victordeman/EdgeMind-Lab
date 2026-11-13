import Link from "next/link";

import { SectionHeading } from "@/components/layout/section-heading";
import { getLab } from "@/lib/content";
import { LAB_SECTION_IDS } from "@/lib/toc";
import type { Lab } from "@/lib/types";

/** Objectives and prerequisites, both rendered from frontmatter. */
export function LabOverview({ lab }: { lab: Lab }) {
  const { labs, knowledge } = lab.prerequisites;
  const hasPrerequisites = labs.length > 0 || knowledge.length > 0;

  return (
    <section
      aria-labelledby={LAB_SECTION_IDS.overview}
      className="flex flex-col gap-6"
    >
      <SectionHeading
        id={LAB_SECTION_IDS.overview}
        title="Objectives and prerequisites"
        className="scroll-mt-24"
      />
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight">Objectives</h3>
        <ul className="flex max-w-prose list-disc flex-col gap-1 pl-5">
          {lab.objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight">Prerequisites</h3>
        {hasPrerequisites ? (
          <ul className="flex max-w-prose list-disc flex-col gap-1 pl-5">
            {labs.map((slug) => {
              const prerequisite = getLab(slug);
              return (
                <li key={slug}>
                  <Link
                    href={`/labs/${slug}`}
                    className="text-brand underline underline-offset-4 hover:no-underline"
                  >
                    {prerequisite?.title ?? slug}
                  </Link>
                  {prerequisite?.status === "planned" ? " (coming soon)" : null}
                </li>
              );
            })}
            {knowledge.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">None.</p>
        )}
      </div>
    </section>
  );
}
