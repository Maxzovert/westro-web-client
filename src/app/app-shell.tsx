"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AccountNavLink } from "@/components/AccountNavLink";
import { BrandMark } from "@/components/BrandMark";
import { CartNavLink } from "@/components/CartNavLink";
import { AuthProvider } from "@/features/auth/AuthContext";
import { CartProvider } from "@/features/cart/CartContext";
import { api } from "@/lib/api";

function ShellChrome({ children }: { children: ReactNode }) {
  return (
    <div className="store-shell">
      <header className="store-header">
        <Link href="/" className="store-brand" aria-label="Wastro home">
          <BrandMark size={36} variant="brand" />
          <span className="store-brand-name">Wastro</span>
        </Link>

        <nav className="store-nav" aria-label="Primary">
          <Link href="/shop">Shop</Link>
          <Link href="/categories">Categories</Link>
          <AccountNavLink />
          <CartNavLink />
        </nav>
      </header>

      <main className="store-main">{children}</main>

      <footer className="store-footer">
        <p className="store-footer-brand">Wastro</p>
        <p className="store-footer-descriptor">Medical Apparel | Equipment | More</p>
      </footer>
    </div>
  );
}

function ComingSoonScreen() {
  return (
    <div className="coming-soon" role="img" aria-label="Wastro — Coming soon. A brand of Wastro Group.">
      <img src="/coming-soon.png" alt="Wastro — Coming soon. A brand of Wastro Group." />
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);

  const refreshMaintenance = useCallback(async () => {
    try {
      const meta = await api.getStoreMeta();
      setMaintenanceMode(Boolean(meta.features.maintenanceMode));
    } catch {
      // Fail closed so visitors never briefly see a half-ready shop.
      setMaintenanceMode(true);
    }
  }, []);

  useEffect(() => {
    // Clear stale service workers that can serve broken webpack chunks.
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          void registration.unregister();
        }
      });
    }
  }, []);

  useEffect(() => {
    void refreshMaintenance();
    const timer = window.setInterval(() => {
      void refreshMaintenance();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [refreshMaintenance]);

  if (maintenanceMode === null) {
    return <div className="coming-soon coming-soon-loading" aria-busy="true" />;
  }

  if (maintenanceMode) {
    return <ComingSoonScreen />;
  }

  return (
    <CartProvider>
      <AuthProvider>
        <ShellChrome>{children}</ShellChrome>
      </AuthProvider>
    </CartProvider>
  );
}
