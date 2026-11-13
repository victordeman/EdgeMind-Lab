import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";

/** Vertical rhythm shared by every page inside <main>. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      {children}
    </Container>
  );
}
