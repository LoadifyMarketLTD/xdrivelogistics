import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XDrive Logistics - UK Dedicated Transport Services",
  description: "Professional transport services across the UK. Request a quote for your logistics needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
