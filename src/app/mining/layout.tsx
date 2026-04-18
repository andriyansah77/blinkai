"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HermesSidebar from "@/components/dashboard/HermesSidebar";
import { Menu, X } from "lucide-react";

interface MiningLayoutProps {
  children: React.ReactNode;
}

export default function MiningLayout({ children }: MiningLayoutProps) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [credits, setCredits] = useState<number>(10000);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/sign-in");
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (authenticated) {
      fetchCredits();
    }
  }, [authenticated]);

  async function fetchCredits() {
    try {
      const res = await fetch("/api/user/credits");
      if (!res.ok) return;
      const data = await res.json();
      setCredits(data.balance || 10000);
    } catch {
      // ignore
    }
  }

  if (!ready) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-foreground" />
        ) : (
          <Menu className="w-5 h-5 text-foreground" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: always visible, Mobile: slide in */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <HermesSidebar 
          credits={credits} 
          onNavigate={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden w-full">
        {children}
      </main>
    </div>
  );
}
