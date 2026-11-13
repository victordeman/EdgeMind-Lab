import Link from "next/link";

type PageLink = {
  href: string;
  title: string;
  summary: string;
};

/** Plain list of child pages, used by index pages until their cards exist. */
export function PageLinkList({ items }: { items: PageLink[] }) {
  return (
    <ul className="flex max-w-prose flex-col divide-y border-y">
      {items.map((item) => (
        <li key={item.href} className="flex flex-col gap-1 py-4">
          <Link
            href={item.href}
            className="font-medium text-brand underline underline-offset-4 hover:no-underline"
          >
            {item.title}
          </Link>
          <p className="text-sm text-muted-foreground">{item.summary}</p>
        </li>
      ))}
    </ul>
  );
}
