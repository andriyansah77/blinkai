"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HermesSidebar from "@/components/dashboard/HermesSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credits, setCredits] = useState<number>(10000);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCredits();
    }
  }, [status]);

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

  if (status === "loading") {
    return (
      <div className="h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      <HermesSidebar credits={credits} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}