import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dhaka Tesla Pool — Share a seat. Split the fare.",
  description: "Survive Dhaka traffic with smart, shared electric Tesla rides.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
