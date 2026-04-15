"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HermesSidebar from "@/components/dashboard/HermesSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [credits, setCredits] = useState<number>(10000);

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
      <HermesSidebar credits={credits} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}






