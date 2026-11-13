import { Clock } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  DIFFICULTY_LABELS,
  HARDWARE_LABELS,
  STATUS_LABELS,
  formatMinutes,
} from "@/lib/labels";
import type { LabSummary } from "@/lib/lab-filters";

/** One lab in the index. The title link covers the whole card. */
export function LabCard({ lab }: { lab: LabSummary }) {
  return (
    <article className="relative flex flex-col gap-3 rounded-lg border border-input bg-card p-5 text-card-foreground hover:bg-accent">
      <h3 className="text-lg font-semibold tracking-tight">
        <Link
          href={`/labs/${lab.slug}`}
          className="after:absolute after:inset-0 after:content-[''] hover:underline"
        >
          {lab.title}
        </Link>
      </h3>
      <p className="text-muted-foreground">{lab.summary}</p>
      <ul className="mt-auto flex flex-wrap gap-2 pt-1">
        {lab.status !== "reviewed" ? (
          <li>
            <Badge>{STATUS_LABELS[lab.status]}</Badge>
          </li>
        ) : null}
        <li>
          <Badge>{DIFFICULTY_LABELS[lab.difficulty]}</Badge>
        </li>
        <li>
          <Badge>
            <Clock aria-hidden className="size-3" />
            <span>
              <span className="sr-only">Estimated time: </span>
              {formatMinutes(lab.estimatedMinutes)}
            </span>
          </Badge>
        </li>
        {lab.hardware.map((value) => (
          <li key={value}>
            <Badge>{HARDWARE_LABELS[value]}</Badge>
          </li>
        ))}
      </ul>
    </article>
  );
}
