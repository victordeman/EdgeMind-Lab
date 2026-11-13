import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/layout/section-heading";
import { getNextPrevLab, getPathForLab, getRelatedLabs } from "@/lib/content";
import { LAB_SECTION_IDS } from "@/lib/toc";
import type { Lab } from "@/lib/types";

function NeighbourLink({
  lab,
  direction,
}: {
  lab: Lab;
  direction: "previous" | "next";
}) {
  const Arrow = direction === "previous" ? ArrowLeft : ArrowRight;
  return (
    <Link
      href={`/labs/${lab.slug}`}
      className={`flex flex-1 flex-col gap-1 rounded-lg border border-input p-4 hover:bg-accent ${
        direction === "next" ? "sm:items-end sm:text-right" : ""
      }`}
    >
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        {direction === "previous" ? (
          <Arrow aria-hidden className="size-4" />
        ) : null}
        {direction === "previous" ? "Previous lab" : "Next lab"}
        {direction === "next" ? <Arrow aria-hidden className="size-4" /> : null}
      </span>
      <span className="font-semibold">{lab.title}</span>
    </Link>
  );
}

/** Previous and next lab in the lab's path, plus up to three related labs. */
export function LabNav({ slug }: { slug: string }) {
  const { previous, next } = getNextPrevLab(slug);
  const learningPath = getPathForLab(slug);
  const related = getRelatedLabs(slug, 3);

  return (
    <section
      aria-labelledby={LAB_SECTION_IDS.next}
      className="flex flex-col gap-6"
    >
      <SectionHeading
        id={LAB_SECTION_IDS.next}
        title="Next steps"
        className="scroll-mt-24"
      />
      {learningPath ? (
        <p>
          Part of the path{" "}
          <Link
            href={`/paths/${learningPath.slug}`}
            className="text-brand underline underline-offset-4 hover:no-underline"
          >
            {learningPath.title}
          </Link>
          .
        </p>
      ) : null}
      {previous || next ? (
        <nav
          aria-label="Previous and next lab"
          className="flex flex-col gap-3 sm:flex-row"
        >
          {previous ? (
            <NeighbourLink lab={previous} direction="previous" />
          ) : null}
          {next ? <NeighbourLink lab={next} direction="next" /> : null}
        </nav>
      ) : null}
      {related.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold tracking-tight">Related labs</h3>
          <ul className="flex max-w-prose list-disc flex-col gap-1 pl-5">
            {related.map((lab) => (
              <li key={lab.slug}>
                <Link
                  href={`/labs/${lab.slug}`}
                  className="text-brand underline underline-offset-4 hover:no-underline"
                >
                  {lab.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
