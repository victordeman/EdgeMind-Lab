import Link from "next/link";

import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLinks } from "@/components/layout/nav-links";
import { SearchTrigger } from "@/components/layout/search-trigger";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { site } from "@/lib/site";

const desktopLink = {
  linkClassName:
    "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  activeClassName:
    "text-foreground underline decoration-brand decoration-2 underline-offset-8",
};

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="border-b bg-muted">
        <Container>
          <p className="py-1.5 text-xs font-medium tracking-wide text-muted-foreground">
            {site.institution}
          </p>
        </Container>
      </div>
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="rounded-lg text-lg font-semibold tracking-tight"
        >
          {site.name}
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            <NavLinks {...desktopLink} />
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <SearchTrigger />
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
