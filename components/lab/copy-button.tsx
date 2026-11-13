"use client";

import { Check, Copy } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

const subscribe = () => () => {};

/** Copies text to the clipboard. Hidden until the page is interactive, because it needs JavaScript. */
export function CopyButton({
  text,
  fileName,
}: {
  text: string;
  fileName: string;
}) {
  const interactive = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  if (!interactive) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2000);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy}>
      {state === "copied" ? <Check aria-hidden /> : <Copy aria-hidden />}
      <span>
        {state === "copied"
          ? "Copied"
          : state === "failed"
            ? "Copy failed"
            : "Copy"}
        <span className="sr-only"> {fileName}</span>
      </span>
      <span role="status" className="sr-only">
        {state === "copied" ? `${fileName} copied to the clipboard` : ""}
      </span>
    </Button>
  );
}
