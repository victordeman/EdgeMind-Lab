import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/layout/section-heading";
import { getHubs } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { getSection } from "@/lib/sections";
import { site } from "@/lib/site";

const section = getSection("/about");

export const metadata = pageMetadata({ ...section, path: section.href });

export default function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        title={section.title}
        description={section.description}
        breadcrumbs={[{ label: section.title }]}
      />
      <p
        role="note"
        className="max-w-prose rounded-lg border border-input bg-muted p-4 text-sm"
      >
        <strong>Placeholder.</strong> The lab description, equipment list and
        contact details on this page have not been supplied yet. Staff will
        replace this text.
      </p>
      <section aria-labelledby="about-lab" className="flex flex-col gap-3">
        <SectionHeading id="about-lab" title="About the lab" />
        <p className="max-w-prose">
          {site.name} is the hands-on lab of {site.institution}.{" "}
          {site.description}
        </p>
      </section>
      <section
        aria-labelledby="about-equipment"
        className="flex flex-col gap-3"
      >
        <SectionHeading
          id="about-equipment"
          title="Equipment"
          description="The hardware the labs are written for. The full equipment list is still to be supplied."
        />
        <ul className="flex max-w-prose list-disc flex-col gap-1 pl-5">
          {getHubs().map((hub) => (
            <li key={hub.slug}>{hub.title}</li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="about-contact" className="flex flex-col gap-3">
        <SectionHeading id="about-contact" title="Contact" />
        <p className="max-w-prose text-muted-foreground">
          Contact details will be added here.
        </p>
      </section>
    </PageShell>
  );
}
