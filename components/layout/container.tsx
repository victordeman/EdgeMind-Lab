import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Centres content in the page column and applies the page gutters. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}
