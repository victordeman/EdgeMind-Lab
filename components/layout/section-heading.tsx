import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  description?: ReactNode;
  /** Heading level; pick the one that keeps the page outline in order. */
  as?: "h2" | "h3";
  id?: string;
  className?: string;
};

export function SectionHeading({
  title,
  description,
  as: Heading = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex max-w-prose flex-col gap-2", className)}>
      <Heading
        id={id}
        className={cn(
          "font-semibold tracking-tight text-balance",
          Heading === "h2" ? "text-2xl" : "text-lg",
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p className="text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
