import { Download } from "lucide-react";

import { CopyButton } from "@/components/lab/copy-button";
import { buttonVariants } from "@/components/ui/button";
import { readPublicTextFile } from "@/lib/content";
import { highlightCode, languageForFile } from "@/lib/highlight";
import { cn } from "@/lib/utils";

type CodeFileProps = {
  /** Site path under `public/code/`, for example `/code/arduino-blink/blink.ino`. */
  file: string;
  /** Caption; defaults to the file name. */
  title?: string;
};

/**
 * A downloadable source file shown highlighted. The text is read from `public/`
 * at build time, so the page and the download can never disagree.
 */
export async function CodeFile({ file, title }: CodeFileProps) {
  const source = readPublicTextFile(file);
  if (source === undefined) {
    throw new Error(`<CodeFile>: file not found: public${file}`);
  }
  const fileName = file.split("/").pop() ?? file;
  const html = await highlightCode(
    source.replace(/\r?\n$/, ""),
    languageForFile(fileName),
  );

  return (
    <figure className="overflow-hidden rounded-lg border border-input">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-input bg-muted px-3 py-2">
        <span className="font-mono text-sm break-all">{title ?? fileName}</span>
        <span className="flex gap-2">
          <CopyButton text={source} fileName={fileName} />
          <a
            href={file}
            download={fileName}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Download aria-hidden />
            <span>
              Download<span className="sr-only"> {fileName}</span>
            </span>
          </a>
        </span>
      </figcaption>
      <div className="code-block" dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
