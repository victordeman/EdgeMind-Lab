import Link from "next/link";
import type { ReactNode } from "react";

/** A card whose title link covers the whole card. Used for hubs and focus areas. */
export function LinkCard({
  href,
  title,
  summary,
  footer,
}: {
  href: string;
  title: string;
  summary: string;
  footer?: ReactNode;
}) {
  return (
    <article className="relative flex h-full flex-col gap-3 rounded-lg border border-input bg-card p-5 text-card-foreground hover:bg-accent">
      <h3 className="text-lg font-semibold tracking-tight">
        <Link
          href={href}
          className="after:absolute after:inset-0 after:content-[''] hover:underline"
        >
          {title}
        </Link>
      </h3>
      <p className="text-muted-foreground">{summary}</p>
      {footer ? <div className="mt-auto pt-1 text-sm">{footer}</div> : null}
    </article>
  );
}

/** Responsive grid of cards; each child should be one card. */
export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 [&>li]:flex [&>li>*]:w-full">
      {children}
    </ul>
  );
}
