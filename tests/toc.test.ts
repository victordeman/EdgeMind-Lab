import { describe, expect, it } from "vitest";

import { getLab } from "@/lib/content";
import { buildLabToc, extractToc, LAB_SECTION_IDS, stepId } from "@/lib/toc";
import type { Lab } from "@/lib/types";

describe("extractToc", () => {
  it("lists H2 and H3 headings with github-slugger ids", () => {
    const body = [
      "## Steps",
      "",
      "### Wire it up",
      "",
      "## Expected outcome",
      "",
      "#### Not listed",
    ].join("\n");
    expect(extractToc(body)).toEqual([
      { id: "steps", text: "Steps", level: 2 },
      { id: "wire-it-up", text: "Wire it up", level: 3 },
      { id: "expected-outcome", text: "Expected outcome", level: 2 },
    ]);
  });

  it("numbers duplicate headings the way rehype-slug does", () => {
    const body = ["## Notes", "", "### Notes", "", "### Notes"].join("\n");
    expect(extractToc(body).map((item) => item.id)).toEqual([
      "notes",
      "notes-1",
      "notes-2",
    ]);
  });

  it("uses the plain text of headings with inline code and links", () => {
    const body = "## Use `pinMode` and [the docs](https://example.com)";
    expect(extractToc(body)).toEqual([
      {
        id: "use-pinmode-and-the-docs",
        text: "Use pinMode and the docs",
        level: 2,
      },
    ]);
  });

  it("ignores headings inside fenced code", () => {
    const body = [
      "## Real",
      "",
      "```bash",
      "# comment",
      "## not a heading",
      "```",
    ].join("\n");
    expect(extractToc(body).map((item) => item.text)).toEqual(["Real"]);
  });

  it("lists each <Step> with the id the Step component renders", () => {
    const body = [
      "## Steps",
      "<Steps>",
      '<Step title="Install the IDE">',
      "text",
      "</Step>",
      '<Step title="Upload">',
      "text",
      "</Step>",
      "</Steps>",
    ].join("\n");
    expect(extractToc(body)).toEqual([
      { id: "steps", text: "Steps", level: 2 },
      { id: stepId(1), text: "Install the IDE", level: 3 },
      { id: stepId(2), text: "Upload", level: 3 },
    ]);
    expect(stepId(1)).toBe("step-1");
  });
});

describe("buildLabToc", () => {
  const lab = getLab("arduino-blink") as Lab;

  it("wraps the body headings in the page sections, in page order", () => {
    const ids = buildLabToc(lab).map((item) => item.id);
    expect(ids.slice(0, 3)).toEqual([
      LAB_SECTION_IDS.overview,
      LAB_SECTION_IDS.bom,
      LAB_SECTION_IDS.safety,
    ]);
    expect(ids.indexOf("steps")).toBeGreaterThan(
      ids.indexOf(LAB_SECTION_IDS.safety),
    );
    expect(ids.indexOf("troubleshooting")).toBeLessThan(
      ids.indexOf(LAB_SECTION_IDS.downloads),
    );
    expect(ids.slice(-2)).toEqual([
      LAB_SECTION_IDS.references,
      LAB_SECTION_IDS.next,
    ]);
  });

  it("leaves out Safety and Downloads when the lab has none", () => {
    const ids = buildLabToc({ ...lab, safety: [], downloads: [] }).map(
      (item) => item.id,
    );
    expect(ids).not.toContain(LAB_SECTION_IDS.safety);
    expect(ids).not.toContain(LAB_SECTION_IDS.downloads);
  });

  it("never repeats an id", () => {
    const ids = buildLabToc(lab).map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
