import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import * as content from "@/lib/content";
import {
  ContentValidationError,
  createContentStore,
  extractH2Headings,
  type ContentIssue,
} from "@/lib/content";
import { AI_PAGES, HARDWARE, TOPICS } from "@/lib/schemas";

const STARTER_LABS = [
  "arduino-blink",
  "arduino-sensor-basics",
  "rpi-linux-first-boot",
  "rpi-gpio-python",
  "rpi-local-llm-ollama",
  "rpi-first-agent",
  "ender3-calibration",
  "ender3-first-robot-part",
];

const PATHS_IN_ORDER = [
  "arduino-fundamentals",
  "raspberry-pi-linux",
  "local-language-models",
  "ai-agents",
  "ender-3-robotics-printing",
];

describe("repository content", () => {
  it("validates every content file", () => {
    expect(() =>
      createContentStore({ rootDir: process.cwd() }).load(),
    ).not.toThrow();
  });

  it("contains the eight starter labs", () => {
    const slugs = content.getLabs().map((lab) => lab.slug);
    expect(slugs).toEqual(expect.arrayContaining(STARTER_LABS));
    expect(content.getLab("arduino-blink")?.title).toBe(
      "Blink an LED with Arduino",
    );
    expect(content.getLab("does-not-exist")).toBeUndefined();
  });

  it("contains the five paths in their display order", () => {
    expect(content.getPaths().map((item) => item.slug)).toEqual(PATHS_IN_ORDER);
    expect(content.getPath("ai-agents")?.title).toBe("AI Agents");
    expect(content.getPath("does-not-exist")).toBeUndefined();
  });

  it("places every lab in exactly one path", () => {
    for (const lab of content.getLabs()) {
      expect(content.getPathForLab(lab.slug), lab.slug).toBeDefined();
    }
    expect(content.getPathForLab("arduino-blink")?.slug).toBe(
      "arduino-fundamentals",
    );
  });

  it("lists at least one planned lab in every path", () => {
    for (const learningPath of content.getPaths()) {
      const statuses = content
        .getPathLabs(learningPath)
        .map((lab) => lab.status);
      expect(statuses, learningPath.slug).toContain("planned");
    }
  });

  it("has a hub for every hardware slug and both AI pages", () => {
    expect(content.getHubs().map((hub) => hub.slug)).toEqual([...HARDWARE]);
    expect(content.getAiPages().map((page) => page.slug)).toEqual([
      ...AI_PAGES,
    ]);
    for (const slug of HARDWARE) {
      expect(content.getHub(slug)?.body.length).toBeGreaterThan(0);
    }
    for (const slug of AI_PAGES) {
      expect(content.getAiPage(slug)?.body.length).toBeGreaterThan(0);
    }
    expect(content.getHub("does-not-exist")).toBeUndefined();
    expect(content.getAiPage("does-not-exist")).toBeUndefined();
  });

  it("has labs for every hardware hub, topic and AI page", () => {
    for (const hardware of HARDWARE) {
      expect(
        content.getLabsByHardware(hardware).length,
        hardware,
      ).toBeGreaterThan(0);
    }
    for (const topic of TOPICS) {
      expect(content.getLabsByTopic(topic).length, topic).toBeGreaterThan(0);
    }
    expect(content.getLabsForAiPage("agents").map((lab) => lab.slug)).toContain(
      "rpi-first-agent",
    );
  });

  it("loads the standalone resources", () => {
    expect(content.getResources().length).toBeGreaterThan(0);
  });
});

/* -------------------------------------------------------------------------- */
/* Fixtures: a throwaway project root with content/ and public/               */
/* -------------------------------------------------------------------------- */

const BODY = [
  "## Steps",
  "",
  "1. Do the thing.",
  "",
  "## Expected outcome",
  "",
  "It works.",
  "",
  "## Troubleshooting",
  "",
  "Try again.",
].join("\n");

type Frontmatter = Record<string, unknown>;

function labFrontmatter(overrides: Frontmatter = {}): Frontmatter {
  return {
    title: "Fixture lab",
    summary: "A lab used only by the test suite.",
    hardware: ["arduino"],
    topics: ["electronics"],
    difficulty: "beginner",
    estimatedMinutes: 30,
    objectives: ["Prove the loader works."],
    prerequisites: { labs: [], knowledge: [] },
    bom: [{ item: "Arduino board", quantity: 1 }],
    safety: [],
    downloads: [],
    references: [{ label: "Arduino docs", url: "https://docs.arduino.cc/" }],
    status: "draft",
    updated: "2026-01-01",
    ...overrides,
  };
}

