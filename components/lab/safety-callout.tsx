import { TriangleAlert } from "lucide-react";

import { SectionHeading } from "@/components/layout/section-heading";
import { LAB_SECTION_IDS } from "@/lib/toc";

/** Safety notes from frontmatter, shown above the steps. Renders nothing when there are none. */
export function SafetyCallout({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null;

  return (
    <section
      aria-labelledby={LAB_SECTION_IDS.safety}
      className="flex flex-col gap-3 rounded-lg border border-l-4 border-input border-l-destructive bg-muted p-5"
    >
      <div className="flex items-center gap-2">
        <TriangleAlert aria-hidden className="size-5 text-destructive" />
        <SectionHeading
          id={LAB_SECTION_IDS.safety}
          title="Safety"
          className="scroll-mt-24"
        />
      </div>
      <ul className="flex max-w-prose list-disc flex-col gap-1 pl-5">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  );
}
