import type {
  AiPage,
  Hardware,
  HardwareHub,
  Lab,
  LearningPath,
  Resource,
  ResourceCategory,
} from "@/lib/types";

/**
 * Pure helpers that compute listings from lab, path and resource data. Pages
 * call these with the loaders' output, so no page keeps a hand-written list.
 */

export type PathStats = {
  /** Every lab in the path, planned ones included. */
  total: number;
  /** Labs that can be done today (not planned). */
  available: number;
  /** Sum of `estimatedMinutes` of the available labs. */
  minutes: number;
};

/** Counts and total time for a path. `labs` is the path's labs in order. */
export function pathStats(labs: Lab[]): PathStats {
  const available = labs.filter((lab) => lab.status !== "planned");
  return {
    total: labs.length,
    available: available.length,
    minutes: available.reduce((sum, lab) => sum + lab.estimatedMinutes, 0),
  };
}

/** First lab of a path that is not planned, or `undefined`. */
export function firstAvailableLab(labs: Lab[]): Lab | undefined {
  return labs.find((lab) => lab.status !== "planned");
}

/** Paths that contain at least one lab for the hardware, in path order. */
export function pathsForHardware(
  paths: LearningPath[],
  labs: Lab[],
  hardware: Hardware,
): LearningPath[] {
  const slugs = new Set(
    labs
      .filter((lab) => lab.hardware.includes(hardware))
      .map((lab) => lab.slug),
  );
  return paths.filter((learningPath) =>
    learningPath.modules.some((module) =>
      module.labs.some((slug) => slugs.has(slug)),
    ),
  );
}

/** Paths that contain at least one lab with the topic, in path order. */
export function pathsForTopic(
  paths: LearningPath[],
  labs: Lab[],
  topic: Lab["topics"][number],
): LearningPath[] {
  const slugs = new Set(
    labs.filter((lab) => lab.topics.includes(topic)).map((lab) => lab.slug),
  );
  return paths.filter((learningPath) =>
    learningPath.modules.some((module) =>
      module.labs.some((slug) => slugs.has(slug)),
    ),
  );
}

/** The most recently updated labs that are not planned, newest first. */
export function recentLabs(labs: Lab[], count: number): Lab[] {
  return labs
    .filter((lab) => lab.status !== "planned")
    .sort(
      (a, b) =>
        b.updated.localeCompare(a.updated) || a.slug.localeCompare(b.slug),
    )
    .slice(0, count);
}

export type ResourceEntry = {
  title: string;
  description: string;
  category: ResourceCategory;
  href: string;
  hardware: Hardware[];
  /** The lab the entry belongs to, when it has one. */
  lab?: { slug: string; title: string };
};

const DOWNLOAD_CATEGORY = {
  code: "code",
  stl: "stl",
  diagram: "diagram",
  doc: "bom",
} as const satisfies Record<Lab["downloads"][number]["kind"], ResourceCategory>;

/**
 * Standalone resources plus every lab download and lab reference link, as one
 * list. Planned labs are left out because their downloads do not exist yet.
 */
export function collectResources(
  labs: Lab[],
  resources: Resource[],
): ResourceEntry[] {
  const standalone: ResourceEntry[] = resources.map((resource) => ({
    title: resource.title,
    description: resource.description,
    category: resource.category,
    href: resource.href,
    hardware: resource.hardware ?? [],
  }));

  const fromLabs: ResourceEntry[] = labs
    .filter((lab) => lab.status !== "planned")
    .flatMap((lab) => [
      ...lab.downloads.map((download) => ({
        title: download.label,
        description: `Download from the lab "${lab.title}".`,
        category: DOWNLOAD_CATEGORY[download.kind],
        href: download.file,
        hardware: lab.hardware,
        lab: { slug: lab.slug, title: lab.title },
      })),
      // The parts list is part of the lab page, so the entry links to it.
      ...(lab.bom.length > 0
        ? [
            {
              title: `Parts list: ${lab.title}`,
              description: `${lab.bom.length} ${lab.bom.length === 1 ? "item" : "items"} needed for the lab.`,
              category: "bom" as const,
              href: `/labs/${lab.slug}#lab-bom`,
              hardware: lab.hardware,
              lab: { slug: lab.slug, title: lab.title },
            },
          ]
        : []),
    ]);

  return [...standalone, ...fromLabs];
}

/** Entries that match any selected hardware; all entries when none is selected. */
export function filterResources(
  entries: ResourceEntry[],
  hardware: Hardware[],
): ResourceEntry[] {
  if (hardware.length === 0) return entries;
  return entries.filter((entry) =>
    entry.hardware.some((value) => hardware.includes(value)),
  );
}

/** Resources for a hardware hub or AI page, by hardware. */
export function resourcesForHardware(
  entries: ResourceEntry[],
  hardware: Hardware,
): ResourceEntry[] {
  return entries.filter((entry) => entry.hardware.includes(hardware));
}

export type FocusArea = { title: string; href: string; summary: string };

/**
 * The five focus areas, in the order the lab is described: Arduino,
 * Raspberry Pi + Linux, language models, AI agents and the Ender-3 V3 SE.
 * Titles and summaries come from the hub and AI pages.
 */
export function focusAreas(
  hubs: HardwareHub[],
  aiPages: AiPage[],
): FocusArea[] {
  const hub = (slug: Hardware, title?: string): FocusArea[] => {
    const found = hubs.find((item) => item.slug === slug);
    return found
      ? [
          {
            title: title ?? found.title,
            href: `/hardware/${slug}`,
            summary: found.summary,
          },
        ]
      : [];
  };
  const ai = (slug: AiPage["slug"]): FocusArea[] => {
    const found = aiPages.find((item) => item.slug === slug);
    return found
      ? [{ title: found.title, href: `/ai/${slug}`, summary: found.summary }]
      : [];
  };
  return [
    ...hub("arduino"),
    ...hub("raspberry-pi", "Raspberry Pi + Linux"),
    ...ai("language-models"),
    ...ai("agents"),
    ...hub("ender-3"),
  ];
}
