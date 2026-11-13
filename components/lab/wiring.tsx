import Image from "next/image";
import { Children, isValidElement, type ReactNode } from "react";

type ConnectionProps = {
  from: string;
  to: string;
  notes?: string;
};

/** One row of a `<Wiring>` table: where a wire starts, where it ends, and an optional note. */
export function Connection({ from, to, notes }: ConnectionProps) {
  return (
    <tr className="border-b border-border align-top">
      <th scope="row" className="py-2 pr-3 font-normal break-words">
        {from}
      </th>
      <td className="py-2 pr-3 break-words">{to}</td>
      <td className="py-2 break-words text-muted-foreground">{notes ?? ""}</td>
    </tr>
  );
}

type WiringProps = {
  children: ReactNode;
  /** Site path of an SVG under `public/diagrams/`. */
  diagram?: string;
  /** Required with `diagram`: what the picture shows. */
  alt?: string;
  width?: number;
  height?: number;
};

/** Pin-to-pin connection table with an optional diagram. Children are `<Connection>` rows. */
export function Wiring({
  children,
  diagram,
  alt,
  width = 800,
  height = 450,
}: WiringProps) {
  if (diagram && !alt) {
    throw new Error(`<Wiring diagram="${diagram}"> needs an alt text`);
  }
  const rows = Children.toArray(children).filter(isValidElement);

  return (
    <div className="flex flex-col gap-4">
      {diagram ? (
        <figure className="max-w-3xl">
          <Image
            src={diagram}
            alt={alt ?? ""}
            width={width}
            height={height}
            unoptimized
            className="h-auto w-full rounded-lg border border-border bg-white"
          />
        </figure>
      ) : null}
      <table className="w-full max-w-3xl table-fixed border-collapse text-left text-sm">
        <caption className="sr-only">Wire connections</caption>
        <thead>
          <tr className="border-b border-input">
            <th scope="col" className="w-[36%] py-2 pr-3 font-semibold">
              From
            </th>
            <th scope="col" className="w-[36%] py-2 pr-3 font-semibold">
              To
            </th>
            <th scope="col" className="py-2 font-semibold">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}
