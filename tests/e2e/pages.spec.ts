import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { getLabs, getPaths } from "@/lib/content";
import { getSiteRoutes } from "@/lib/routes";

const routes = getSiteRoutes().map((route) => route.path);

function blocking(
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
) {
  return violations.filter((v) =>
    ["serious", "critical"].includes(v.impact ?? ""),
  );
}

test("every internal link on the home page resolves to a 200 page", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const hrefs = await page
    .locator("a[href^='/']")
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute("href") as string),
    );
  const targets = [...new Set(hrefs.map((href) => href.split("#")[0]))];
  expect(targets.length).toBeGreaterThan(10);
  for (const target of targets) {
    const response = await request.get(target);
    expect(response.status(), target).toBe(200);
  }
});

test.describe("home", () => {
  test("shows the hero actions, every path, five focus areas and the newest labs", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: "Browse learning paths" }),
    ).toHaveAttribute("href", "/paths");
    await expect(
      page.getByRole("link", { name: "All labs" }).first(),
    ).toHaveAttribute("href", "/labs");
    for (const path of getPaths()) {
      await expect(
        page.locator(`main a[href="/paths/${path.slug}"]`).first(),
      ).toBeVisible();
    }
    const quickStart = page.getByRole("region", { name: "Quick start" });
    await expect(quickStart.getByRole("listitem")).toHaveCount(5);
    const recent = page.getByRole("region", { name: "Recently updated labs" });
    await expect(recent.locator("a[href^='/labs/']")).toHaveCount(
      Math.min(3, getLabs().filter((lab) => lab.status !== "planned").length),
    );
  });
});

test.describe("paths", () => {
  test("a path page shows outcomes, modules and a Start path link to an available lab", async ({
    page,
  }) => {
    await page.goto("/paths/arduino-fundamentals");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByText("0 of").first()).toBeVisible();
    const start = page.getByRole("link", { name: /Start path/ });
    await expect(start).toHaveAttribute("href", "/labs/arduino-blink");
    await expect(
      page.getByRole("heading", { name: "Modules and labs" }),
    ).toBeVisible();
  });
});

test.describe("hardware hubs", () => {
  test("a hub lists its labs from lab data", async ({ page }) => {
    await page.goto("/hardware/ender-3");
    for (const lab of getLabs().filter((l) => l.hardware.includes("ender-3"))) {
      await expect(
        page.locator(`main a[href="/labs/${lab.slug}"]`).first(),
      ).toBeVisible();
    }
  });
});

test.describe("resources", () => {
  test("filters by hardware in the URL and survives a reload", async ({
    page,
  }) => {
    await page.goto("/resources?hardware=ender-3");
    const box = page
      .getByRole("group", { name: "Hardware" })
      .getByRole("checkbox", { name: "Ender-3 V3 SE" });
    await expect(box).toBeChecked();
    await page.reload();
    await expect(box).toBeChecked();
    await expect(page.getByText(/Showing \d+ of \d+ resources/)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Raspberry Pi documentation/ }),
    ).toHaveCount(0);
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });
    test("lists every resource", async ({ page }) => {
      await page.goto("/resources");
      await expect(
        page.getByRole("link", { name: /Arduino documentation/ }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Creality Wiki/ }),
      ).toBeVisible();
    });
  });
});

test.describe("about", () => {
  test("is marked as placeholder and invents no contact details", async ({
    page,
  }) => {
    await page.goto("/about");
    await expect(page.getByText("Placeholder.")).toBeVisible();
    await expect(
      page.locator("main a[href^='mailto:'], main a[href^='tel:']"),
    ).toHaveCount(0);
  });
});

test.describe("accessibility of every page", () => {
  for (const route of routes) {
    test(`${route} has no serious axe violations (light)`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(blocking(results.violations)).toEqual([]);
    });
  }

  for (const route of [
    "/",
    "/paths",
    "/paths/arduino-fundamentals",
    "/hardware",
    "/hardware/ender-3",
    "/ai",
    "/ai/agents",
    "/resources",
    "/about",
  ]) {
    test(`${route} has no serious axe violations (dark)`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(blocking(results.violations)).toEqual([]);
    });
  }
});
