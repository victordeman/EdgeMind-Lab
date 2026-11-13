import { codeToHtml } from "shiki";

/** Light and dark themes with high contrast, so code meets WCAG AA on the site's surfaces. */
export const SHIKI_THEMES = {
  light: "github-light-high-contrast",
  dark: "github-dark-high-contrast",
} as const;

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  ino: "cpp",
  cpp: "cpp",
  h: "cpp",
  py: "python",
  sh: "bash",
  json: "json",
};

/** Shiki language for a file name. Unknown types, including G-code, render as plain text. */
export function languageForFile(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return LANGUAGE_BY_EXTENSION[extension] ?? "text";
}

/** Highlighted HTML at build time. Colours come from CSS variables so one output serves both themes. */
export function highlightCode(code: string, lang: string): Promise<string> {
  return codeToHtml(code, {
    lang,
    themes: SHIKI_THEMES,
    defaultColor: false,
  });
}
