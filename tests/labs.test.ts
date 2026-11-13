import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import * as content from "@/lib/content";
import {
  ContentValidationError,
  createContentStore,
  extractCodeFileRefs,
  type ContentIssue,
} from "@/lib/content";
import { highlightCode, languageForFile } from "@/lib/highlight";
import {
  DIFFICULTY_LABELS,
  HARDWARE_LABELS,
  TOPIC_LABELS,
  formatBytes,
  formatDate,
  formatMinutes,
} from "@/lib/labels";
import { DIFFICULTIES, HARDWARE, TOPICS } from "@/lib/schemas";

describe("reference labs", () => {
  const REFERENCE_LABS = ["arduino-blink", "rpi-gpio-python"];

  it("are written and carry the draft status", () => {
    for (const slug of REFERENCE_LABS) {
      expect(content.getLab(slug)?.status, slug).toBe("draft");
    }
  });

  it("have a downloadable code file for every CodeFile in the body", () => {
    for (const slug of REFERENCE_LABS) {
      const lab = content.getLab(slug)!;
      const downloads = lab.downloads.map((item) => item.file);
      const refs = extractCodeFileRefs(lab.body);
      expect(refs.length, slug).toBeGreaterThan(0);
      for (const ref of refs) {
        expect(downloads, `${slug} ${ref}`).toContain(ref);
        expect(content.readPublicTextFile(ref), ref).toBeTruthy();
      }
    }
  });

  it("have at least three troubleshooting entries and an official reference", () => {
    for (const slug of REFERENCE_LABS) {
      const lab = content.getLab(slug)!;
      expect(
        lab.body.match(/<Issue\b/g)?.length ?? 0,
        slug,
      ).toBeGreaterThanOrEqual(3);
      expect(lab.references.length, slug).toBeGreaterThan(0);
    }
  });

  it("never paste a lab program into the body outside CodeFile", () => {
    const arduino = content.getLab("arduino-blink")!;
    expect(arduino.body).not.toContain("void setup() {");
    const pi = content.getLab("rpi-gpio-python")!;
    expect(pi.body).not.toContain("from gpiozero import");
  });
});

describe("related and neighbouring labs", () => {
  it("relates written labs that share hardware or topics, without the lab itself", () => {
    const related = content
      .getRelatedLabs("arduino-blink", 3)
      .map((lab) => lab.slug);
    expect(related).not.toContain("arduino-blink");
    expect(related.length).toBeLessThanOrEqual(3);
    for (const slug of related) {
      expect(content.getLab(slug)?.status).not.toBe("planned");
    }
    expect(related).toContain("rpi-gpio-python");
  });

  it("returns nothing for an unknown lab", () => {
    expect(content.getRelatedLabs("nope")).toEqual([]);
  });

  it("gives planned labs no previous or next lab", () => {
    expect(content.getNextPrevLab("arduino-sensor-basics")).toEqual({});
  });

  it("links the written labs of a path to each other", () => {
    const { next } = content.getNextPrevLab("arduino-blink");
    expect(next?.status).not.toBe("planned");
  });
});

describe("labels and formatting", () => {
  it("labels every hardware, topic and difficulty value", () => {
    for (const value of HARDWARE) expect(HARDWARE_LABELS[value]).toBeTruthy();
    for (const value of TOPICS) expect(TOPIC_LABELS[value]).toBeTruthy();
    for (const value of DIFFICULTIES)
      expect(DIFFICULTY_LABELS[value]).toBeTruthy();
  });

  it("formats minutes, bytes and dates", () => {
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(90)).toBe("1 h 30 min");
    expect(formatBytes(12)).toBe("12 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
    expect(formatDate("2026-11-13")).toBe("13 November 2026");
  });
});

describe("code highlighting", () => {
  it("picks a language from the file extension and falls back to plain text", () => {
    expect(languageForFile("blink.ino")).toBe("cpp");
    expect(languageForFile("led_button.py")).toBe("python");
    expect(languageForFile("setup.sh")).toBe("bash");
    expect(languageForFile("config.json")).toBe("json");
    expect(languageForFile("part.gcode")).toBe("text");
    expect(languageForFile("README")).toBe("text");
  });

  it("writes both themes as CSS variables", async () => {
    const html = await highlightCode("int x = 1;", "cpp");
    expect(html).toContain("--shiki-light");
    expect(html).toContain("--shiki-dark");
    expect(html).toContain("int");
  });
});

