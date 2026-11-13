import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** A small label for a tag, level or state. Text carries the meaning; colour only decorates. */
export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
}
