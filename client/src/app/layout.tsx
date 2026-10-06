import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import TokenSync from "@/components/providers/TokenSync";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MealSync — IIITDM Kancheepuram Mess Management",
  description: "Smart mess management platform for IIITDM Kancheepuram. View menus, rate meals, submit feedback, and manage your hostel dining experience.",
  keywords: ["IIITDM", "mess management", "hostel", "food", "menu", "Kancheepuram"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            <TokenSync />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
