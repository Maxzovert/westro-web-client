"use client";

import type { ReactNode } from "react";

/**
 * Layout chrome now lives in `app/app-shell.tsx` so the root layout only mounts
 * one client boundary. Kept as a thin pass-through for any page-level imports.
 */
export function StoreLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
