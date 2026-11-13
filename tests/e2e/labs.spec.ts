import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { getLab, getLabs } from "@/lib/content";

const labs = getLabs();
const planned = labs.filter((lab) => lab.status === "planned");
const written = labs.filter((lab) => lab.status !== "planned");
const labLinks = "main a[href^='/labs/']";

test.describe("lab index filters", () => {
  test("filters live in the URL and survive a reload", async ({ page }) => {
    await page.goto("/labs?hardware=arduino&difficulty=beginner");
    const group = page.getByRole("group", { name: "Hardware" });
    await expect(
      group.getByRole("checkbox", { name: "Arduino" }),
    ).toBeChecked();
    await expect(
      page.getByRole("group", { name: "Difficulty" }).getByRole("checkbox", {
        name: "Beginner",
      }),
    ).toBeChecked();

    const expected = labs.filter(
      (lab) =>
        lab.hardware.includes("arduino") && lab.difficulty === "beginner",
    );
    expect(expected.length).toBeGreaterThan(0);
    for (const lab of expected) {
      await expect(
        page.locator(`${labLinks}`).filter({ hasText: lab.title }).first(),
      ).toBeVisible();
    }
    for (const lab of labs.filter((item) => !expected.includes(item))) {
      await expect(
        page.locator(labLinks).filter({ hasText: lab.title }),
      ).toHaveCount(0);
    }

    await page.reload();
    await expect(
      group.getByRole("checkbox", { name: "Arduino" }),
    ).toBeChecked();
    expect(new URL(page.url()).search).toContain("hardware=arduino");
  });

  test("ticking a box updates the address", async ({ page }) => {
    await page.goto("/labs");
    await page
      .getByRole("group", { name: "Hardware" })
      .getByText("Arduino", { exact: true })
      .click();
    await expect(page).toHaveURL(/hardware=arduino/);
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });
    test("shows the full list", async ({ page }) => {
      await page.goto("/labs");
      for (const lab of labs) {
        await expect(
          page.locator(labLinks).filter({ hasText: lab.title }).first(),
        ).toBeVisible();
      }
    });
  });
});

test.describe("lab pages", () => {
  test("planned labs say Coming soon and have no previous or next link", async ({
    page,
  }) => {
    expect(planned.length).toBeGreaterThan(0);
    await page.goto(`/labs/${planned[0].slug}`);
    await expect(page.getByText("Coming soon").first()).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: /next|previous/i }),
    ).toHaveCount(0);
  });

  for (const lab of written) {
    test(`${lab.slug}: one H1, ordered headings, draft notice`, async ({
      page,
    }) => {
      await page.goto(`/labs/${lab.slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      if (lab.status === "draft") {
        await expect(
          page.getByText("Not yet bench-verified").first(),
        ).toBeVisible();
      }
      const levels = await page
        .locator("main h1, main h2, main h3, main h4")
        .evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
      for (let i = 1; i < levels.length; i += 1) {
        expect(
          levels[i] - levels[i - 1],
          `heading order on ${lab.slug}`,
        ).toBeLessThanOrEqual(1);
      }
    });
  }

  test("code files are shown from public/ and can be downloaded", async ({
    page,
  }) => {
    const lab = getLab("arduino-blink")!;
    const download = lab.downloads[0];
    await page.goto(`/labs/${lab.slug}`);
    await expect(
      page.locator(`a[href="${download.file}"][download]`).first(),
    ).toBeVisible();
    await expect(page.locator("pre").first()).toContainText("LED_BUILTIN");
  });
});

test.describe("accessibility of lab pages", () => {
  for (const colorScheme of ["light", "dark"] as const) {
    for (const slug of ["arduino-blink", "rpi-gpio-python"]) {
      test(`${slug} has no serious axe violations (${colorScheme})`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(`/labs/${slug}`);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        const blocking = results.violations.filter((v) =>
          ["serious", "critical"].includes(v.impact ?? ""),
        );
        expect(blocking).toEqual([]);
      });
    }
  }
});
