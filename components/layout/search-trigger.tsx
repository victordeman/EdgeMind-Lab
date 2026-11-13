import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Placeholder: search is built in Phase 7, so the control is disabled until then. */
export function SearchTrigger() {
  return (
    <Button
      variant="outline"
      size="icon"
      disabled
      title="Search is not available yet"
    >
      <SearchIcon aria-hidden="true" />
      <span className="sr-only">Search (not available yet)</span>
    </Button>
  );
}
