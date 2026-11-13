import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import type { z } from "zod";

import {
  AI_PAGES,
  HARDWARE,
  REQUIRED_LAB_SECTIONS,
  labFrontmatterSchema,
  pageFrontmatterSchema,
  pathFrontmatterSchema,
  resourcesSchema,
} from "@/lib/schemas";
import type {
  AiPage,
  AiPageSlug,
  Content,
  Hardware,
  HardwareHub,
  Lab,
  LearningPath,
  Resource,
  Topic,
} from "@/lib/types";

export type ContentIssue = {
  /** Path relative to the project root, for example `content/labs/arduino-blink.mdx`. */
  file: string;
  /** Dotted field path, for example `bom.0.quantity`, or `body` for section problems. */
  field: string;
  message: string;
};

export class ContentValidationError extends Error {
  readonly issues: ContentIssue[];

  constructor(issues: ContentIssue[]) {
    super(
      [
        `Invalid content (${issues.length} ${issues.length === 1 ? "problem" : "problems"}):`,
        ...issues.map(
          (issue) => `  ${issue.file}: ${issue.field}: ${issue.message}`,
        ),
      ].join("\n"),
    );
    this.name = "ContentValidationError";
    this.issues = issues;
  }
}

export type ContentStoreOptions = {
  /** Project root that contains `content/` and `public/`. */
  rootDir: string;
};

const AI_PAGE_TOPIC: Record<AiPageSlug, Topic> = {
  "language-models": "language-models",
  agents: "ai-agents",
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** H2 headings of an MDX body, ignoring fenced code blocks. */
export function extractH2Headings(body: string): string[] {
  const headings: string[] = [];
  let fence: string | null = null;
  for (const line of body.split(/\r?\n/)) {
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      continue;
    }
    if (fence !== null) continue;
    const headingMatch = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (headingMatch) headings.push(headingMatch[1]);
  }
  return headings;
}

function formatFieldPath(pathSegments: PropertyKey[]): string {
  return pathSegments.length > 0
    ? pathSegments.map(String).join(".")
    : "(root)";
}

