import { Clock } from "lucide-react";

import { StatusNotice } from "@/components/lab/status-notice";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  DIFFICULTY_LABELS,
  HARDWARE_LABELS,
  TOPIC_LABELS,
  formatDate,
  formatMinutes,
} from "@/lib/labels";
import { getSection } from "@/lib/sections";
import type { Lab } from "@/lib/types";

const section = getSection("/labs");

/** Title, key facts, status notice and last-updated date of a lab. */
export function LabHeader({ lab }: { lab: Lab }) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={lab.title}
        description={lab.summary}
        breadcrumbs={[
          { label: section.title, href: section.href },
          { label: lab.title },
        ]}
      />
      <ul aria-label="Lab details" className="flex flex-wrap gap-2">
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
        {lab.topics.map((value) => (
          <li key={value}>
            <Badge>{TOPIC_LABELS[value]}</Badge>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        Last updated{" "}
        <time dateTime={lab.updated}>{formatDate(lab.updated)}</time>
      </p>
      <StatusNotice status={lab.status} />
    </div>
  );
}
