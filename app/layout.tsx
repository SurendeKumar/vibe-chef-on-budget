import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe Chef on a Budget",
  description:
    "Tell us your mood and your budget \u2014 we'll tell you what to eat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
