import { describe, expect, it } from "vitest";

import { getAiPages, getHubs, getLabs, getPaths } from "@/lib/content";
import { getSiteRoutes, STATIC_ROUTES } from "@/lib/routes";
import { SECTIONS } from "@/lib/sections";
import { site } from "@/lib/site";

describe("getSiteRoutes", () => {
  const routes = getSiteRoutes();
  const paths = routes.map((route) => route.path);

  it("lists each page once", () => {
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("includes the static routes and one route per content file", () => {
    expect(paths).toEqual(expect.arrayContaining([...STATIC_ROUTES]));
    expect(paths).toHaveLength(
      STATIC_ROUTES.length +
        getPaths().length +
        getLabs().length +
        getHubs().length +
        getAiPages().length,
    );
    expect(paths).toEqual(
      expect.arrayContaining([
        "/paths/arduino-fundamentals",
        "/labs/arduino-blink",
        "/hardware/ender-3",
        "/ai/language-models",
        "/ai/agents",
      ]),
    );
  });

  it("dates lab pages from their frontmatter", () => {
    const lab = getLabs()[0];
    expect(routes).toContainEqual({
      path: `/labs/${lab.slug}`,
      lastModified: lab.updated,
    });
  });
});

describe("SECTIONS", () => {
  it("describes every primary navigation entry", () => {
    expect(SECTIONS.map((section) => section.href)).toEqual(
      site.nav.map((item) => item.href),
    );
  });
});
