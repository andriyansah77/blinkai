"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Workflow, Plus, Settings, Zap, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Feature {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "pending";
  category: string;
  lastUsed: string;
  usageCount: number;
}

const MOCK_FEATURES: Feature[] = [
  {
    id: "1",
    name: "Auto Response",
    description: "Automatically respond to common queries",
    status: "active",
    category: "Automation",
    lastUsed: "2 hours ago",
    usageCount: 156,
  },
  {
    id: "2",
    name: "Sentiment Analysis",
    description: "Analyze message sentiment and tone",
    status: "active",
    category: "Analytics",
    lastUsed: "1 day ago",
    usageCount: 89,
  },
  {
    id: "3",
    name: "Language Detection",
    description: "Detect and translate multiple languages",
    status: "inactive",
    category: "Language",
    lastUsed: "1 week ago",
    usageCount: 23,
  },
  {
    id: "4",
    name: "Smart Routing",
    description: "Route messages to appropriate handlers",
    status: "pending",
    category: "Routing",
    lastUsed: "Never",
    usageCount: 0,
  },
];

export default function FeaturesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [features, setFeatures] = useState<Feature[]>(MOCK_FEATURES);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-400/10";
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  return (
    <div className="h-screen bg-[#0A0A0A] text-white overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Workflow className="w-6 h-6 text-green-400" />
              Features
            </h1>
            <p className="text-white/60 mt-1">Manage AI agent features and capabilities</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Feature
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Features", value: features.length, color: "blue" },
            { label: "Active", value: features.filter(f => f.status === "active").length, color: "green" },
            { label: "Pending", value: features.filter(f => f.status === "pending").length, color: "yellow" },
            { label: "Total Usage", value: features.reduce((sum, f) => sum + f.usageCount, 0), color: "purple" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4"
            >
              <p className="text-white/60 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Features List */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white/60" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white">{feature.name}</h3>
                      <span className="text-xs text-white/40 bg-white/[0.06] px-2 py-1 rounded">
                        {feature.category}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm mb-2">{feature.description}</p>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span>Used {feature.usageCount} times</span>
                      <span>Last used: {feature.lastUsed}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(feature.status)}
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(feature.status)}`}>
                      {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                    </span>
                  </div>
                  <button className="text-white/40 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {features.length === 0 && (
          <div className="text-center py-12">
            <Workflow className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/60 mb-2">No features configured</h3>
            <p className="text-white/40 text-sm">Add your first feature to enhance your AI agent</p>
          </div>
        )}
      </div>
    </div>
  );
}