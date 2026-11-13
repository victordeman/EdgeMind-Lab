import { Clock } from "lucide-react";
import Link from "next/link";

import { PathProgress } from "@/components/path/path-progress";
import { Badge } from "@/components/ui/badge";
import type { PathStats } from "@/lib/derive";
import { DIFFICULTY_LABELS, formatMinutes } from "@/lib/labels";
import type { LearningPath } from "@/lib/types";

/** One learning path in a listing. The title link covers the whole card. */
export function PathCard({
  path,
  stats,
}: {
  path: Pick<LearningPath, "slug" | "title" | "summary" | "difficulty">;
  stats: PathStats;
}) {
  return (
    <article className="relative flex h-full flex-col gap-3 rounded-lg border border-input bg-card p-5 text-card-foreground hover:bg-accent">
      <h3 className="text-lg font-semibold tracking-tight">
        <Link
          href={`/paths/${path.slug}`}
          className="after:absolute after:inset-0 after:content-[''] hover:underline"
        >
          {path.title}
        </Link>
      </h3>
      <p className="text-muted-foreground">{path.summary}</p>
      <ul className="mt-auto flex flex-wrap gap-2 pt-1">
        <li>
          <Badge>{DIFFICULTY_LABELS[path.difficulty]}</Badge>
        </li>
        <li>
          <Badge>
            {stats.available} of {stats.total}{" "}
            {stats.total === 1 ? "lab" : "labs"} available
          </Badge>
        </li>
        {stats.minutes > 0 ? (
          <li>
            <Badge>
              <Clock aria-hidden className="size-3" />
              <span>
                <span className="sr-only">Total time: </span>
                {formatMinutes(stats.minutes)}
              </span>
            </Badge>
          </li>
        ) : null}
      </ul>
      <PathProgress total={stats.available} />
    </article>
  );
}
