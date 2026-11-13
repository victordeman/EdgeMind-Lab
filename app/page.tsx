import Link from "next/link";

import { LabLinkList } from "@/components/layout/lab-link-list";
import { CardGrid, LinkCard } from "@/components/layout/link-card";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/layout/section-heading";
import { PathCard } from "@/components/path/path-card";
import { buttonVariants } from "@/components/ui/button";
import {
  getAiPages,
  getHubs,
  getLabs,
  getPathLabs,
  getPaths,
} from "@/lib/content";
import { focusAreas, pathStats, recentLabs } from "@/lib/derive";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <PageShell>
      <header className="flex flex-col gap-4">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {site.institution}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {site.name}
        </h1>
        <p className="max-w-prose text-lg text-muted-foreground">
          {site.description}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/paths" className={cn(buttonVariants({ size: "lg" }))}>
            Browse learning paths
          </Link>
          <Link
            href="/labs"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            All labs
          </Link>
        </div>
      </header>

      <section aria-labelledby="home-paths" className="flex flex-col gap-4">
        <SectionHeading id="home-paths" title="Learning paths" />
        <CardGrid>
          {getPaths().map((path) => (
            <li key={path.slug}>
              <PathCard path={path} stats={pathStats(getPathLabs(path))} />
            </li>
          ))}
        </CardGrid>
      </section>

      <section aria-labelledby="home-start" className="flex flex-col gap-4">
        <SectionHeading
          id="home-start"
          title="Quick start"
          description="Pick the area you want to work in."
        />
        <CardGrid>
          {focusAreas(getHubs(), getAiPages()).map((area) => (
            <li key={area.href}>
              <LinkCard {...area} />
            </li>
          ))}
        </CardGrid>
      </section>

      <section aria-labelledby="home-recent" className="flex flex-col gap-4">
        <SectionHeading id="home-recent" title="Recently updated labs" />
        <LabLinkList labs={recentLabs(getLabs(), 3)} />
      </section>
    </PageShell>
  );
}
