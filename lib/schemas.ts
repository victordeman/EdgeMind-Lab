import { z } from "zod";

export const HARDWARE = [
  "arduino",
  "raspberry-pi",
  "linux",
  "ender-3",
] as const;

export const TOPICS = [
  "electronics",
  "linux",
  "language-models",
  "ai-agents",
  "3d-printing",
  "robotics",
] as const;

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

export const LAB_STATUSES = ["draft", "reviewed", "planned"] as const;

export const DOWNLOAD_KINDS = ["code", "stl", "diagram", "doc"] as const;

export const RESOURCE_CATEGORIES = [
  "code",
  "stl",
  "diagram",
  "bom",
  "link",
] as const;

export const AI_PAGES = ["language-models", "agents"] as const;

/** H2 headings every written lab body must contain, in this order. */
export const REQUIRED_LAB_SECTIONS = [
  "Steps",
  "Expected outcome",
  "Troubleshooting",
] as const;

const text = z.string().trim().min(1);
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case slug");

/** Site-absolute path to a file under `public/`, for example `/code/arduino-blink/blink.ino`. */
const publicFile = z
  .string()
  .regex(/^\/[^\s]+$/, "must be a path under public/ starting with /")
  .refine((value) => !value.split("/").includes(".."), {
    message: "must not contain .. segments",
  });

const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date (YYYY-MM-DD)"),
);

export const referenceSchema = z.strictObject({
  label: text,
  url: z.url({ protocol: /^https?$/ }),
});

export const bomItemSchema = z.strictObject({
  item: text,
  quantity: z.number().int().positive(),
  notes: text.optional(),
  optional: z.boolean().optional(),
});

export const downloadSchema = z.strictObject({
  label: text,
  file: publicFile,
  kind: z.enum(DOWNLOAD_KINDS),
});

export const labFrontmatterSchema = z.strictObject({
  title: text,
  summary: text.max(160),
  hardware: z.array(z.enum(HARDWARE)).min(1),
  topics: z.array(z.enum(TOPICS)).min(1),
  difficulty: z.enum(DIFFICULTIES),
  estimatedMinutes: z.number().int().positive(),
  objectives: z.array(text).min(1),
  prerequisites: z
    .strictObject({
      labs: z.array(slug).default([]),
      knowledge: z.array(text).default([]),
    })
    .default({ labs: [], knowledge: [] }),
  bom: z.array(bomItemSchema),
  safety: z.array(text).default([]),
  downloads: z.array(downloadSchema).default([]),
  references: z.array(referenceSchema).min(1),
  status: z.enum(LAB_STATUSES),
  updated: isoDate,
});

export const pathModuleSchema = z.strictObject({
  title: text,
  summary: text,
  labs: z.array(slug).min(1),
});

export const pathFrontmatterSchema = z.strictObject({
  title: text,
  summary: text,
  difficulty: z.enum(DIFFICULTIES),
  order: z.number().int(),
  outcomes: z.array(text).min(1),
  modules: z.array(pathModuleSchema).min(1),
});

export const pageFrontmatterSchema = z.strictObject({
  title: text,
  summary: text,
  references: z.array(referenceSchema).min(1),
});

export const resourceSchema = z.strictObject({
  title: text,
  description: text,
  category: z.enum(RESOURCE_CATEGORIES),
  href: z.union([publicFile, z.url({ protocol: /^https?$/ })]),
  hardware: z.array(z.enum(HARDWARE)).optional(),
});

export const resourcesSchema = z.array(resourceSchema);
