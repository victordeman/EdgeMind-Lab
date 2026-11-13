/**
 * Progress through a path. Progress is not stored yet, so it always starts at
 * zero; Phase 7 replaces `completed` with the student's saved progress.
 */
export function PathProgress({
  total,
  completed = 0,
}: {
  total: number;
  completed?: number;
}) {
  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">
        {completed} of {total}
      </span>{" "}
      {total === 1 ? "lab" : "labs"} completed
    </p>
  );
}
