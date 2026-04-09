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
  title: "ReAgent — Deploy your Agent in Minutes",
  description:
    "Build, deploy, and scale AI agents with ReAgent. Create intelligent agents that learn, remember, and improve over time.",
  keywords: ["AI", "agent deployment", "AI agents", "deploy AI", "Hermes", "ReAgent"],
  authors: [{ name: "ReAgent" }],
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "ReAgent — Deploy your Agent in Minutes",
    description:
      "Build, deploy, and scale AI agents with ReAgent. Create intelligent agents that learn, remember, and improve over time.",
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
            defaultTheme="light"
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
