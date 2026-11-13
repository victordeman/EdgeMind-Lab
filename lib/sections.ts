import { site } from "@/lib/site";

export type Section = {
  href: string;
  /** Page H1 and metadata title. */
  title: string;
  description: string;
};

/** Title and description of each top-level section page. */
export const SECTIONS = [
  {
    href: "/paths",
    title: "Learning paths",
    description:
      "Ordered sequences of labs that build one skill at a time, from a first circuit to AI agents on hardware.",
  },
  {
    href: "/labs",
    title: "Labs",
    description:
      "Hands-on exercises for Arduino, Raspberry Pi and Linux, language models, AI agents and 3D printing.",
  },
  {
    href: "/hardware",
    title: "Hardware",
    description:
      "The boards, operating system and 3D printer used in the labs, with the labs that use each one.",
  },
  {
    href: "/ai",
    title: "AI",
    description:
      "Language models that run on lab hardware, and agents that use them to call tools.",
  },
  {
    href: "/resources",
    title: "Resources",
    description:
      "Code, wiring diagrams, 3D models, parts lists and reference links from the labs.",
  },
  {
    href: "/about",
    title: "About",
    description: `About ${site.name} at ${site.institution}.`,
  },
] as const satisfies Section[];

type SectionHref = (typeof SECTIONS)[number]["href"];

export function getSection(href: SectionHref): Section {
  const section = SECTIONS.find((candidate) => candidate.href === href);
  if (!section) throw new Error(`Unknown section: ${href}`);
  return section;
}
