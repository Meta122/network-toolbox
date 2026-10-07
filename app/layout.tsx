import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Network Toolbox",
  applicationName: "Network Toolbox",
  appleWebApp: { capable: true, title: "Network Toolbox", statusBarStyle: "default" },
  description: "Comprendre sa connexion et diagnostiquer ses services distants.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#1768e8" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head><link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
