"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Plus, Play, Pause, Settings, Clock, CheckCircle, AlertCircle, Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";

interface HermesCronJob {
  id: string;
  name: string;
  description?: string;
  schedule: string;
  prompt: string;
  status: "active" | "paused" | "error";
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  runCount?: number;
  skills?: string[];
}

export default function JobsPage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [jobs, setJobs] = useState<HermesCronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJob, setNewJob] = useState({
    name: "",
    schedule: "",
    prompt: "",
    skills: [] as string[]
  });

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/sign-in");
    } else if (authenticated) {
      fetchCronJobs();
    }
  }, [ready, authenticated, router]);

  const fetchCronJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/hermes/cron");
      
      if (response.ok) {
        const data = await response.json();
        const cronJobs: HermesCronJob[] = (data.cronJobs || []).map((job: any) => ({
          id: job.id,
          name: job.name,
          description: job.description || `Automated task: ${job.prompt.substring(0, 50)}...`,
          schedule: job.schedule,
          prompt: job.prompt,
          status: job.enabled ? "active" : "paused",
          enabled: job.enabled,
          lastRun: job.lastRun || "Never",
          nextRun: job.nextRun || calculateNextRun(job.schedule),
          runCount: job.runCount || 0,
          skills: job.skills || []
        }));
        setJobs(cronJobs);
      } else {
        console.error("Failed to fetch cron jobs");
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching cron jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextRun = (schedule: string): string => {
    // Simple next run calculation - in production this would be more sophisticated
    try {
      if (schedule.includes("* * * * *")) return "Every minute";
      if (schedule.includes("0 * * * *")) return "Next hour";
      if (schedule.includes("0 0 * * *")) return "Tomorrow";
      if (schedule.includes("0 0 * * 0")) return "Next Sunday";
      return "Calculated based on schedule";
    } catch {
      return "Unknown";
    }
  };

  const createCronJob = async () => {
    try {
      const response = await fetch("/api/hermes/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...newJob
        })
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewJob({ name: "", schedule: "", prompt: "", skills: [] });
        fetchCronJobs();
      } else {
        console.error("Failed to create cron job");
      }
    } catch (error) {
      console.error("Error creating cron job:", error);
    }
  };

  const toggleJob = async (jobId: string, enabled: boolean) => {
    try {
      const response = await fetch("/api/hermes/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: enabled ? "enable" : "disable",
          jobId
        })
      });

      if (response.ok) {
        fetchCronJobs();
      }
    } catch (error) {
      console.error("Error toggling job:", error);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const response = await fetch("/api/hermes/cron", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });

      if (response.ok) {
        fetchCronJobs();
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  if (!ready || loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!authenticated) {
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
    <div className="h-screen bg-background text-foreground overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Calendar className="w-6 h-6 text-purple-400" />
              Hermes Scheduled Jobs
            </h1>
            <p className="text-muted-foreground mt-1">Manage automated Hermes tasks and cron jobs</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-foreground font-medium transition-colors"
          >
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
              className="bg-card border border-border rounded-xl p-4"
            >
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
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
              className="bg-card border border-border rounded-xl p-6 hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground">{job.name}</h3>
                      <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded">
                        Hermes Cron
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{job.description}</p>
                    <div className="text-xs text-muted-foreground mb-2">
                      <span className="font-mono bg-accent px-2 py-1 rounded mr-2">
                        {job.schedule}
                      </span>
                      <span>Prompt: {job.prompt.substring(0, 60)}...</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                      <span>Last run: {job.lastRun}</span>
                      <span>Next run: {job.nextRun}</span>
                      <span>Runs: {job.runCount || 0}</span>
                      {job.skills && job.skills.length > 0 && (
                        <span>Skills: {job.skills.join(", ")}</span>
                      )}
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
                    <button 
                      onClick={() => toggleJob(job.id, !job.enabled)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={job.enabled ? "Pause job" : "Resume job"}
                    >
                      {job.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteJob(job.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                      title="Delete job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Hermes cron jobs</h3>
            <p className="text-muted-foreground text-sm mb-6">Create your first automated task to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-foreground px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create First Job
            </button>
          </div>
        )}

        {/* Create Job Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-foreground font-semibold text-lg mb-4">Create Hermes Cron Job</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">Job Name</label>
                  <input
                    type="text"
                    value={newJob.name}
                    onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                    className="w-full bg-white/[0.05] border border-border rounded-lg px-3 py-2 text-foreground"
                    placeholder="Daily report generation"
                  />
                </div>
                
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">Schedule (Cron)</label>
                  <input
                    type="text"
                    value={newJob.schedule}
                    onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })}
                    className="w-full bg-white/[0.05] border border-border rounded-lg px-3 py-2 text-foreground font-mono"
                    placeholder="0 9 * * *"
                  />
                  <p className="text-muted-foreground text-xs mt-1">Example: "0 9 * * *" = Daily at 9 AM</p>
                </div>
                
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">Prompt</label>
                  <textarea
                    value={newJob.prompt}
                    onChange={(e) => setNewJob({ ...newJob, prompt: e.target.value })}
                    className="w-full bg-white/[0.05] border border-border rounded-lg px-3 py-2 text-foreground h-24 resize-none"
                    placeholder="Generate a daily report of system status and send it to the admin channel"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={createCronJob}
                  disabled={!newJob.name || !newJob.schedule || !newJob.prompt}
                  className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-accent disabled:text-muted-foreground text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Job
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-accent hover:bg-accent/90 text-foreground rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}







