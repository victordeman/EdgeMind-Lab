import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <PageShell>
      <PageHeader
        title="Page not found"
        description="This address does not match any page on the site. It may have been moved or mistyped."
      />
      <p>
        <Link href="/" className={buttonVariants()}>
          Go to the home page
        </Link>
      </p>
    </PageShell>
  );
}
