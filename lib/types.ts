import type { z } from "zod";

import type {
  AI_PAGES,
  DIFFICULTIES,
  DOWNLOAD_KINDS,
  HARDWARE,
  LAB_STATUSES,
  RESOURCE_CATEGORIES,
  TOPICS,
  bomItemSchema,
  downloadSchema,
  labFrontmatterSchema,
  pageFrontmatterSchema,
  pathFrontmatterSchema,
  pathModuleSchema,
  referenceSchema,
  resourceSchema,
} from "@/lib/schemas";

export type Hardware = (typeof HARDWARE)[number];
export type Topic = (typeof TOPICS)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type LabStatus = (typeof LAB_STATUSES)[number];
export type DownloadKind = (typeof DOWNLOAD_KINDS)[number];
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];
export type AiPageSlug = (typeof AI_PAGES)[number];

export type Reference = z.infer<typeof referenceSchema>;
export type BomItem = z.infer<typeof bomItemSchema>;
export type Download = z.infer<typeof downloadSchema>;
export type PathModule = z.infer<typeof pathModuleSchema>;
export type Resource = z.infer<typeof resourceSchema>;

type WithBody<T> = T & {
  slug: string;
  /** MDX source without the frontmatter block. */
  body: string;
};

export type Lab = WithBody<z.infer<typeof labFrontmatterSchema>>;
export type LearningPath = WithBody<z.infer<typeof pathFrontmatterSchema>>;
export type HardwareHub = WithBody<z.infer<typeof pageFrontmatterSchema>> & {
  slug: Hardware;
};
export type AiPage = WithBody<z.infer<typeof pageFrontmatterSchema>> & {
  slug: AiPageSlug;
};

export type Content = {
  labs: Lab[];
  paths: LearningPath[];
  hubs: HardwareHub[];
  aiPages: AiPage[];
  resources: Resource[];
};
