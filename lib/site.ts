const DEFAULT_SITE_URL = "http://localhost:3000";

export function resolveSiteUrl(value: string | undefined): string {
  const trimmed = value?.trim().replace(/\/+$/, "");
  return trimmed ? trimmed : DEFAULT_SITE_URL;
}

export type NavItem = {
  label: string;
  href: string;
};

export const site = {
  name: "EdgeMind Lab",
  institution: "WIGWE UNIVERSITY – College of Science and Computing",
  description:
    "Hands-on labs and exercises in Arduino, Raspberry Pi + Linux, language models, AI agents and Ender-3 V3 SE 3D printing for robotics.",
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  repository: "https://github.com/victordeman/EdgeMind-Lab",
  nav: [
    { label: "Paths", href: "/paths" },
    { label: "Labs", href: "/labs" },
    { label: "Hardware", href: "/hardware" },
    { label: "AI", href: "/ai" },
    { label: "Resources", href: "/resources" },
    { label: "About", href: "/about" },
  ] satisfies NavItem[],
} as const;
