"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps & any) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={disableTransitionOnChange}
      storageKey="theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
