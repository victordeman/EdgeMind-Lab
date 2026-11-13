import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const css = readFileSync("app/globals.css", "utf8");

function tokens(selector: string): Record<string, string> {
  const block = new RegExp(`${selector}\\s*\\{([^}]*)\\}`).exec(css);
  if (!block) throw new Error(`No ${selector} block in app/globals.css`);
  return Object.fromEntries(
    [...block[1].matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/g)].map(
      ([, name, value]) => [name, value],
    ),
  );
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 contrast ratio between two colours. */
function contrast(first: string, second: string): number {
  const [light, dark] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a,
  );
  return (light + 0.05) / (dark + 0.05);
}

const SURFACES = ["background", "card", "popover", "muted", "accent"];

// [foreground token, background tokens] pairs used for text: at least 4.5:1.
const TEXT_PAIRS: [string, string[]][] = [
  ["foreground", SURFACES],
  ["muted-foreground", SURFACES],
  ["brand", SURFACES],
  ["destructive", ["background", "card"]],
  ["primary-foreground", ["primary"]],
  ["secondary-foreground", ["secondary"]],
  ["accent-foreground", ["accent"]],
  ["brand-foreground", ["brand"]],
];

// Control boundaries and focus indicators: at least 3:1.
const UI_PAIRS: [string, string[]][] = [
  ["input", SURFACES],
  ["ring", SURFACES],
];

describe.each([
  ["light", tokens(":root")],
  ["dark", tokens("\\.dark")],
])("%s theme colour contrast (WCAG 2.1 AA)", (_theme, theme) => {
  it("defines every colour token used by the checks", () => {
    const used = [...TEXT_PAIRS, ...UI_PAIRS].flatMap(([token, surfaces]) => [
      token,
      ...surfaces,
    ]);
    expect(used.filter((token) => !theme[token])).toEqual([]);
  });

  it.each(
    TEXT_PAIRS.flatMap(([token, surfaces]) =>
      surfaces.map((surface) => [token, surface]),
    ),
  )("text %s on %s is at least 4.5:1", (token, surface) => {
    expect(contrast(theme[token], theme[surface])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(
    UI_PAIRS.flatMap(([token, surfaces]) =>
      surfaces.map((surface) => [token, surface]),
    ),
  )("UI colour %s on %s is at least 3:1", (token, surface) => {
    expect(contrast(theme[token], theme[surface])).toBeGreaterThanOrEqual(3);
  });
});
