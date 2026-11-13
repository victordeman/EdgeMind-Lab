import { Info, TriangleAlert } from "lucide-react";

import type { LabStatus } from "@/lib/types";

/** Says how far a lab can be trusted. Reviewed labs show nothing. */
export function StatusNotice({ status }: { status: LabStatus }) {
  if (status === "reviewed") return null;

  const draft = status === "draft";
  const Icon = draft ? TriangleAlert : Info;

  return (
    <div
      role="note"
      className="flex max-w-prose gap-3 rounded-lg border border-border bg-muted p-4"
    >
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
      <p className="text-sm">
        {draft ? (
          <>
            <strong>Not yet bench-verified.</strong> This lab is a draft. Lab
            staff have not built it on real hardware, so check every wiring
            detail and value against the references below before you apply
            power.
          </>
        ) : (
          <>
            <strong>Coming soon.</strong> This lab is planned. Its steps have
            not been written yet.
          </>
        )}
      </p>
    </div>
  );
}
