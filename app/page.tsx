import { PageLinkList } from "@/components/layout/page-link-list";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/layout/section-heading";
import { SECTIONS } from "@/lib/sections";
import { site } from "@/lib/site";

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
      </header>
      <section aria-labelledby="sections" className="flex flex-col gap-4">
        <SectionHeading id="sections" title="Sections" />
        <PageLinkList
          items={SECTIONS.map(({ href, title, description }) => ({
            href,
            title,
            summary: description,
          }))}
        />
      </section>
    </PageShell>
  );
}