function pathFrontmatter(overrides: Frontmatter = {}): Frontmatter {
  return {
    title: "Fixture path",
    summary: "A path used only by the test suite.",
    difficulty: "beginner",
    order: 1,
    outcomes: ["Know that paths load."],
    modules: [
      { title: "Module one", summary: "First.", labs: ["lab-a", "lab-b"] },
      { title: "Module two", summary: "Second.", labs: ["lab-c", "lab-d"] },
    ],
    ...overrides,
  };
}

function mdx(frontmatter: Frontmatter, body = ""): string {
  // JSON is valid YAML, which keeps the fixtures free of a YAML serializer.
  return `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n\n${body}\n`;
}

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

/** Writes `files` (relative path → text) into a new temp project root. */
function project(files: Record<string, string>): string {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "edgemind-content-"));
  tempDirs.push(rootDir);
  for (const [name, text] of Object.entries(files)) {
    const file = path.join(rootDir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  }
  return rootDir;
}

function pages(): Record<string, string> {
  const page = mdx(
    {
      title: "Page",
      summary: "A page.",
      references: [{ label: "Docs", url: "https://example.com/" }],
    },
    "Overview paragraph.",
  );
  return Object.fromEntries([
    ...HARDWARE.map((slug) => [`content/hardware/${slug}.mdx`, page]),
    ...AI_PAGES.map((slug) => [`content/ai/${slug}.mdx`, page]),
  ]);
}

/** A complete, valid project: four labs (one planned) in one two-module path. */
function validFiles(): Record<string, string> {
  return {
    ...pages(),
    "content/labs/lab-a.mdx": mdx(
      labFrontmatter({
        title: "Lab A",
        estimatedMinutes: 30,
        downloads: [
          { label: "Sketch", file: "/code/lab-a/sketch.ino", kind: "code" },
        ],
      }),
      BODY,
    ),
    "content/labs/lab-b.mdx": mdx(
      labFrontmatter({
        title: "Lab B",
        estimatedMinutes: 45,
        hardware: ["raspberry-pi", "linux"],
        topics: ["linux", "ai-agents"],
        prerequisites: { labs: ["lab-a"] },
      }),
      BODY,
    ),
    "content/labs/lab-c.mdx": mdx(
      labFrontmatter({
        title: "Lab C",
        estimatedMinutes: 500,
        status: "planned",
      }),
    ),
    "content/labs/lab-d.mdx": mdx(
      labFrontmatter({
        title: "Lab D",
        estimatedMinutes: 60,
        status: "reviewed",
      }),
      BODY,
    ),
    "content/paths/fixture-path.mdx": mdx(pathFrontmatter(), "Path overview."),
    "content/resources.json": JSON.stringify([
      {
        title: "Docs",
        description: "External documentation.",
        category: "link",
        href: "https://example.com/",
      },
      {
        title: "Sketch",
        description: "The lab A sketch.",
        category: "code",
        href: "/code/lab-a/sketch.ino",
        hardware: ["arduino"],
      },
    ]),
    "public/code/lab-a/sketch.ino": "void setup() {}\nvoid loop() {}\n",
  };
}

function issuesOf(files: Record<string, string>): ContentIssue[] {
  try {
    createContentStore({ rootDir: project(files) }).load();
  } catch (error) {
    if (error instanceof ContentValidationError) return error.issues;
    throw error;
  }
  throw new Error("expected the content to be rejected");
}

