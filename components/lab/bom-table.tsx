import { SectionHeading } from "@/components/layout/section-heading";
import { Badge } from "@/components/ui/badge";
import { LAB_SECTION_IDS } from "@/lib/toc";
import type { BomItem } from "@/lib/types";

/** Bill of materials. Columns share the width and text wraps, so it reads at 320 px without scrolling. */
export function BomTable({ items }: { items: BomItem[] }) {
  return (
    <section
      aria-labelledby={LAB_SECTION_IDS.bom}
      className="flex flex-col gap-4"
    >
      <SectionHeading
        id={LAB_SECTION_IDS.bom}
        title="Bill of materials"
        className="scroll-mt-24"
      />
      {items.length === 0 ? (
        <p className="text-muted-foreground">
          No hardware needed. This lab is software only.
        </p>
      ) : (
        <table className="w-full max-w-3xl table-fixed border-collapse text-left text-sm">
          <caption className="sr-only">Parts needed for this lab</caption>
          <thead>
            <tr className="border-b border-input">
              <th scope="col" className="w-[45%] py-2 pr-3 font-semibold">
                Item
              </th>
              <th scope="col" className="w-[14%] py-2 pr-3 font-semibold">
                Qty
              </th>
              <th scope="col" className="py-2 font-semibold">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((entry) => (
              <tr key={entry.item} className="border-b border-border align-top">
                <th
                  scope="row"
                  className="py-2 pr-3 font-normal break-words hyphens-auto"
                >
                  {entry.item}
                  {entry.optional ? (
                    <Badge className="ml-2 align-middle">Optional</Badge>
                  ) : null}
                </th>
                <td className="py-2 pr-3">{entry.quantity}</td>
                <td className="py-2 break-words text-muted-foreground">
                  {entry.notes ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
