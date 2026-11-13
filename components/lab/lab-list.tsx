import { LabCard } from "@/components/lab/lab-card";
import type { LabSummary } from "@/lib/lab-filters";

/** A grid of lab cards. Also the no-JavaScript view of the whole index. */
export function LabList({ labs }: { labs: LabSummary[] }) {
  return (
    <section aria-labelledby="lab-list-heading" className="flex flex-col gap-4">
      <h2 id="lab-list-heading" className="sr-only">
        Labs
      </h2>
      <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((lab) => (
          <li key={lab.slug} className="flex">
            <div className="flex w-full">
              <LabCard lab={lab} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