describe("loaders (fixture project)", () => {
  it("loads a valid project and applies defaults", () => {
    const store = createContentStore({ rootDir: project(validFiles()) });

    expect(store.getLabs().map((lab) => lab.slug)).toEqual([
      "lab-a",
      "lab-b",
      "lab-c",
      "lab-d",
    ]);
    const labB = store.getLab("lab-b");
    expect(labB?.prerequisites).toEqual({ labs: ["lab-a"], knowledge: [] });
    expect(labB?.body.startsWith("## Steps")).toBe(true);
    expect(store.getPath("fixture-path")?.body).toBe("Path overview.");
    expect(store.getResources()).toHaveLength(2);
    expect(store.getHub("arduino")?.title).toBe("Page");
    expect(store.getAiPage("agents")?.title).toBe("Page");
  });

  it("filters labs by hardware, topic and AI page", () => {
    const store = createContentStore({ rootDir: project(validFiles()) });
    const slugs = (labs: { slug: string }[]) => labs.map((lab) => lab.slug);

    expect(slugs(store.getLabsByHardware("raspberry-pi"))).toEqual(["lab-b"]);
    expect(slugs(store.getLabsByHardware("arduino"))).toEqual([
      "lab-a",
      "lab-c",
      "lab-d",
    ]);
    expect(slugs(store.getLabsByHardware("ender-3"))).toEqual([]);
    expect(slugs(store.getLabsByTopic("linux"))).toEqual(["lab-b"]);
    expect(slugs(store.getLabsForAiPage("agents"))).toEqual(["lab-b"]);
    expect(slugs(store.getLabsForAiPage("language-models"))).toEqual([]);
  });

  it("finds the path of a lab", () => {
    const store = createContentStore({ rootDir: project(validFiles()) });
    expect(store.getPathForLab("lab-d")?.slug).toBe("fixture-path");
    expect(store.getPathForLab("nope")).toBeUndefined();
  });

  it("returns previous and next labs in path order, skipping planned labs", () => {
    const store = createContentStore({ rootDir: project(validFiles()) });
    const neighbours = (slug: string) => {
      const { previous, next } = store.getNextPrevLab(slug);
      return [previous?.slug, next?.slug];
    };

    expect(neighbours("lab-a")).toEqual([undefined, "lab-b"]);
    expect(neighbours("lab-b")).toEqual(["lab-a", "lab-d"]);
    expect(neighbours("lab-d")).toEqual(["lab-b", undefined]);
    expect(neighbours("lab-c")).toEqual([undefined, undefined]);
    expect(neighbours("nope")).toEqual([undefined, undefined]);
  });

  it("sums path minutes without planned labs", () => {
    const store = createContentStore({ rootDir: project(validFiles()) });
    expect(store.getPathMinutes("fixture-path")).toBe(30 + 45 + 60);
    expect(store.getPathMinutes("nope")).toBe(0);
  });

  it("sorts paths by order", () => {
    const files = validFiles();
    files["content/paths/another-path.mdx"] = mdx(
      pathFrontmatter({
        order: 0,
        modules: [{ title: "M", summary: "S", labs: ["lab-d"] }],
      }),
    );
    files["content/paths/fixture-path.mdx"] = mdx(
      pathFrontmatter({
        modules: [
          { title: "M", summary: "S", labs: ["lab-a", "lab-b", "lab-c"] },
        ],
      }),
    );
    const store = createContentStore({ rootDir: project(files) });
    expect(store.getPaths().map((item) => item.slug)).toEqual([
      "another-path",
      "fixture-path",
    ]);
  });

  it("skips files whose name starts with an underscore", () => {
    const files = validFiles();
    files["content/labs/_template.mdx"] = "---\ntitle: Template\n---\n";
    const store = createContentStore({ rootDir: project(files) });
    expect(store.getLab("_template")).toBeUndefined();
  });

  it("accepts an unquoted YAML date for updated", () => {
    const files = validFiles();
    files["content/labs/lab-d.mdx"] = files["content/labs/lab-d.mdx"].replace(
      '"updated": "2026-01-01"',
      '"updated": 2026-01-01',
    );
    const store = createContentStore({ rootDir: project(files) });
    expect(store.getLab("lab-d")?.updated).toBe("2026-01-01");
  });
});

