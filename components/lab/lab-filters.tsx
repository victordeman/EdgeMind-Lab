"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DIFFICULTY_LABELS, HARDWARE_LABELS, TOPIC_LABELS } from "@/lib/labels";
import {
  hasFilters,
  toggleValue,
  type LabFilters as Filters,
} from "@/lib/lab-filters";
import { DIFFICULTIES, HARDWARE, TOPICS } from "@/lib/schemas";

type GroupName = keyof Filters;

type GroupProps<Value extends string> = {
  name: GroupName;
  legend: string;
  options: readonly Value[];
  labels: Record<Value, string>;
  selected: Value[];
  onToggle: (value: Value) => void;
};

function FilterGroup<Value extends string>({
  name,
  legend,
  options,
  labels,
  selected,
  onToggle,
}: GroupProps<Value>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((value) => (
          <label
            key={value}
            className="group inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
          >
            <input
              type="checkbox"
              name={name}
              value={value}
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
              className="sr-only"
            />
            <Check
              aria-hidden
              className="hidden size-3.5 group-has-[:checked]:block"
            />
            {labels[value]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type LabFiltersProps = {
  filters: Filters;
  onChange: (next: Filters) => void;
};

/** Hardware, difficulty and topic filters. Several values in a group widen the match; groups narrow it. */
export function LabFilters({ filters, onChange }: LabFiltersProps) {
  return (
    <form
      aria-labelledby="lab-filters-heading"
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-4 rounded-lg border border-border p-5"
    >
      <h2
        id="lab-filters-heading"
        className="text-lg font-semibold tracking-tight"
      >
        Filter labs
      </h2>
      <div className="grid gap-5 md:grid-cols-3">
        <FilterGroup
          name="hardware"
          legend="Hardware"
          options={HARDWARE}
          labels={HARDWARE_LABELS}
          selected={filters.hardware}
          onToggle={(value) =>
            onChange({
              ...filters,
              hardware: toggleValue(filters.hardware, value),
            })
          }
        />
        <FilterGroup
          name="difficulty"
          legend="Difficulty"
          options={DIFFICULTIES}
          labels={DIFFICULTY_LABELS}
          selected={filters.difficulty}
          onToggle={(value) =>
            onChange({
              ...filters,
              difficulty: toggleValue(filters.difficulty, value),
            })
          }
        />
        <FilterGroup
          name="topic"
          legend="Topic"
          options={TOPICS}
          labels={TOPIC_LABELS}
          selected={filters.topic}
          onToggle={(value) =>
            onChange({ ...filters, topic: toggleValue(filters.topic, value) })
          }
        />
      </div>
      {hasFilters(filters) ? (
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({ hardware: [], difficulty: [], topic: [] })
            }
          >
            Clear filters
          </Button>
        </div>
      ) : null}
    </form>
  );
}
