"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Plus, Play, Pause, Settings, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  status: "active" | "paused" | "error";
  lastRun: string;
  nextRun: string;
  runCount: number;
  type: string;
}

const MOCK_JOBS: ScheduledJob[] = [
  {
    id: "1",
    name: "Daily Report",
    description: "Generate and send daily analytics report",
    schedule: "0 9 * * *",
    status: "active",
    lastRun: "Today at 9:00 AM",
    nextRun: "Tomorrow at 9:00 AM",
    runCount: 45,
    type: "Report",
  },
  {
    id: "2",
    name: "Backup Messages",
    description: "Backup conversation history to storage",
    schedule: "0 2 * * 0",
    status: "active",
    lastRun: "Sunday at 2:00 AM",
    nextRun: "Next Sunday at 2:00 AM",
    runCount: 12,
    type: "Backup",
  },
  {
    id: "3",
    name: "Clean Temp Files",
    description: "Remove temporary files and cache",
    schedule: "0 1 * * *",
    status: "paused",
    lastRun: "2 days ago",
    nextRun: "Paused",
    runCount: 89,
    type: "Maintenance",
  },
  {
    id: "4",
    name: "Health Check",
    description: "Monitor system health and send alerts",
    schedule: "*/15 * * * *",
    status: "error",
    lastRun: "15 minutes ago (failed)",
    nextRun: "In 15 minutes",
    runCount: 2880,
    type: "Monitoring",
  },
];

export default function JobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<ScheduledJob[]>(MOCK_JOBS);

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
      case "paused":
        return <Pause className="w-4 h-4 text-yellow-400" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-400/10";
      case "paused":
        return "text-yellow-400 bg-yellow-400/10";
      case "error":
        return "text-red-400 bg-red-400/10";
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
              <Calendar className="w-6 h-6 text-purple-400" />
              Scheduled Jobs
            </h1>
            <p className="text-white/60 mt-1">Manage automated tasks and schedules</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create Job
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Jobs", value: jobs.length, color: "blue" },
            { label: "Active", value: jobs.filter(j => j.status === "active").length, color: "green" },
            { label: "Paused", value: jobs.filter(j => j.status === "paused").length, color: "yellow" },
            { label: "Errors", value: jobs.filter(j => j.status === "error").length, color: "red" },
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

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white/60" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white">{job.name}</h3>
                      <span className="text-xs text-white/40 bg-white/[0.06] px-2 py-1 rounded">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm mb-2">{job.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-white/40">
                      <span>Schedule: {job.schedule}</span>
                      <span>Last run: {job.lastRun}</span>
                      <span>Next run: {job.nextRun}</span>
                      <span>Runs: {job.runCount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-white/40 hover:text-white transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="text-white/40 hover:text-white transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/60 mb-2">No scheduled jobs</h3>
            <p className="text-white/40 text-sm">Create your first scheduled job to automate tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}