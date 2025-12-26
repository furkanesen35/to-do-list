import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Office Todo List",
  description: "Track progress and manage tasks for your office team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
