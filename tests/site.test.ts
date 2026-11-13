import { describe, expect, it } from "vitest";

import { isActiveNavItem, resolveSiteUrl, site } from "@/lib/site";

describe("site constants", () => {
  it("names the lab and the institution", () => {
    expect(site.name).toBe("EdgeMind Lab");
    expect(site.institution).toBe(
      "WIGWE UNIVERSITY – College of Science and Computing",
    );
  });

  it("lists a navigation entry for every top-level section", () => {
    expect(site.nav.map((item) => item.href)).toEqual([
      "/paths",
      "/labs",
      "/hardware",
      "/ai",
      "/resources",
      "/about",
    ]);
  });
});

describe("resolveSiteUrl", () => {
  it("falls back to localhost when the variable is missing or blank", () => {
    expect(resolveSiteUrl(undefined)).toBe("http://localhost:3000");
    expect(resolveSiteUrl("  ")).toBe("http://localhost:3000");
  });

  it("strips trailing slashes", () => {
    expect(resolveSiteUrl("https://example.org/")).toBe("https://example.org");
  });
});

describe("isActiveNavItem", () => {
  const labs = { label: "Labs", href: "/labs" };

  it("matches the section page and the pages below it", () => {
    expect(isActiveNavItem("/labs", labs)).toBe(true);
    expect(isActiveNavItem("/labs/arduino-blink", labs)).toBe(true);
  });

  it("does not match other sections that share a prefix", () => {
    expect(isActiveNavItem("/", labs)).toBe(false);
    expect(isActiveNavItem("/labs-archive", labs)).toBe(false);
    expect(isActiveNavItem("/paths", labs)).toBe(false);
  });
});
