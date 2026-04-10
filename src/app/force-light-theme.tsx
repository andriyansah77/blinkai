"use client";

import { useEffect } from "react";

export function ForceLightTheme() {
  useEffect(() => {
    // Force light theme on mount
    if (typeof window !== "undefined") {
      // Remove any stored theme preference
      localStorage.removeItem("theme");
      
      // Force light mode
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      
      console.log("🎨 Theme forced to LIGHT mode");
    }
  }, []);

  return null;
}