describe("validation errors name the file and the field", () => {
  it("rejects a lab with a missing required field", () => {
    const files = validFiles();
    const frontmatter = labFrontmatter();
    delete frontmatter.title;
    files["content/labs/lab-a.mdx"] = mdx(frontmatter, BODY);

    expect(issuesOf(files)).toContainEqual(
      expect.objectContaining({
        file: "content/labs/lab-a.mdx",
        field: "title",
      }),
    );
  });

  it("puts the file and field in the error message", () => {
    const files = validFiles();
    const frontmatter = labFrontmatter();
    delete frontmatter.references;
    files["content/labs/lab-a.mdx"] = mdx(frontmatter, BODY);

    expect(() =>
      createContentStore({ rootDir: project(files) }).load(),
    ).toThrowError(/content\/labs\/lab-a\.mdx: references: /);
  });

  it("rejects an unknown prerequisite slug", () => {
    const files = validFiles();
    files["content/labs/lab-b.mdx"] = mdx(
      labFrontmatter({ prerequisites: { labs: ["ghost-lab"] } }),
      BODY,
    );

    expect(issuesOf(files)).toContainEqual({
      file: "content/labs/lab-b.mdx",
      field: "prerequisites.labs.0",
      message: 'unknown lab slug "ghost-lab"',
    });
  });

  it("rejects a lab that lists itself as a prerequisite", () => {
    const files = validFiles();
    files["content/labs/lab-b.mdx"] = mdx(
      labFrontmatter({ prerequisites: { labs: ["lab-b"] } }),
      BODY,
    );

    expect(issuesOf(files)).toContainEqual(
      expect.objectContaining({
        file: "content/labs/lab-b.mdx",
        field: "prerequisites.labs.0",
      }),
    );
  });

  it("rejects a download whose file is missing under public/", () => {
    const files = validFiles();
    delete files["public/code/lab-a/sketch.ino"];

    const issues = issuesOf(files);
    expect(issues).toContainEqual({
      file: "content/labs/lab-a.mdx",
      field: "downloads.0.file",
      message: "file not found: public/code/lab-a/sketch.ino",
    });
    expect(issues).toContainEqual({
      file: "content/resources.json",
      field: "1.href",
      message: "file not found: public/code/lab-a/sketch.ino",
    });
  });

  it("rejects a written lab with a missing required section", () => {
    const files = validFiles();
    files["content/labs/lab-a.mdx"] = mdx(
      labFrontmatter(),
      BODY.replace("## Expected outcome", "## Result"),
    );

    expect(issuesOf(files)).toEqual([
      {
        file: "content/labs/lab-a.mdx",
        field: "body",
        message: 'missing required section "## Expected outcome"',
      },
    ]);
  });

  it("rejects required sections that are out of order", () => {
    const files = validFiles();
    files["content/labs/lab-a.mdx"] = mdx(
      labFrontmatter(),
      "## Troubleshooting\n\nA\n\n## Steps\n\nB\n\n## Expected outcome\n\nC",
    );

    const issues = issuesOf(files);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      file: "content/labs/lab-a.mdx",
      field: "body",
    });
    expect(issues[0].message).toContain("out of order");
  });

  it("does not require a body for planned labs", () => {
    const files = validFiles();
    files["content/labs/lab-a.mdx"] = mdx(
      labFrontmatter({ status: "planned" }),
    );
    expect(() =>
      createContentStore({ rootDir: project(files) }).load(),
    ).not.toThrow();
  });

  it("rejects an unknown lab slug in a path module", () => {
    const files = validFiles();
    files["content/paths/fixture-path.mdx"] = mdx(
      pathFrontmatter({
        modules: [
          { title: "M", summary: "S", labs: ["lab-a", "lab-b", "lab-c"] },
          { title: "N", summary: "S", labs: ["lab-d", "ghost-lab"] },
        ],
      }),
    );

    expect(issuesOf(files)).toEqual([
      {
        file: "content/paths/fixture-path.mdx",
        field: "modules.1.labs.1",
        message: 'unknown lab slug "ghost-lab"',
      },
    ]);
  });

  it("rejects a lab listed in two paths", () => {
    const files = validFiles();
    files["content/paths/second-path.mdx"] = mdx(
      pathFrontmatter({
        order: 2,
        modules: [{ title: "M", summary: "S", labs: ["lab-a"] }],
      }),
    );

    expect(issuesOf(files)).toContainEqual(
      expect.objectContaining({
        file: "content/paths/second-path.mdx",
        field: "modules.0.labs.0",
      }),
    );
  });

  it("rejects wrong types, unknown enum values and unknown keys", () => {
    const files = validFiles();
    files["content/labs/lab-a.mdx"] = mdx(
      labFrontmatter({
        hardware: ["toaster"],
        estimatedMinutes: "30",
        summary: "x".repeat(161),
        bom: [{ item: "Board", quantity: 0 }],
        references: [{ label: "Docs", url: "ftp://example.com/file" }],
        updated: "13/11/2026",
        colour: "blue",
      }),
      BODY,
    );

    const fields = issuesOf(files)
      .filter((issue) => issue.file === "content/labs/lab-a.mdx")
      .map((issue) => issue.field);
    expect(fields).toEqual(
      expect.arrayContaining([
        "hardware.0",
        "estimatedMinutes",
        "summary",
        "bom.0.quantity",
        "references.0.url",
        "updated",
      ]),
    );
    expect(
      issuesOf(files).some((issue) => issue.message.includes("colour")),
    ).toBe(true);
  });

  it("requires a safety note on written Ender-3 labs", () => {
    const files = validFiles();
    files["content/labs/lab-a.mdx"] = mdx(
      labFrontmatter({ hardware: ["ender-3"], topics: ["3d-printing"] }),
      BODY,
    );

    expect(issuesOf(files)).toContainEqual(
      expect.objectContaining({
        file: "content/labs/lab-a.mdx",
        field: "safety",
      }),
    );
  });

  it("rejects a missing hub or AI page and an unexpected one", () => {
    const files = validFiles();
    delete files["content/hardware/linux.mdx"];
    delete files["content/ai/agents.mdx"];
    files["content/hardware/toaster.mdx"] =
      files["content/hardware/arduino.mdx"];

    const issues = issuesOf(files).map((issue) => issue.file);
    expect(issues).toEqual(
      expect.arrayContaining([
        "content/hardware/linux.mdx",
        "content/ai/agents.mdx",
        "content/hardware/toaster.mdx",
      ]),
    );
  });

  it("rejects an invalid path, page and resource", () => {
    const files = validFiles();
    files["content/paths/fixture-path.mdx"] = mdx(
      pathFrontmatter({ modules: [] }),
    );
    files["content/hardware/arduino.mdx"] = mdx({ title: "Arduino" });
    files["content/resources.json"] = JSON.stringify([
      { title: "Docs", description: "D", category: "video", href: "nope" },
    ]);

    expect(issuesOf(files)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: "content/paths/fixture-path.mdx",
          field: "modules",
        }),
        expect.objectContaining({
          file: "content/hardware/arduino.mdx",
          field: "summary",
        }),
        expect.objectContaining({
          file: "content/hardware/arduino.mdx",
          field: "references",
        }),
        expect.objectContaining({
          file: "content/resources.json",
          field: "0.category",
        }),
        expect.objectContaining({
          file: "content/resources.json",
          field: "0.href",
        }),
      ]),
    );
  });

  it("reports unparseable frontmatter and JSON with the file name", () => {
    const files = validFiles();
    files["content/labs/lab-a.mdx"] = "---\ntitle: [unclosed\n---\n";
    files["content/resources.json"] = "{ not json";

    const issues = issuesOf(files).map((issue) => issue.file);
    expect(issues).toEqual(
      expect.arrayContaining([
        "content/labs/lab-a.mdx",
        "content/resources.json",
      ]),
    );
  });

  it("rejects a file name that is not a kebab-case slug", () => {
    const files = validFiles();
    files["content/labs/Lab_E.mdx"] = mdx(labFrontmatter(), BODY);

    expect(issuesOf(files)).toContainEqual(
      expect.objectContaining({ file: "content/labs/Lab_E.mdx" }),
    );
  });

  it("reports every problem at once", () => {
    const files = validFiles();
    files["content/labs/lab-b.mdx"] = mdx(
      labFrontmatter({ prerequisites: { labs: ["ghost-lab"] } }),
      "No sections here.",
    );

    expect(issuesOf(files)).toHaveLength(4);
  });
});

describe("extractH2Headings", () => {
  it("returns H2 headings only and ignores fenced code", () => {
    const body = [
      "# Title",
      "## Steps",
      "### Sub step",
      "```bash",
      "## not a heading",
      "```",
      "~~~",
      "## also not a heading",
      "~~~",
      "## Expected outcome ##",
      "##NoSpace",
    ].join("\n");
    expect(extractH2Headings(body)).toEqual(["Steps", "Expected outcome"]);
  });
});
