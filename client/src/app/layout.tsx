import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ShopSmart — Product Manager",
  description: "Manage your product catalog with a modern full-stack application built on Next.js, Express, and PostgreSQL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash on load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('shopsmart-theme');
                  var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  document.documentElement.setAttribute('data-theme', stored || system);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <div className="page-wrapper">
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <footer className="footer">
            <div className="container">
              <p>
                ShopSmart &copy; {new Date().getFullYear()} &mdash; Built by{" "}
                <a target="_blank" rel="noopener noreferrer">
                  <strong>Mayank Sharma ❤️</strong>
                </a>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
