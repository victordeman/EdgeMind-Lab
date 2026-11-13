import { CardGrid } from "@/components/layout/link-card";
import { LabLinkList } from "@/components/layout/lab-link-list";
import { PathCard } from "@/components/path/path-card";
import { ResourceList } from "@/components/resources/resource-list";
import { SectionHeading } from "@/components/layout/section-heading";
import { getPathLabs } from "@/lib/content";
import { pathStats, type ResourceEntry } from "@/lib/derive";
import type { Lab, LearningPath, Reference } from "@/lib/types";

/**
 * The derived sections of a hub or AI page: labs, related paths, resources and
 * references. Each section is left out when it would be empty.
 */
export function RelatedSections({
  idPrefix,
  labs,
  paths,
  resources,
  references,
}: {
  idPrefix: string;
  labs: Lab[];
  paths: LearningPath[];
  resources: ResourceEntry[];
  references: Reference[];
}) {
  return (
    <>
      <section
        aria-labelledby={`${idPrefix}-labs`}
        className="flex flex-col gap-4"
      >
        <SectionHeading id={`${idPrefix}-labs`} title="Labs" />
        {labs.length > 0 ? (
          <LabLinkList labs={labs} />
        ) : (
          <p className="text-muted-foreground">No labs yet.</p>
        )}
      </section>
      {paths.length > 0 ? (
        <section
          aria-labelledby={`${idPrefix}-paths`}
          className="flex flex-col gap-4"
        >
          <SectionHeading
            id={`${idPrefix}-paths`}
            title="Related learning paths"
          />
          <CardGrid>
            {paths.map((path) => (
              <li key={path.slug}>
                <PathCard path={path} stats={pathStats(getPathLabs(path))} />
              </li>
            ))}
          </CardGrid>
        </section>
      ) : null}
      {resources.length > 0 ? (
        <section
          aria-labelledby={`${idPrefix}-resources`}
          className="flex flex-col gap-4"
        >
          <SectionHeading
            id={`${idPrefix}-resources`}
            title="Related resources"
          />
          <ResourceList entries={resources} headingLevel="h3" />
        </section>
      ) : null}
      <section
        aria-labelledby={`${idPrefix}-references`}
        className="flex flex-col gap-4"
      >
        <SectionHeading id={`${idPrefix}-references`} title="References" />
        <ul className="flex max-w-prose list-disc flex-col gap-1 pl-5">
          {references.map((reference) => (
            <li key={reference.url}>
              <a
                href={reference.url}
                className="text-brand underline underline-offset-4 hover:no-underline"
              >
                {reference.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
