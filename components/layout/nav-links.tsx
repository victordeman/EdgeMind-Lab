"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActiveNavItem, site } from "@/lib/site";
import { cn } from "@/lib/utils";

type NavLinksProps = {
  linkClassName: string;
  activeClassName: string;
};

/** Primary navigation items as list items, with the current section marked. */
export function NavLinks({ linkClassName, activeClassName }: NavLinksProps) {
  const pathname = usePathname();

  return site.nav.map((item) => {
    const active = isActiveNavItem(pathname, item);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cn(linkClassName, active && activeClassName)}
        >
          {item.label}
        </Link>
      </li>
    );
  });
}
