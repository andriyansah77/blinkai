"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  History,
  ExternalLink,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Inscription {
  id: string;
  createdAt: string;
  type: "auto" | "manual";
  tokensEarned: number;
  feeUsd: number;
  gasUsed: number;
  status: "pending" | "confirmed" | "failed";
  txHash: string | null;
}

interface InscriptionsResponse {
  success: boolean;
  inscriptions: Inscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    label: "Pending",
  },
  confirmed: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    label: "Confirmed",
  },
  failed: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "Failed",
  },
};

export function MintingHistory() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const limit = 10;

  useEffect(() => {
    fetchInscriptions();
  }, [page, statusFilter]);

  const fetchInscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/mining/inscriptions?${params}`);
      if (response.ok) {
        const data: InscriptionsResponse = await response.json();
        setInscriptions(data.inscriptions);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch inscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatAmount = (amount: number | undefined | null) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0';
    return amount.toLocaleString();
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1); // Reset to first page when filter changes
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-foreground font-semibold text-lg">Minting History</h2>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="bg-accent border border-border text-foreground text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : inscriptions.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <History className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-sm">No minting records found</p>
          <p className="text-muted-foreground text-xs mt-1">
            {statusFilter !== "all" 
              ? "Try changing the filter or mint your first tokens"
              : "Start minting to see your history here"}
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted-foreground text-xs font-medium uppercase tracking-wider py-3 px-4">
                    Date
                  </th>
                  <th className="text-left text-muted-foreground text-xs font-medium uppercase tracking-wider py-3 px-4">
                    Type
                  </th>
                  <th className="text-right text-muted-foreground text-xs font-medium uppercase tracking-wider py-3 px-4">
                    Amount
                  </th>
                  <th className="text-right text-muted-foreground text-xs font-medium uppercase tracking-wider py-3 px-4">
                    Fee
                  </th>
                  <th className="text-right text-muted-foreground text-xs font-medium uppercase tracking-wider py-3 px-4">
                    Gas
                  </th>
                  <th className="text-center text-muted-foreground text-xs font-medium uppercase tracking-wider py-3 px-4">
                    Status
                  </th>
                  <th className="text-center text-muted-foreground text-xs font-medium uppercase tracking-wider py-3 px-4">
                    Tx Hash
                  </th>
                </tr>
              </thead>
              <tbody>
                {inscriptions.map((inscription, index) => {
                  const statusConfig = STATUS_CONFIG[inscription.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusConfig?.icon || Clock;

                  return (
                    <tr
                      key={inscription.id}
                      className={cn(
                        "border-b border-border hover:bg-accent/50 transition-colors",
                        index === inscriptions.length - 1 && "border-b-0"
                      )}
                    >
                      {/* Date */}
                      <td className="py-4 px-4">
                        <p className="text-foreground text-sm">
                          {formatDate(inscription.createdAt)}
                        </p>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                            inscription.type === "auto"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                              : "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                          )}
                        >
                          {inscription.type === "auto" ? "Auto" : "Manual"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 text-right">
                        <p className="text-foreground text-sm font-medium">
                          {formatAmount(inscription.tokensEarned)} REAGENT
                        </p>
                      </td>

                      {/* Fee */}
                      <td className="py-4 px-4 text-right">
                        <p className="text-muted-foreground text-sm">
                          ${typeof inscription.feeUsd === 'number' ? inscription.feeUsd.toFixed(2) : '0.00'}
                        </p>
                      </td>

                      {/* Gas */}
                      <td className="py-4 px-4 text-right">
                        <p className="text-muted-foreground text-sm">
                          {typeof inscription.gasUsed === 'number' ? inscription.gasUsed.toFixed(6) : '0.000000'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                              statusConfig.bg,
                              statusConfig.color,
                              statusConfig.border
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                      </td>

                      {/* Tx Hash */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center">
                          {inscription.txHash ? (
                            <a
                              href={`https://explore.tempo.xyz/tx/${inscription.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm transition-colors"
                            >
                              <span className="font-mono">
                                {inscription.txHash.slice(0, 6)}...{inscription.txHash.slice(-4)}
                              </span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-muted-foreground text-sm">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed text-foreground text-sm rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed text-foreground text-sm rounded-lg transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
