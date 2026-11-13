import { describe, expect, it } from "vitest";

import {
  getAiPages,
  getHubs,
  getLabs,
  getLabsByHardware,
  getPathLabs,
  getPathMinutes,
  getPaths,
  getResources,
} from "@/lib/content";
import {
  collectResources,
  filterResources,
  firstAvailableLab,
  focusAreas,
  pathStats,
  pathsForHardware,
  pathsForTopic,
  recentLabs,
} from "@/lib/derive";
import type { Lab } from "@/lib/types";

function lab(overrides: Partial<Lab> & { slug: string }): Lab {
  return {
    title: overrides.slug,
    summary: "Summary.",
    hardware: ["arduino"],
    topics: ["electronics"],
    difficulty: "beginner",
    estimatedMinutes: 30,
    objectives: ["Do it."],
    prerequisites: [],
    bom: [],
    safety: [],
    downloads: [],
    references: [{ label: "Docs", url: "https://example.com/" }],
    status: "draft",
    updated: "2026-01-01",
    body: "",
    ...overrides,
  } as Lab;
}

describe("path totals", () => {
  it("equals the sum of estimatedMinutes of the path's available labs", () => {
    for (const path of getPaths()) {
      const expected = getPathLabs(path)
        .filter((item) => item.status !== "planned")
        .reduce((sum, item) => sum + item.estimatedMinutes, 0);
      expect(pathStats(getPathLabs(path)).minutes, path.slug).toBe(expected);
      expect(getPathMinutes(path.slug), path.slug).toBe(expected);
    }
  });

  it("counts planned labs in the total but not as available", () => {
    const stats = pathStats([
      lab({ slug: "a", estimatedMinutes: 20 }),
      lab({ slug: "b", estimatedMinutes: 40, status: "planned" }),
      lab({ slug: "c", estimatedMinutes: 10, status: "reviewed" }),
    ]);
    expect(stats).toEqual({ total: 3, available: 2, minutes: 30 });
  });

  it("starts a path at the first lab that is not planned", () => {
    const labs = [
      lab({ slug: "a", status: "planned" }),
      lab({ slug: "b" }),
      lab({ slug: "c" }),
    ];
    expect(firstAvailableLab(labs)?.slug).toBe("b");
    expect(firstAvailableLab([labs[0]])).toBeUndefined();
  });
});

describe("derived listings", () => {
  it("lists a path under a hardware hub when one of its labs uses the hardware", () => {
    const labs = getLabs();
    for (const hub of getHubs()) {
      const expected = getPaths().filter((path) =>
        getPathLabs(path).some((item) => item.hardware.includes(hub.slug)),
      );
      expect(
        pathsForHardware(getPaths(), labs, hub.slug).map((p) => p.slug),
        hub.slug,
      ).toEqual(expected.map((p) => p.slug));
    }
  });

  it("finds paths for a topic", () => {
    const slugs = pathsForTopic(getPaths(), getLabs(), "ai-agents").map(
      (path) => path.slug,
    );
    expect(slugs).toContain("ai-agents");
  });

  it("returns the newest available labs first and skips planned ones", () => {
    const result = recentLabs(
      [
        lab({ slug: "old", updated: "2026-01-01" }),
        lab({ slug: "new", updated: "2026-03-01" }),
        lab({ slug: "future", updated: "2026-05-01", status: "planned" }),
        lab({ slug: "mid", updated: "2026-02-01" }),
      ],
      2,
    );
    expect(result.map((item) => item.slug)).toEqual(["new", "mid"]);
  });

  it("names the five focus areas from the hub and AI pages", () => {
    const areas = focusAreas(getHubs(), getAiPages());
    expect(areas.map((area) => area.href)).toEqual([
      "/hardware/arduino",
      "/hardware/raspberry-pi",
      "/ai/language-models",
      "/ai/agents",
      "/hardware/ender-3",
    ]);
  });
});

describe("collectResources", () => {
  it("includes standalone resources and every download of an available lab", () => {
    const entries = collectResources(getLabs(), getResources());
    for (const resource of getResources()) {
      expect(entries.map((entry) => entry.href)).toContain(resource.href);
    }
    for (const item of getLabs().filter((l) => l.status !== "planned")) {
      for (const download of item.downloads) {
        const entry = entries.find((e) => e.href === download.file);
        expect(entry?.lab?.slug, download.file).toBe(item.slug);
      }
    }
  });

  it("adds a parts-list entry for each lab with a BOM and none for planned labs", () => {
    const entries = collectResources(
      [
        lab({
          slug: "with-bom",
          bom: [{ item: "LED", quantity: 1 }] as Lab["bom"],
        }),
        lab({ slug: "no-bom" }),
        lab({
          slug: "planned",
          status: "planned",
          bom: [{ item: "LED", quantity: 1 }] as Lab["bom"],
          downloads: [{ label: "x", file: "/code/x.py", kind: "code" }],
        }),
      ],
      [],
    );
    expect(entries.map((entry) => entry.href)).toEqual([
      "/labs/with-bom#lab-bom",
    ]);
    expect(entries[0]).toMatchObject({
      category: "bom",
      lab: { slug: "with-bom" },
    });
  });

  it("maps download kinds to resource categories", () => {
    const entries = collectResources(
      [
        lab({
          slug: "x",
          downloads: [
            { label: "a", file: "/code/a.py", kind: "code" },
            { label: "b", file: "/stl/b.stl", kind: "stl" },
            { label: "c", file: "/diagrams/c.svg", kind: "diagram" },
          ],
        }),
      ],
      [],
    );
    expect(entries.map((entry) => entry.category)).toEqual([
      "code",
      "stl",
      "diagram",
    ]);
  });

  it("filters by hardware with OR and returns everything for no selection", () => {
    const entries = collectResources(getLabs(), getResources());
    expect(filterResources(entries, [])).toHaveLength(entries.length);
    const ender = filterResources(entries, ["ender-3"]);
    expect(ender.length).toBeGreaterThan(0);
    for (const entry of ender) expect(entry.hardware).toContain("ender-3");
    const both = filterResources(entries, ["ender-3", "arduino"]);
    expect(both.length).toBeGreaterThanOrEqual(ender.length);
  });
});

describe("hub labs", () => {
  it("lists every lab for the hardware, so a new lab file appears with no other edit", () => {
    for (const hub of getHubs()) {
      expect(getLabsByHardware(hub.slug).map((l) => l.slug)).toEqual(
        getLabs()
          .filter((l) => l.hardware.includes(hub.slug))
          .map((l) => l.slug),
      );
    }
  });
});
