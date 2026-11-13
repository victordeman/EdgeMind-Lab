import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { getSiteRoutes } from "@/lib/routes";
import { site } from "@/lib/site";

const routes = getSiteRoutes().map((route) => route.path);

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
}

test.describe("every route", () => {
  for (const route of routes) {
    test(`${route} renders inside the shell`, async ({ page }) => {
      // Catches a missing stylesheet, font or script as well as a failed page.
      const failed: string[] = [];
      page.on("response", (res) => {
        if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
      });

      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);
      expect(failed).toEqual([]);

      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("banner")).toContainText(site.institution);
      await expect(page.getByRole("contentinfo")).toContainText(
        site.institution,
      );
      await expect(page).toHaveTitle(new RegExp(site.name));
      if (route !== "/") {
        await expect(
          page.getByRole("navigation", { name: "Breadcrumb" }),
        ).toBeVisible();
      }

      for (const width of [320, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        await expectNoHorizontalScroll(page);
      }
    });
  }
});

test("every route is linked from the header, the footer or its index page", async ({
  page,
}) => {
  const linked = new Set<string>(["/"]);
  for (const start of ["/", "/paths", "/labs"]) {
    await page.goto(start);
    const hrefs = await page
      .locator("header a[href^='/'], footer a[href^='/'], main a[href^='/']")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    for (const href of hrefs) if (href) linked.add(href);
  }
  expect(routes.filter((route) => !linked.has(route))).toEqual([]);
});

test.describe("unknown addresses", () => {
  for (const route of [
    "/nope",
    "/labs/nope",
    "/paths/nope",
    "/hardware/nope",
    "/ai/nope",
  ]) {
    test(`${route} returns 404 with a link home`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(404);
      await expect(
        page.getByRole("heading", { level: 1, name: "Page not found" }),
      ).toBeVisible();
      await page.getByRole("link", { name: "Go to the home page" }).click();
      await expect(page).toHaveURL("/");
    });
  }
});

test.describe("accessibility of /", () => {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`axe finds no violations in the ${colorScheme} theme`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto("/");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe("keyboard", () => {
  test("the skip link is the first stop and moves focus to the content", async ({
    page,
  }) => {
    await page.goto("/labs");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();

    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });

  test("the header navigation reaches every section", async ({ page }) => {
    await page.goto("/");
    for (const item of site.nav) {
      const link = page
        .getByRole("banner")
        .getByRole("link", { name: item.label, exact: true });
      await link.focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(item.href);
      await expect(link).toHaveAttribute("aria-current", "page");
    }
  });
});

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 375, height: 740 } });

  test("traps focus, closes on Escape and closes after navigating", async ({
    page,
  }) => {
    await page.goto("/");
    // Located by attribute: the page behind an open modal is hidden from roles.
    const trigger = page.locator("header button[aria-expanded]");
    await expect(trigger).toHaveAccessibleName("Open menu");
    const menu = page.getByRole("dialog", { name: "Menu" });

    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    // More Tab presses than there are controls: focus must stay in the dialog.
    for (let press = 0; press < site.nav.length + 4; press += 1) {
      await page.keyboard.press("Tab");
      expect(
        await menu.evaluate((dialog) =>
          dialog.contains(document.activeElement),
        ),
      ).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();

    await page.keyboard.press("Enter");
    await menu.getByRole("link", { name: "Labs", exact: true }).click();
    await expect(page).toHaveURL("/labs");
    await expect(menu).toBeHidden();
  });
});

test.describe("theme", () => {
  test("follows the system preference without a flash", async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: "dark",
      javaScriptEnabled: true,
    });
    const page = await context.newPage();
    // Checked at first paint, before hydration could correct a wrong theme.
    await page.goto("/", { waitUntil: "commit" });
    await page.locator("body").waitFor();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await context.close();
  });

  test("the toggle switches theme and the choice survives a reload", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: "Toggle colour theme" }).click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });
});

test.describe("SEO files", () => {
  test("sitemap.xml lists every route", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const route of routes) {
      expect(xml).toContain(`<loc>${new URL(route, site.url)}</loc>`);
    }
  });

  test("robots.txt allows crawling and points to the sitemap", async ({
    request,
  }) => {
    const text = await (await request.get("/robots.txt")).text();
    expect(text).toContain("Allow: /");
    expect(text).toContain(`Sitemap: ${new URL("/sitemap.xml", site.url)}`);
  });
});
