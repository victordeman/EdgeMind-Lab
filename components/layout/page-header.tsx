import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/layout/breadcrumbs";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  /** Trail after "Home"; the last item is the current page. */
  breadcrumbs?: Crumb[];
};

/** Breadcrumbs, the page H1 and an optional lead paragraph. */
export function PageHeader({
  title,
  description,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      {breadcrumbs ? (
        <Breadcrumbs items={[{ label: "Home", href: "/" }, ...breadcrumbs]} />
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-prose text-lg text-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}
