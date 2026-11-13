import GithubSlugger from "github-slugger";

import { proseLines } from "@/lib/mdx-text";
import type { Lab } from "@/lib/types";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

/** Plain text of a Markdown heading, close to what `rehype-slug` sees. */
function plainText(markdown: string): string {
  return markdown
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_~]/g, "")
    .trim();
}

/** Id of the nth `<Step>` in a lab body. `Steps` gives each `Step` the same id. */
export function stepId(index: number): string {
  return `step-${index}`;
}

/**
 * H2 and H3 headings and `<Step title="…">` entries of an MDX body, in order.
 * Heading ids match `rehype-slug` because both use github-slugger.
 */
export function extractToc(body: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let steps = 0;
  for (const line of proseLines(body)) {
    const heading = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      const text = plainText(heading[2]);
      items.push({
        id: slugger.slug(text),
        text,
        level: heading[1].length === 2 ? 2 : 3,
      });
      continue;
    }
    const step = /<Step\b[^>]*\btitle="([^"]*)"/.exec(line);
    if (step) {
      steps += 1;
      items.push({ id: stepId(steps), text: step[1], level: 3 });
    }
  }
  return items;
}

/** Ids of the sections the lab page renders around the MDX body. */
export const LAB_SECTION_IDS = {
  overview: "lab-overview",
  bom: "lab-bom",
  safety: "lab-safety",
  downloads: "lab-downloads",
  references: "lab-references",
  next: "lab-next",
} as const;

/** Full table of contents of a written lab page: page sections plus body headings. */
export function buildLabToc(lab: Lab): TocItem[] {
  const before: TocItem[] = [
    {
      id: LAB_SECTION_IDS.overview,
      text: "Objectives and prerequisites",
      level: 2,
    },
    { id: LAB_SECTION_IDS.bom, text: "Bill of materials", level: 2 },
  ];
  if (lab.safety.length > 0) {
    before.push({ id: LAB_SECTION_IDS.safety, text: "Safety", level: 2 });
  }
  const after: TocItem[] = [];
  if (lab.downloads.length > 0) {
    after.push({ id: LAB_SECTION_IDS.downloads, text: "Downloads", level: 2 });
  }
  after.push(
    { id: LAB_SECTION_IDS.references, text: "References", level: 2 },
    { id: LAB_SECTION_IDS.next, text: "Next steps", level: 2 },
  );
  return [...before, ...extractToc(lab.body), ...after];
}
