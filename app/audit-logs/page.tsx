// app/audit-logs/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs, fetchAuditLogActions } from "@/lib/api";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
  Activity,
  User,
  Shield,
  Info,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  X,
  RefreshCw,
  ChevronDown,
  FileText,
  Users,
  Settings,
  LogIn,
  LogOut,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  complaintId?: string;
  changes?: any;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 20;

  // Fetch audit logs with filters
  const {
    data: logsData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [
      "audit-logs",
      {
        page: currentPage,
        limit,
        action: selectedAction,
        entityType: selectedEntity,
        startDate,
        endDate,
      },
    ],
    queryFn: () =>
      fetchAuditLogs({
        page: currentPage,
        limit,
        action: selectedAction || undefined,
        entityType: selectedEntity || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  // Fetch available actions for filter dropdown
  const { data: actions = [] } = useQuery({
    queryKey: ["audit-log-actions"],
    queryFn: fetchAuditLogActions,
  });

  const logs = logsData?.data || [];
  const pagination = logsData?.pagination || {
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  };

  // Enhanced Styling Logic with better visibility
  const getActionConfig = (action: string) => {
    const actionLower = action.toLowerCase();
    if (
      actionLower.includes("reject") ||
      actionLower.includes("delete") ||
      actionLower.includes("deactivate")
    ) {
      return {
        style: "bg-red-100 text-red-800 border-red-200",
        icon: <XCircle className="w-3 h-3" />,
        priority: "CRITICAL",
        label: "Critical",
      };
    }
    if (
      actionLower.includes("verify") ||
      actionLower.includes("resolve") ||
      actionLower.includes("approve")
    ) {
      return {
        style: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: <CheckCircle2 className="w-3 h-3" />,
        priority: "IMPORTANT",
        label: "Important",
      };
    }
    if (actionLower.includes("create") || actionLower.includes("update")) {
      return {
        style: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Info className="w-3 h-3" />,
        priority: "MODERATE",
        label: "Moderate",
      };
    }
    if (actionLower.includes("login") || actionLower.includes("logout")) {
      return {
        style: "bg-slate-100 text-slate-700 border-slate-200",
        icon: <User className="w-3 h-3" />,
        priority: "ROUTINE",
        label: "Routine",
      };
    }
    return {
      style: "bg-gray-100 text-gray-700 border-gray-200",
      icon: <Info className="w-3 h-3" />,
      priority: "ROUTINE",
      label: "Routine",
    };
  };

  // Get icon for entity type
  const getEntityIcon = (entityType: string) => {
    const type = entityType.toLowerCase();
    if (type.includes("complaint")) return <FileText className="w-3.5 h-3.5" />;
    if (type.includes("user")) return <Users className="w-3.5 h-3.5" />;
    if (type.includes("setting")) return <Settings className="w-3.5 h-3.5" />;
    return <FileText className="w-3.5 h-3.5" />;
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedAction("");
    setSelectedEntity("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="text-gray-500 font-medium">Loading audit logs...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Security & Oversight
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              System Audit
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              A complete ledger of every critical moderation and administrative
              action.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white shadow-sm border border-gray-100 rounded-2xl">
              <p className="text-[10px] uppercase font-black text-gray-400">
                Total Events
              </p>
              <p className="text-xl sm:text-2xl font-black text-green-600">
                {pagination.total || 0}
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="secondary"
              className="flex items-center gap-2"
              disabled={isFetching}
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-4 border-0 shadow-md">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search logs by action or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <Button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white rounded-xl px-6"
              >
                Search
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-xl"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </Button>
              {(selectedAction || selectedEntity || startDate || endDate) && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 rounded-xl text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              )}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Action Type
                  </label>
                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-sm"
                  >
                    <option value="">All Actions</option>
                    {actions.map((action: string) => (
                      <option key={action} value={action}>
                        {formatAction(action)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Entity Type
                  </label>
                  <select
                    value={selectedEntity}
                    onChange={(e) => setSelectedEntity(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-sm"
                  >
                    <option value="">All Entities</option>
                    <option value="COMPLAINT">Complaint</option>
                    <option value="USER">User</option>
                    <option value="SUGGESTION">Suggestion</option>
                    <option value="SETTINGS">Settings</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-700 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            )}
          </form>
        </Card>

        {/* Audit Logs Table */}
        <Card className="overflow-hidden border-0 shadow-lg rounded-2xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">
                    Actor
                  </th>
                  <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">
                    Action
                  </th>
                  <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider hidden md:table-cell">
                    Entity
                  </th>
                  <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">
                    Details
                  </th>
                  <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider text-right">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">
                        No audit logs found
                      </p>
                      <p className="text-sm text-gray-400">
                        Try adjusting your filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log: AuditLog) => {
                    const config = getActionConfig(log.action);
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50/40 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-bold text-xs border border-green-100 flex-shrink-0">
                              {log.user?.name?.charAt(0) || "S"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {log.user?.name || "System"}
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter truncate">
                                {log.user?.role || "AUTO-WORKFLOW"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={`${config.style} flex items-center gap-1.5 py-1 px-2.5 rounded-lg border text-[10px] font-bold whitespace-nowrap`}
                          >
                            {config.icon}
                            <span className="text-gray-900">
                              {formatAction(log.action)}
                            </span>
                          </Badge>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-xs">
                            {getEntityIcon(log.entityType)}
                            <span className="font-medium text-gray-700">
                              {log.entityType}
                            </span>
                            <span className="text-gray-400 text-[10px] font-mono">
                              #{log.entityId?.slice(-6) || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs">
                            {log.changes?.details || log.changes?.message ? (
                              <p className="text-xs text-gray-700 leading-relaxed truncate">
                                {log.changes?.details || log.changes?.message}
                              </p>
                            ) : (
                              <span className="text-gray-400 text-[10px]">
                                No additional notes
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-gray-500 whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">
                              {format(
                                new Date(log.createdAt),
                                "MMM dd • HH:mm",
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl px-3 py-1.5 text-sm"
                >
                  Previous
                </Button>
                <span className="text-sm font-medium text-gray-700 px-3">
                  Page {currentPage} of {pagination.pages}
                </span>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setCurrentPage(Math.min(pagination.pages, currentPage + 1))
                  }
                  disabled={currentPage === pagination.pages}
                  className="rounded-xl px-3 py-1.5 text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
