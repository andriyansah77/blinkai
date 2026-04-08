import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/shared/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HermesAI — Deploy Your AI Agents in Seconds",
  description:
    "Build, deploy, and scale AI agents with HermesAI. Give your users the power of AI — with your branding, your rules.",
  keywords: ["AI", "agent hosting", "AI agents", "deploy AI", "BYOK", "HermesAI"],
  authors: [{ name: "HermesAI" }],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "HermesAI — Deploy Your AI Agents in Seconds",
    description:
      "Build, deploy, and scale AI agents with HermesAI. Give your users the power of AI — with your branding, your rules.",
    type: "website",
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
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "hsl(var(--card))",
                  color: "hsl(var(--card-foreground))",
                  border: "1px solid hsl(var(--border))",
                },
                success: {
                  iconTheme: {
                    primary: "#f59e0b",
                    secondary: "black",
                  },
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
