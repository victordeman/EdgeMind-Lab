"use client";

import { Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ResourceList } from "@/components/resources/resource-list";
import { Button } from "@/components/ui/button";
import { filterResources, type ResourceEntry } from "@/lib/derive";
import { parseFilters, serializeFilters, toggleValue } from "@/lib/lab-filters";
import { HARDWARE_LABELS } from "@/lib/labels";
import { HARDWARE } from "@/lib/schemas";

/** Resources with a hardware filter kept in the URL (`?hardware=arduino,linux`). */
export function ResourceBrowser({ entries }: { entries: ResourceEntry[] }) {
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const selected = filters.hardware;
  const visible = filterResources(entries, selected);

  function update(hardware: typeof selected) {
    const query = serializeFilters({
      ...filters,
      hardware,
      difficulty: [],
      topic: [],
    });
    window.history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(event) => event.preventDefault()}
        className="flex flex-col gap-3 rounded-lg border border-border p-5"
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">Hardware</legend>
          <div className="flex flex-wrap gap-2">
            {HARDWARE.map((value) => (
              <label
                key={value}
                className="group inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
              >
                <input
                  type="checkbox"
                  name="hardware"
                  value={value}
                  checked={selected.includes(value)}
                  onChange={() => update(toggleValue(selected, value))}
                  className="sr-only"
                />
                <Check
                  aria-hidden
                  className="hidden size-3.5 group-has-[:checked]:block"
                />
                {HARDWARE_LABELS[value]}
              </label>
            ))}
          </div>
        </fieldset>
        {selected.length > 0 ? (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => update([])}
            >
              Clear filter
            </Button>
          </div>
        ) : null}
      </form>
      <p role="status" className="text-sm text-muted-foreground">
        {selected.length > 0
          ? `Showing ${visible.length} of ${entries.length} resources`
          : `${entries.length} resources`}
      </p>
      {visible.length > 0 ? (
        <ResourceList entries={visible} />
      ) : (
        <p className="font-semibold">No resources match this filter.</p>
      )}
    </div>
  );
}
