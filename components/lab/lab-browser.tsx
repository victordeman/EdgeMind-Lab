"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { LabFilters } from "@/components/lab/lab-filters";
import { LabList } from "@/components/lab/lab-list";
import { Button } from "@/components/ui/button";
import {
  EMPTY_FILTERS,
  filterLabs,
  hasFilters,
  parseFilters,
  serializeFilters,
  type LabFilters as Filters,
  type LabSummary,
} from "@/lib/lab-filters";

/**
 * The lab index with filters. The selection lives in the URL, so a filtered
 * view can be shared and survives a reload. The server renders the full list,
 * which is what a visitor without JavaScript sees.
 */
export function LabBrowser({ labs }: { labs: LabSummary[] }) {
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const visible = filterLabs(labs, filters);

  function update(next: Filters) {
    const query = serializeFilters(next);
    const url = query ? `?${query}` : window.location.pathname;
    // Next.js syncs history.replaceState with useSearchParams.
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="flex flex-col gap-6">
      <LabFilters filters={filters} onChange={update} />
      <p role="status" className="text-sm text-muted-foreground">
        {hasFilters(filters)
          ? `Showing ${visible.length} of ${labs.length} labs`
          : `${labs.length} labs`}
      </p>
      {visible.length > 0 ? (
        <LabList labs={visible} />
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-border p-6">
          <p className="font-semibold">No labs match these filters.</p>
          <p className="text-muted-foreground">
            Remove a filter to see more labs.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => update(EMPTY_FILTERS)}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
