"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell>
      <PageHeader
        title="Something went wrong"
        description="This page could not be displayed. Try again, or go back to the home page."
      />
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go to the home page
        </Link>
      </div>
    </PageShell>
  );
}
