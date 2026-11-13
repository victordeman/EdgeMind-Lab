import rehypeShiki from "@shikijs/rehype";
import Link from "next/link";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import type { ComponentProps } from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { CodeFile } from "@/components/lab/code-file";
import { ExpectedOutcome } from "@/components/lab/expected-outcome";
import { Step, Steps } from "@/components/lab/steps";
import { Issue, Troubleshooting } from "@/components/lab/troubleshooting";
import { Connection, Wiring } from "@/components/lab/wiring";
import { SHIKI_THEMES } from "@/lib/highlight";
import { cn } from "@/lib/utils";

const linkClass = "text-brand underline underline-offset-4 hover:no-underline";

function MdxLink({ href = "", className, ...props }: ComponentProps<"a">) {
  // Heading anchors added by rehype-autolink-headings keep the heading's colour.
  if (className?.split(" ").includes("heading-anchor")) {
    return <a href={href} className={className} {...props} />;
  }
  if (href.startsWith("/")) {
    return <Link href={href} className={cn(linkClass, className)} {...props} />;
  }
  return <a href={href} className={cn(linkClass, className)} {...props} />;
}

const components: MDXRemoteProps["components"] = {
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "mt-4 scroll-mt-24 text-2xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "scroll-mt-24 text-lg font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("max-w-prose", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        "flex max-w-prose list-disc flex-col gap-1 pl-5",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        "flex max-w-prose list-decimal flex-col gap-1 pl-5",
        className,
      )}
      {...props}
    />
  ),
  a: MdxLink,
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[0.9em] break-words [pre_&]:bg-transparent [pre_&]:p-0",
        className,
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <table
      className={cn(
        "w-full max-w-3xl table-fixed border-collapse text-left text-sm",
        className,
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn("border-b border-input py-2 pr-3 font-semibold", className)}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn("border-b border-border py-2 pr-3 break-words", className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "max-w-prose border-l-4 border-input pl-4 text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  hr: () => <hr className="border-border" />,
  Steps,
  Step,
  Wiring,
  Connection,
  CodeFile,
  ExpectedOutcome,
  Troubleshooting,
  Issue,
};

const options: MDXRemoteProps["options"] = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        { behavior: "wrap", properties: { className: ["heading-anchor"] } },
      ],
      // Fenced code in the body. Unknown languages, such as G-code, render as plain text.
      [
        rehypeShiki,
        {
          themes: SHIKI_THEMES,
          defaultColor: false,
          fallbackLanguage: "text",
        },
      ],
    ],
  },
};

/**
 * Renders a lab's MDX body. Content is first-party and is validated at build
 * time; `next-mdx-remote` keeps its default of blocking JavaScript
 * expressions, so bodies use string props and child components only.
 */
export function LabBody({ source }: { source: string }) {
  return (
    <div className="flex flex-col gap-4">
      <MDXRemote source={source} components={components} options={options} />
    </div>
  );
}
