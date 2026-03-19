import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ShopSmart — Modern Product Manager",
  description: "Manage your products with a beautiful Next.js + Express + PostgreSQL stack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="page-wrapper">
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <footer className="footer">
            <div className="container">
              <p>
                ShopSmart &copy; {new Date().getFullYear()} &mdash; Built with{" "}
                <strong style={{ color: "var(--accent-light)" }}>Next.js</strong>,{" "}
                <strong style={{ color: "var(--accent-light)" }}>Express</strong> &amp;{" "}
                <strong style={{ color: "var(--accent-light)" }}>PostgreSQL</strong>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
