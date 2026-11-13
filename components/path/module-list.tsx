import { Clock } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_LABELS, STATUS_LABELS, formatMinutes } from "@/lib/labels";
import type { Lab, PathModule } from "@/lib/types";

/** The modules of a path, each with its labs in teaching order. */
export function ModuleList({
  modules,
  labs,
}: {
  modules: PathModule[];
  labs: Lab[];
}) {
  const bySlug = new Map(labs.map((lab) => [lab.slug, lab]));
  return (
    <ol className="flex list-none flex-col gap-8 p-0">
      {modules.map((module, index) => (
        <li key={module.title} className="flex flex-col gap-3">
          <div className="flex max-w-prose flex-col gap-1">
            <h3 className="text-lg font-semibold tracking-tight">
              <span className="sr-only">Module {index + 1}: </span>
              {module.title}
            </h3>
            <p className="text-muted-foreground">{module.summary}</p>
          </div>
          <ul className="flex list-none flex-col divide-y rounded-lg border border-input p-0">
            {module.labs
              .flatMap((slug) => {
                const lab = bySlug.get(slug);
                return lab ? [lab] : [];
              })
              .map((lab) => (
                <li
                  key={lab.slug}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/labs/${lab.slug}`}
                      className="font-medium text-brand underline underline-offset-4 hover:no-underline"
                    >
                      {lab.title}
                    </Link>
                    <p className="max-w-prose text-sm text-muted-foreground">
                      {lab.summary}
                    </p>
                  </div>
                  <ul className="flex list-none flex-wrap gap-2 p-0">
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
                  </ul>
                </li>
              ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
