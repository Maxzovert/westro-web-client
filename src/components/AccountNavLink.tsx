"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";

export function AccountNavLink() {
  const { user, loading } = useAuth();

  if (loading) {
    return <span className="nav-muted">Account</span>;
  }

  return (
    <Link href="/account">{user ? user.name.split(" ")[0] || "Account" : "Account"}</Link>
  );
}