export function createContentStore({ rootDir }: ContentStoreOptions) {
  const contentDir = path.join(rootDir, "content");
  const publicDir = path.join(rootDir, "public");

  function relative(file: string): string {
    return path.relative(rootDir, file).split(path.sep).join("/");
  }

  function publicFileExists(href: string): boolean {
    const target = path.join(publicDir, ...href.split("/").filter(Boolean));
    return fs.existsSync(target) && fs.statSync(target).isFile();
  }

  /** `.mdx` files in a content folder; names starting with `_` are templates and are skipped. */
  function listMdx(folder: string): string[] {
    const dir = path.join(contentDir, folder);
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((name) => name.endsWith(".mdx") && !name.startsWith("_"))
      .sort()
      .map((name) => path.join(dir, name));
  }

  function parseMdx<Schema extends z.ZodType>(
    file: string,
    schema: Schema,
    issues: ContentIssue[],
  ): (z.output<Schema> & { slug: string; body: string }) | null {
    const slug = path.basename(file, ".mdx");
    if (!SLUG_PATTERN.test(slug)) {
      issues.push({
        file: relative(file),
        field: "(file name)",
        message: "file name must be a lowercase kebab-case slug",
      });
      return null;
    }

    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(fs.readFileSync(file, "utf8"));
    } catch (error) {
      issues.push({
        file: relative(file),
        field: "(frontmatter)",
        message: `could not parse frontmatter: ${error instanceof Error ? error.message : String(error)}`,
      });
      return null;
    }

    const result = schema.safeParse(parsed.data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        issues.push({
          file: relative(file),
          field: formatFieldPath(issue.path),
          message: issue.message,
        });
      }
      return null;
    }

    return {
      ...(result.data as z.output<Schema> & object),
      slug,
      body: parsed.content.trim(),
    } as z.output<Schema> & { slug: string; body: string };
  }

  function loadResources(issues: ContentIssue[]): Resource[] {
    const file = path.join(contentDir, "resources.json");
    if (!fs.existsSync(file)) return [];

    let data: unknown;
    try {
      data = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
      issues.push({
        file: relative(file),
        field: "(root)",
        message: `could not parse JSON: ${error instanceof Error ? error.message : String(error)}`,
      });
      return [];
    }

    const result = resourcesSchema.safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        issues.push({
          file: relative(file),
          field: formatFieldPath(issue.path),
          message: issue.message,
        });
      }
      return [];
    }

    result.data.forEach((resource, index) => {
      if (resource.href.startsWith("/") && !publicFileExists(resource.href)) {
        issues.push({
          file: relative(file),
          field: `${index}.href`,
          message: `file not found: public${resource.href}`,
        });
      }
    });
    return result.data;
  }

  function checkLab(lab: Lab, labSlugs: Set<string>, issues: ContentIssue[]) {
    const file = `content/labs/${lab.slug}.mdx`;

    lab.prerequisites.labs.forEach((slug, index) => {
      if (slug === lab.slug) {
        issues.push({
          file,
          field: `prerequisites.labs.${index}`,
          message: "a lab cannot be its own prerequisite",
        });
      } else if (!labSlugs.has(slug)) {
        issues.push({
          file,
          field: `prerequisites.labs.${index}`,
          message: `unknown lab slug "${slug}"`,
        });
      }
    });

    lab.downloads.forEach((download, index) => {
      if (!publicFileExists(download.file)) {
        issues.push({
          file,
          field: `downloads.${index}.file`,
          message: `file not found: public${download.file}`,
        });
      }
    });

    if (lab.status === "planned") return;

    if (lab.hardware.includes("ender-3") && lab.safety.length === 0) {
      issues.push({
        file,
        field: "safety",
        message:
          "labs that use the Ender-3 V3 SE need at least one safety note",
      });
    }

    const headings = extractH2Headings(lab.body);
    let cursor = -1;
    for (const section of REQUIRED_LAB_SECTIONS) {
      const index = headings.indexOf(section);
      if (index === -1) {
        issues.push({
          file,
          field: "body",
          message: `missing required section "## ${section}"`,
        });
      } else if (index < cursor) {
        issues.push({
          file,
          field: "body",
          message: `section "## ${section}" is out of order; expected ${REQUIRED_LAB_SECTIONS.map((name) => `"${name}"`).join(", ")}`,
        });
      } else {
        cursor = index;
      }
    }
  }

  function checkPaths(
    paths: LearningPath[],
    labSlugs: Set<string>,
    issues: ContentIssue[],
  ) {
    const owner = new Map<string, string>();
    for (const learningPath of paths) {
      const file = `content/paths/${learningPath.slug}.mdx`;
      learningPath.modules.forEach((module, moduleIndex) => {
        module.labs.forEach((slug, labIndex) => {
          const field = `modules.${moduleIndex}.labs.${labIndex}`;
          if (!labSlugs.has(slug)) {
            issues.push({ file, field, message: `unknown lab slug "${slug}"` });
            return;
          }
          const existing = owner.get(slug);
          if (existing) {
            issues.push({
              file,
              field,
              message: `lab "${slug}" is already listed in ${existing}; a lab belongs to one path and one module`,
            });
            return;
          }
          owner.set(slug, file);
        });
      });
    }
  }

  function load(): Content {
    const issues: ContentIssue[] = [];

    const notNull = <T>(value: T | null): value is T => value !== null;

    const labs = listMdx("labs")
      .map((file) => parseMdx(file, labFrontmatterSchema, issues))
      .filter(notNull) satisfies Lab[];

    const paths = listMdx("paths")
      .map((file) => parseMdx(file, pathFrontmatterSchema, issues))
      .filter(notNull)
      .sort(
        (a, b) => a.order - b.order || a.slug.localeCompare(b.slug),
      ) satisfies LearningPath[];

    const loadPages = <Slug extends string>(
      folder: string,
      allowed: readonly Slug[],
    ) => {
      const pages = listMdx(folder).flatMap((file) => {
        const slug = path.basename(file, ".mdx");
        if (!(allowed as readonly string[]).includes(slug)) {
          issues.push({
            file: relative(file),
            field: "(file name)",
            message: `unexpected page; allowed: ${allowed.join(", ")}`,
          });
          return [];
        }
        const page = parseMdx(file, pageFrontmatterSchema, issues);
        return page ? [{ ...page, slug: slug as Slug }] : [];
      });
      for (const slug of allowed) {
        const file = path.join(contentDir, folder, `${slug}.mdx`);
        if (!fs.existsSync(file)) {
          issues.push({
            file: relative(file),
            field: "(file)",
            message: "required page is missing",
          });
        }
      }
      return pages.sort(
        (a, b) => allowed.indexOf(a.slug) - allowed.indexOf(b.slug),
      );
    };

    const hubs: HardwareHub[] = loadPages("hardware", HARDWARE);
    const aiPages: AiPage[] = loadPages("ai", AI_PAGES);
    const resources = loadResources(issues);

    const labSlugs = new Set(
      listMdx("labs").map((file) => path.basename(file, ".mdx")),
    );
    for (const lab of labs) checkLab(lab, labSlugs, issues);
    checkPaths(paths, labSlugs, issues);

    if (issues.length > 0) throw new ContentValidationError(issues);
    return { labs, paths, hubs, aiPages, resources };
  }

  let cached: Content | null = null;
  function content(): Content {
    // Re-read on every call in development so edits show without a restart.
    if (process.env.NODE_ENV !== "production") return load();
    return (cached ??= load());
  }

  function getLabs(): Lab[] {
    return content().labs;
  }

  function getLab(slug: string): Lab | undefined {
    return getLabs().find((lab) => lab.slug === slug);
  }

  function getPaths(): LearningPath[] {
    return content().paths;
  }

  function getPath(slug: string): LearningPath | undefined {
    return getPaths().find((learningPath) => learningPath.slug === slug);
  }

  function getHubs(): HardwareHub[] {
    return content().hubs;
  }

  function getHub(slug: string): HardwareHub | undefined {
    return getHubs().find((hub) => hub.slug === slug);
  }

  function getAiPages(): AiPage[] {
    return content().aiPages;
  }

  function getAiPage(slug: string): AiPage | undefined {
    return getAiPages().find((page) => page.slug === slug);
  }

  function getResources(): Resource[] {
    return content().resources;
  }

  function getLabsByHardware(hardware: Hardware): Lab[] {
    return getLabs().filter((lab) => lab.hardware.includes(hardware));
  }

  function getLabsByTopic(topic: Topic): Lab[] {
    return getLabs().filter((lab) => lab.topics.includes(topic));
  }

  function getLabsForAiPage(slug: AiPageSlug): Lab[] {
    return getLabsByTopic(AI_PAGE_TOPIC[slug]);
  }

  /** Labs of a path in module order, including planned ones. */
  function getPathLabs(learningPath: LearningPath): Lab[] {
    const bySlug = new Map(getLabs().map((lab) => [lab.slug, lab]));
    return learningPath.modules.flatMap((module) =>
      module.labs.flatMap((slug) => bySlug.get(slug) ?? []),
    );
  }

  function getPathForLab(slug: string): LearningPath | undefined {
    return getPaths().find((learningPath) =>
      learningPath.modules.some((module) => module.labs.includes(slug)),
    );
  }

  /** Neighbours within the lab's path. Planned labs are skipped and have no neighbours. */
  function getNextPrevLab(slug: string): { previous?: Lab; next?: Lab } {
    const learningPath = getPathForLab(slug);
    if (!learningPath) return {};
    const available = getPathLabs(learningPath).filter(
      (lab) => lab.status !== "planned",
    );
    const index = available.findIndex((lab) => lab.slug === slug);
    if (index === -1) return {};
    return { previous: available[index - 1], next: available[index + 1] };
  }

  /** Total estimated minutes of a path's labs that can be done today (planned labs excluded). */
  function getPathMinutes(slug: string): number {
    const learningPath = getPath(slug);
    if (!learningPath) return 0;
    return getPathLabs(learningPath)
      .filter((lab) => lab.status !== "planned")
      .reduce((total, lab) => total + lab.estimatedMinutes, 0);
  }

  return {
    load,
    getLabs,
    getLab,
    getPaths,
    getPath,
    getHubs,
    getHub,
    getAiPages,
    getAiPage,
    getResources,
    getLabsByHardware,
    getLabsByTopic,
    getLabsForAiPage,
    getPathLabs,
    getPathForLab,
    getNextPrevLab,
    getPathMinutes,
  };
}

export type ContentStore = ReturnType<typeof createContentStore>;

const store = createContentStore({ rootDir: process.cwd() });

export const {
  getLabs,
  getLab,
  getPaths,
  getPath,
  getHubs,
  getHub,
  getAiPages,
  getAiPage,
  getResources,
  getLabsByHardware,
  getLabsByTopic,
  getLabsForAiPage,
  getPathLabs,
  getPathForLab,
  getNextPrevLab,
  getPathMinutes,
} = store;
