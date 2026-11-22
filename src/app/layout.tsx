import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import AppShell from "./app-shell";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wastro",
  description: "Premium medical apparel for professionals. Medical Apparel | Equipment | More.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.variable}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
