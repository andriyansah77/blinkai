"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import HermesChat from "@/components/dashboard/HermesChat";

export default function ChatPage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/sign-in");
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  // Get command from URL parameter
  const command = searchParams.get('command');

  return (
    <div className="h-full">
      <HermesChat className="h-full" initialCommand={command} />
    </div>
  );
}







