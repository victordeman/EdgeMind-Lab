import { SectionHeading } from "@/components/layout/section-heading";
import { LAB_SECTION_IDS } from "@/lib/toc";
import type { Reference } from "@/lib/types";

/** Official sources for the lab's technical facts. */
export function ReferenceList({ references }: { references: Reference[] }) {
  return (
    <section
      aria-labelledby={LAB_SECTION_IDS.references}
      className="flex flex-col gap-4"
    >
      <SectionHeading
        id={LAB_SECTION_IDS.references}
        title="References"
        description="Pin numbers, voltages and commands in this lab come from these sources."
        className="scroll-mt-24"
      />
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
  );
}