/* -------------------------------------------------------------------------- */
/* Validation of lab bodies (fixture project)                                 */
/* -------------------------------------------------------------------------- */

const tempDirs: string[] = [];
afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

const SECTIONS =
  "\n\n## Expected outcome\n\nIt works.\n\n## Troubleshooting\n\nTry again.";

function labFile(body: string): string {
  const frontmatter = {
    title: "Fixture lab",
    summary: "A lab used only by the test suite.",
    hardware: ["arduino"],
    topics: ["electronics"],
    difficulty: "beginner",
    estimatedMinutes: 30,
    objectives: ["Prove the checks work."],
    bom: [],
    references: [{ label: "Docs", url: "https://example.com/" }],
    status: "draft",
    updated: "2026-01-01",
  };
  return `---\n${JSON.stringify(frontmatter)}\n---\n\n${body}\n`;
}

function issuesFor(
  body: string,
  extra: Record<string, string> = {},
): ContentIssue[] {
  const page = `---\n${JSON.stringify({
    title: "Page",
    summary: "A page.",
    references: [{ label: "Docs", url: "https://example.com/" }],
  })}\n---\n\nOverview.\n`;
  const pathFile = `---\n${JSON.stringify({
    title: "Path",
    summary: "A path.",
    difficulty: "beginner",
    order: 1,
    outcomes: ["One."],
    modules: [{ title: "M", summary: "S", labs: ["lab-x"] }],
  })}\n---\n\nPath.\n`;
  const files: Record<string, string> = {
    ...Object.fromEntries(
      HARDWARE.map((slug) => [`content/hardware/${slug}.mdx`, page]),
    ),
    "content/ai/language-models.mdx": page,
    "content/ai/agents.mdx": page,
    "content/paths/p.mdx": pathFile,
    "content/labs/lab-x.mdx": labFile(body),
    ...extra,
  };
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "edgemind-lab-"));
  tempDirs.push(rootDir);
  for (const [name, text] of Object.entries(files)) {
    const file = path.join(rootDir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  }
  try {
    createContentStore({ rootDir }).load();
  } catch (error) {
    if (error instanceof ContentValidationError) return error.issues;
    throw error;
  }
  return [];
}

describe("lab body checks", () => {
  const STEPS =
    '## Steps\n\n<Steps>\n<Step title="One">\n\nDo it.\n\n</Step>\n</Steps>';

  it("accepts a well-formed body", () => {
    expect(issuesFor(STEPS + SECTIONS)).toEqual([]);
  });

  it("rejects an H1 in the body", () => {
    const issues = issuesFor("# Title\n\n" + STEPS + SECTIONS);
    expect(issues).toEqual([
      expect.objectContaining({
        file: "content/labs/lab-x.mdx",
        field: "body",
        message: expect.stringContaining("H1"),
      }),
    ]);
  });

  it("ignores a # comment inside a code fence", () => {
    const body = STEPS + "\n\n```bash\n# a comment\n```" + SECTIONS;
    expect(issuesFor(body)).toEqual([]);
  });

  it("rejects a second <Steps> block", () => {
    const issues = issuesFor(STEPS + "\n\n" + STEPS + SECTIONS);
    expect(issues.map((issue) => issue.message)).toEqual([
      expect.stringContaining("only one <Steps>"),
    ]);
  });

  it("rejects a CodeFile that does not exist", () => {
    const body =
      STEPS + '\n\n<CodeFile file="/code/lab-x/missing.py" />' + SECTIONS;
    expect(issuesFor(body)).toEqual([
      expect.objectContaining({
        field: "body.CodeFile.0",
        message: "file not found: public/code/lab-x/missing.py",
      }),
    ]);
  });

  it("rejects a CodeFile outside public/code", () => {
    const body = STEPS + '\n\n<CodeFile file="/stl/part.stl" />' + SECTIONS;
    expect(issuesFor(body)[0]).toMatchObject({
      field: "body.CodeFile.0",
      message: expect.stringContaining("public/code/"),
    });
  });

  it("accepts a CodeFile that exists", () => {
    const body = STEPS + '\n\n<CodeFile file="/code/lab-x/ok.py" />' + SECTIONS;
    expect(
      issuesFor(body, { "public/code/lab-x/ok.py": "print('hi')\n" }),
    ).toEqual([]);
  });
});
