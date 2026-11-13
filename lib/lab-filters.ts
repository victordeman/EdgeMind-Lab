import { DIFFICULTIES, HARDWARE, TOPICS } from "@/lib/schemas";
import type { Difficulty, Hardware, Lab, Topic } from "@/lib/types";

/** The part of a lab the index needs. Small enough to send to the browser. */
export type LabSummary = Pick<
  Lab,
  | "slug"
  | "title"
  | "summary"
  | "hardware"
  | "topics"
  | "difficulty"
  | "estimatedMinutes"
  | "status"
>;

export type LabFilters = {
  hardware: Hardware[];
  difficulty: Difficulty[];
  topic: Topic[];
};

export const EMPTY_FILTERS: LabFilters = {
  hardware: [],
  difficulty: [],
  topic: [],
};

/** Anything with `getAll`, such as `URLSearchParams` or Next's read-only version. */
type ParamSource = { getAll(name: string): string[] };

function readGroup<Value extends string>(
  params: ParamSource,
  name: string,
  allowed: readonly Value[],
): Value[] {
  const requested = new Set(
    params
      .getAll(name)
      .flatMap((value) => value.split(","))
      .map((value) => value.trim()),
  );
  // Canonical order, unknown values dropped.
  return allowed.filter((value) => requested.has(value));
}

export function parseFilters(params: ParamSource): LabFilters {
  return {
    hardware: readGroup(params, "hardware", HARDWARE),
    difficulty: readGroup(params, "difficulty", DIFFICULTIES),
    topic: readGroup(params, "topic", TOPICS),
  };
}

/** Query string without the leading "?"; empty when no filter is set. */
export function serializeFilters(filters: LabFilters): string {
  const params = new URLSearchParams();
  for (const name of ["hardware", "difficulty", "topic"] as const) {
    if (filters[name].length > 0) params.set(name, filters[name].join(","));
  }
  // Keep the commas readable in the address bar.
  return params.toString().replace(/%2C/g, ",");
}

export function hasFilters(filters: LabFilters): boolean {
  return (
    filters.hardware.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.topic.length > 0
  );
}

/** Within a group a lab matches any selected value; across groups it must match all. */
export function filterLabs<Item extends LabSummary>(
  labs: Item[],
  filters: LabFilters,
): Item[] {
  return labs.filter(
    (lab) =>
      (filters.hardware.length === 0 ||
        lab.hardware.some((value) => filters.hardware.includes(value))) &&
      (filters.difficulty.length === 0 ||
        filters.difficulty.includes(lab.difficulty)) &&
      (filters.topic.length === 0 ||
        lab.topics.some((value) => filters.topic.includes(value))),
  );
}

export function toggleValue<Value extends string>(
  values: Value[],
  value: Value,
): Value[] {
  return values.includes(value)
    ? values.filter((existing) => existing !== value)
    : [...values, value];
}
