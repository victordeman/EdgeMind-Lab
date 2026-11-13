import Link from "next/link";

import { Container } from "@/components/layout/container";
import { getAiPages, getHubs } from "@/lib/content";
import { site } from "@/lib/site";

type FooterLink = { label: string; href: string };

function FooterSection({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  const id = `footer-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <nav aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-sm font-semibold">
        {title}
      </h2>
      <ul className="flex flex-col gap-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            {link.href.startsWith("/") ? (
              <Link href={link.href} className={linkClassName}>
                {link.label}
              </Link>
            ) : (
              <a href={link.href} className={linkClassName}>
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

const linkClassName =
  "text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

export function Footer() {
  const sections = [
    { title: "Sections", links: [...site.nav] },
    {
      title: "Hardware",
      links: getHubs().map((hub) => ({
        label: hub.title,
        href: `/hardware/${hub.slug}`,
      })),
    },
    {
      title: "AI",
      links: getAiPages().map((page) => ({
        label: page.title,
        href: `/ai/${page.slug}`,
      })),
    },
    {
      title: "Project",
      links: [{ label: "Source repository", href: site.repository }],
    },
  ];

  return (
    <footer className="mt-auto border-t bg-muted">
      <Container className="flex flex-col gap-10 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
            <p className="text-lg font-semibold tracking-tight">{site.name}</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {site.institution}
            </p>
          </div>
          {sections.map((section) => (
            <FooterSection key={section.title} {...section} />
          ))}
        </div>
        <p className="border-t pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {site.institution}
        </p>
      </Container>
    </footer>
  );
}
