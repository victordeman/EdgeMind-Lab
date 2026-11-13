import type { TocItem } from "@/lib/toc";
import { cn } from "@/lib/utils";

function TocList({ items }: { items: TocItem[] }) {
  return (
    <ol className="flex list-none flex-col gap-1 p-0 text-sm">
      {items.map((item) => (
        <li key={item.id} className={cn(item.level === 3 && "pl-4")}>
          <a
            href={`#${item.id}`}
            className="block py-0.5 text-muted-foreground hover:text-foreground hover:underline"
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * "On this page". A sticky sidebar on wide screens and a collapsible block
 * above the lab on narrow ones. Both work without JavaScript.
 */
export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;

  return (
    <aside className="order-first xl:order-last">
      <details className="rounded-lg border border-input p-4 xl:hidden">
        <summary className="cursor-pointer font-semibold">On this page</summary>
        <div className="mt-3">
          <TocList items={items} />
        </div>
      </details>
      <nav
        aria-label="On this page"
        className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto xl:block"
      >
        <p className="mb-2 text-sm font-semibold">On this page</p>
        <TocList items={items} />
      </nav>
    </aside>
  );
}
