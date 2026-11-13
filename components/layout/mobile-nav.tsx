"use client";

import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { NavLinks } from "@/components/layout/nav-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function MenuButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="outline" size="icon" className="md:hidden" {...props}>
      <MenuIcon aria-hidden="true" />
      <span className="sr-only">Open menu</span>
    </Button>
  );
}

/**
 * Primary navigation for narrow screens. The dialog traps focus and closes on
 * Escape; it also closes when the route changes.
 */
export function MobileNav() {
  const pathname = usePathname();
  // Remembering where the menu was opened closes it on any navigation.
  const [openedAt, setOpenedAt] = useState<string | null>(null);

  return (
    <Sheet
      open={openedAt === pathname}
      onOpenChange={(open) => setOpenedAt(open ? pathname : null)}
    >
      <SheetTrigger render={<MenuButton />} />
      <SheetContent className="p-6">
        <SheetTitle>Menu</SheetTitle>
        <nav aria-label="Main">
          <ul className="flex flex-col gap-1">
            <NavLinks
              linkClassName="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              activeClassName="bg-accent text-accent-foreground"
            />
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
