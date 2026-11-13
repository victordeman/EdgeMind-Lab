import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { ResourceEntry } from "@/lib/derive";
import { HARDWARE_LABELS, RESOURCE_CATEGORY_LABELS } from "@/lib/labels";
import { RESOURCE_CATEGORIES } from "@/lib/schemas";

const linkClass = "text-brand underline underline-offset-4 hover:no-underline";

function isExternal(href: string): boolean {
  return /^https?:/.test(href);
}

function ResourceItem({ entry }: { entry: ResourceEntry }) {
  const isFile = !isExternal(entry.href) && !entry.href.includes("#");
  return (
    <li className="flex flex-col gap-2 py-4">
      <div className="flex flex-col gap-1">
        {isExternal(entry.href) ? (
          <a href={entry.href} className={linkClass}>
            {entry.title}
            <span className="sr-only"> (external site)</span>
          </a>
        ) : isFile ? (
          <a href={entry.href} download className={linkClass}>
            {entry.title}
          </a>
        ) : (
          <Link href={entry.href} className={linkClass}>
            {entry.title}
          </Link>
        )}
        <p className="max-w-prose text-sm text-muted-foreground">
          {entry.description}
        </p>
      </div>
      <ul className="flex list-none flex-wrap items-center gap-2 p-0 text-sm">
        {entry.hardware.map((value) => (
          <li key={value}>
            <Badge>{HARDWARE_LABELS[value]}</Badge>
          </li>
        ))}
        {entry.lab ? (
          <li>
            <span className="text-muted-foreground">Lab: </span>
            <Link href={`/labs/${entry.lab.slug}`} className={linkClass}>
              {entry.lab.title}
            </Link>
          </li>
        ) : null}
      </ul>
    </li>
  );
}

/** Entries grouped by category, in the order of `RESOURCE_CATEGORIES`. Empty groups are left out. */
export function ResourceList({
  entries,
  headingLevel: Heading = "h2",
}: {
  entries: ResourceEntry[];
  headingLevel?: "h2" | "h3";
}) {
  return (
    <div className="flex flex-col gap-10">
      {RESOURCE_CATEGORIES.map((category) => {
        const group = entries.filter((entry) => entry.category === category);
        if (group.length === 0) return null;
        const headingId = `resources-${category}`;
        return (
          <section
            key={category}
            aria-labelledby={headingId}
            className="flex flex-col gap-2"
          >
            <Heading
              id={headingId}
              className={
                Heading === "h2"
                  ? "text-2xl font-semibold tracking-tight"
                  : "text-lg font-semibold tracking-tight"
              }
            >
              {RESOURCE_CATEGORY_LABELS[category]}
            </Heading>
            <ul className="flex list-none flex-col divide-y border-y p-0">
              {group.map((entry) => (
                <ResourceItem
                  key={`${entry.href}|${entry.title}`}
                  entry={entry}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
