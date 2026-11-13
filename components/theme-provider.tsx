"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/** Follows the system colour scheme until the visitor picks a theme. */
export function ThemeProvider(
  props: ComponentProps<typeof NextThemesProvider>,
) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    />
  );
}
