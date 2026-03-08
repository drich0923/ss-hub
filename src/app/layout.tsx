import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Systemized Sales — Internal Portal",
  description: "Internal app launcher for Systemized Sales",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
