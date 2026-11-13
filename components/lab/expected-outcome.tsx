import type { ReactNode } from "react";

/** What a student should see when the lab has worked. Use under `## Expected outcome`. */
export function ExpectedOutcome({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-l-4 border-input border-l-brand bg-muted p-5">
      {children}
    </div>
  );
}
