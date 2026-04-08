"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Terminal as TerminalIcon, Play, Square, Trash2, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface TerminalLine {
  id: string;
  type: "command" | "output" | "error";
  content: string;
  timestamp: Date;
}

export default function TerminalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lines, setLines] = useState<Term