import { describe, expect, it } from "vitest";

import {
  EMPTY_FILTERS,
  filterLabs,
  hasFilters,
  parseFilters,
  serializeFilters,
  toggleValue,
  type LabSummary,
} from "@/lib/lab-filters";

function lab(overrides: Partial<LabSummary> & { slug: string }): LabSummary {
  return {
    title: overrides.slug,
    summary: "",
    hardware: ["arduino"],
    topics: ["electronics"],
    difficulty: "beginner",
    estimatedMinutes: 30,
    status: "draft",
    ...overrides,
  };
}

const LABS: LabSummary[] = [
  lab({ slug: "blink" }),
  lab({ slug: "sensors", difficulty: "intermediate" }),
  lab({
    slug: "gpio",
    hardware: ["raspberry-pi", "linux"],
    topics: ["electronics", "linux"],
  }),
  lab({
    slug: "llm",
    hardware: ["raspberry-pi"],
    topics: ["language-models"],
    difficulty: "intermediate",
  }),
];

const slugs = (labs: LabSummary[]) => labs.map((item) => item.slug);

describe("parseFilters", () => {
  it("reads comma-separated and repeated values in canonical order", () => {
    const params = new URLSearchParams(
      "hardware=raspberry-pi,arduino&hardware=linux&difficulty=beginner",
    );
    expect(parseFilters(params)).toEqual({
      hardware: ["arduino", "raspberry-pi", "linux"],
      difficulty: ["beginner"],
      topic: [],
    });
  });

  it("drops unknown values and unknown groups", () => {
    const params = new URLSearchParams(
      "hardware=toaster,arduino&colour=red&topic=",
    );
    expect(parseFilters(params)).toEqual({
      hardware: ["arduino"],
      difficulty: [],
      topic: [],
    });
  });
});

describe("serializeFilters", () => {
  it("round-trips through parseFilters", () => {
    const filters = {
      hardware: ["arduino", "linux"] as const,
      difficulty: ["beginner"] as const,
      topic: [] as never[],
    };
    const query = serializeFilters({
      hardware: [...filters.hardware],
      difficulty: [...filters.difficulty],
      topic: [],
    });
    expect(query).toBe("hardware=arduino,linux&difficulty=beginner");
    expect(parseFilters(new URLSearchParams(query))).toEqual({
      hardware: ["arduino", "linux"],
      difficulty: ["beginner"],
      topic: [],
    });
  });

  it("is empty when nothing is selected", () => {
    expect(serializeFilters(EMPTY_FILTERS)).toBe("");
    expect(hasFilters(EMPTY_FILTERS)).toBe(false);
  });
});

describe("filterLabs", () => {
  it("returns every lab when no filter is set", () => {
    expect(filterLabs(LABS, EMPTY_FILTERS)).toHaveLength(LABS.length);
  });

  it("matches any selected value within a group", () => {
    const result = filterLabs(LABS, {
      ...EMPTY_FILTERS,
      hardware: ["linux", "arduino"],
    });
    expect(slugs(result)).toEqual(["blink", "sensors", "gpio"]);
  });

  it("requires a match in every group that has a selection", () => {
    const result = filterLabs(LABS, {
      hardware: ["raspberry-pi"],
      difficulty: ["intermediate"],
      topic: [],
    });
    expect(slugs(result)).toEqual(["llm"]);
    expect(
      slugs(
        filterLabs(LABS, {
          hardware: ["arduino"],
          difficulty: ["beginner"],
          topic: [],
        }),
      ),
    ).toEqual(["blink"]);
  });

  it("matches a lab on any of its topics", () => {
    expect(
      slugs(filterLabs(LABS, { ...EMPTY_FILTERS, topic: ["linux"] })),
    ).toEqual(["gpio"]);
  });

  it("returns nothing when the groups cannot all match", () => {
    expect(
      filterLabs(LABS, { hardware: ["ender-3"], difficulty: [], topic: [] }),
    ).toEqual([]);
  });
});

describe("toggleValue", () => {
  it("adds a missing value and removes a present one", () => {
    expect(toggleValue(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleValue(["a", "b"], "a")).toEqual(["b"]);
  });
});
