import { Download as DownloadIcon } from "lucide-react";

import { SectionHeading } from "@/components/layout/section-heading";
import { Badge } from "@/components/ui/badge";
import { getPublicFileSize } from "@/lib/content";
import { DOWNLOAD_KIND_LABELS, formatBytes } from "@/lib/labels";
import { LAB_SECTION_IDS } from "@/lib/toc";
import type { Download } from "@/lib/types";

/** Files a student can take away: label, kind and size. Renders nothing when there are none. */
export function DownloadList({ downloads }: { downloads: Download[] }) {
  if (downloads.length === 0) return null;

  return (
    <section
      aria-labelledby={LAB_SECTION_IDS.downloads}
      className="flex flex-col gap-4"
    >
      <SectionHeading
        id={LAB_SECTION_IDS.downloads}
        title="Downloads"
        className="scroll-mt-24"
      />
      <ul className="flex max-w-prose list-none flex-col gap-2 p-0">
        {downloads.map((item) => {
          const size = getPublicFileSize(item.file);
          const fileName = item.file.split("/").pop() ?? item.file;
          return (
            <li key={item.file} className="flex flex-wrap items-center gap-2">
              <DownloadIcon aria-hidden className="size-4 shrink-0" />
              <a
                href={item.file}
                download={fileName}
                className="text-brand underline underline-offset-4 hover:no-underline"
              >
                {item.label}
              </a>
              <Badge>{DOWNLOAD_KIND_LABELS[item.kind]}</Badge>
              {size === undefined ? null : (
                <span className="text-sm text-muted-foreground">
                  {formatBytes(size)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
