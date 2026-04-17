"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  Users,
  FlaskConical,
  Globe,
  BarChart3,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Check,
  X,
  ShieldAlert,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = "russellcolevop@gmail.com";

type Tab = "users" | "venture" | "claims" | "stats";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
  { id: "venture", label: "Venture Studio", icon: <FlaskConical className="w-4 h-4" /> },
  { id: "claims", label: "Ecosystem Claims", icon: <Globe className="w-4 h-4" /> },
  { id: "stats", label: "Platform Stats", icon: <BarChart3 className="w-4 h-4" /> },
];

type Persona = "founder" | "investor" | "advisor" | "ecosystem_manager" | string;

const PERSONA_FILTER: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "founder", label: "Founders" },
  { value: "investor", label: "Investors" },
  { value: "advisor", label: "Advisors" },
  { value: "ecosystem_manager", label: "Ecosystem Managers" },
];

type SubmissionStatus = "new" | "under_review" | "approved" | "declined";

const SUBMISSION_STATUSES: { value: SubmissionStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  persona: Persona | null;
  location: string | null;
  created_at: string;
  admin_notes: string | null;
  blocked: boolean | null;
  [key: string]: unknown;
}

interface VentureSubmission {
  id: string;
  name: string;
  pitch: string;
  description: string;
  sector: string;
  problem: string;
  customers: string;
  founder_name: string;
  founder_email: string;
  goals: string | null;
  needs: string | null;
  geography: string | null;
  status: SubmissionStatus;
  created_at: string;
}

interface EcoActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysAgo(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function personaBadgeClass(persona: Persona | null) {
  switch (persona) {
    case "founder":
      return "bg-brand-100 text-brand-700";
    case "investor":
      return "bg-blue-100 text-blue-700";
    case "advisor":
      return "bg-purple-100 text-purple-700";
    case "ecosystem_manager":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function personaLabel(persona: Persona | null) {
  switch (persona) {
    case "founder": return "Founder";
    case "investor": return "Investor";
    case "advisor": return "Advisor";
    case "ecosystem_manager": return "Ecosystem Manager";
    default: return persona ?? "—";
  }
}

function initials(name: string | null, email: string | null) {
  const src = name || email || "?";
  return src
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium">
      <span>{message}</span>
      <button onClick={onDismiss} className="hover:text-gray-300 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ toast }: { toast: (msg: string) => void }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [personaFilter, setPersonaFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setProfiles(data as Profile[]);
      setLoading(false);
    }
    load();
  }, []);

  const now = Date.now();
  const weekAgo = now - 7 * 86_400_000;

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (p.name ?? "").toLowerCase().includes(q) ||
      (p.email ?? "").toLowerCase().includes(q);
    const matchesPersona =
      personaFilter === "all" || p.persona === personaFilter;
    return matchesSearch && matchesPersona;
  });

  const counts = {
    total: profiles.length,
    founder: profiles.filter((p) => p.persona === "founder").length,
    investor: profiles.filter((p) => p.persona === "investor").length,
    advisor: profiles.filter((p) => p.persona === "advisor").length,
    thisWeek: profiles.filter(
      (p) => new Date(p.created_at).getTime() > weekAgo
    ).length,
  };

  async function saveNotes(id: string) {
    const notes = notesDraft[id];
    if (notes === undefined) return;
    await supabase.from("profiles").update({ admin_notes: notes }).eq("id", id);
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, admin_notes: notes } : p))
    );
    toast("Notes saved.");
  }

  async function toggleBlocked(p: Profile) {
    const next = !p.blocked;
    await supabase.from("profiles").update({ blocked: next }).eq("id", p.id);
    setProfiles((prev) =>
      prev.map((u) => (u.id === p.id ? { ...u, blocked: next } : u))
    );
    toast(next ? "User blocked." : "User unblocked.");
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">Loading users...</div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: counts.total },
          { label: "Founders", value: counts.founder },
          { label: "Investors", value: counts.investor },
          { label: "This Week", value: counts.thisWeek },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {PERSONA_FILTER.map((f) => (
            <button
              key={f.value}
              onClick={() => setPersonaFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                personaFilter === f.value
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-gray-100 text-gray-600 border-gray-300 hover:border-brand-400"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* User list */}
      <div className="space-y-2">
        {filtered.map((p) => {
          const expanded = expandedId === p.id;
          const draftNote =
            notesDraft[p.id] !== undefined ? notesDraft[p.id] : p.admin_notes ?? "";

          return (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            >
              {/* Collapsed row */}
              <button
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expanded ? null : p.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center flex-shrink-0 text-brand-700 text-xs font-bold">
                    {initials(p.name, p.email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {p.name ?? p.email ?? "Unknown"}
                      </p>
                      {p.persona && (
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", personaBadgeClass(p.persona))}>
                          {personaLabel(p.persona)}
                        </span>
                      )}
                      {p.blocked && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Blocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{p.email}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span className="text-xs text-gray-400 hidden sm:block">{formatDate(p.created_at)}</span>
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              {expanded && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">
                  {/* Profile fields */}
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    {[
                      ["Email", p.email],
                      ["Name", p.name],
                      ["Persona", personaLabel(p.persona)],
                      ["Location", p.location],
                      ["Joined", formatDate(p.created_at)],
                      ["User ID", p.id],
                    ].map(([k, v]) => (
                      <div key={k as string}>
                        <span className="text-xs font-semibold text-gray-500">{k}: </span>
                        <span className="text-xs text-gray-800">{(v as string) ?? "—"}</span>
                      </div>
                    ))}
                  </div>

                  {/* Admin notes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Admin Notes
                    </label>
                    <textarea
                      className={inputCls + " resize-none"}
                      rows={3}
                      value={draftNote}
                      onChange={(e) =>
                        setNotesDraft((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                      onBlur={() => saveNotes(p.id)}
                      placeholder="Internal notes about this user (auto-saves on blur)..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => toggleBlocked(p)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
                        p.blocked
                          ? "bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100"
                          : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      )}
                    >
                      {p.blocked ? "Unblock User" : "Block User"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400">No users found.</div>
        )}
      </div>
    </div>
  );
}

// ─── Venture Studio Tab ───────────────────────────────────────────────────────

function VentureTab({ toast }: { toast: (msg: string) => void }) {
  const [submissions, setSubmissions] = useState<VentureSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("venture_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setSubmissions(data as VentureSubmission[]);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id: string, status: SubmissionStatus) {
    await supabase.from("venture_submissions").update({ status }).eq("id", id);
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    toast(`Status updated to ${status.replace("_", " ")}.`);
  }

  const counts = {
    total: submissions.length,
    new: submissions.filter((s) => s.status === "new").length,
    review: submissions.filter((s) => s.status === "under_review").length,
    approved: submissions.filter((s) => s.status === "approved").length,
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">Loading submissions...</div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.total },
          { label: "New", value: counts.new },
          { label: "Under Review", value: counts.review },
          { label: "Approved", value: counts.approved },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Submissions */}
      <div className="space-y-2">
        {submissions.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400">No submissions yet.</div>
        )}
        {submissions.map((sub) => {
          const expanded = expandedId === sub.id;
          return (
            <div
              key={sub.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            >
              <button
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expanded ? null : sub.id)}
              >
                <div className="flex items-start gap-3 justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">{sub.name}</p>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {sub.sector}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{sub.pitch}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {sub.founder_name} · {sub.founder_email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={sub.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateStatus(sub.id, e.target.value as SubmissionStatus);
                      }}
                    >
                      {SUBMISSION_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
              </button>

              {expanded && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 grid sm:grid-cols-2 gap-3 text-sm">
                  {[
                    ["Name", sub.name],
                    ["Pitch", sub.pitch],
                    ["Sector", sub.sector],
                    ["Founder", sub.founder_name],
                    ["Email", sub.founder_email],
                    ["Submitted", formatDate(sub.created_at)],
                  ].map(([k, v]) => (
                    <div key={k as string}>
                      <span className="text-xs font-semibold text-gray-500">{k}: </span>
                      <span className="text-xs text-gray-800">{(v as string) ?? "—"}</span>
                    </div>
                  ))}
                  {sub.description && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Description</p>
                      <p className="text-xs text-gray-700 whitespace-pre-wrap">{sub.description}</p>
                    </div>
                  )}
                  {sub.problem && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Problem</p>
                      <p className="text-xs text-gray-700">{sub.problem}</p>
                    </div>
                  )}
                  {sub.needs && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Needs</p>
                      <p className="text-xs text-gray-700">{sub.needs}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Ecosystem Claims Tab ─────────────────────────────────────────────────────

function ClaimsTab({ toast }: { toast: (msg: string) => void }) {
  const [logs, setLogs] = useState<EcoActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("eco_activity_log")
        .select("*")
        .like("action", "CLAIM_REQUEST:%")
        .order("created_at", { ascending: false });
      if (data) setLogs(data as EcoActivityLog[]);
      setLoading(false);
    }
    load();
  }, []);

  async function approve(log: EcoActivityLog) {
    await supabase
      .from("eco_activity_log")
      .update({ details: { ...(log.details ?? {}), status: "approved" } })
      .eq("id", log.id);
    setLogs((prev) =>
      prev.map((l) =>
        l.id === log.id
          ? { ...l, details: { ...(l.details ?? {}), status: "approved" } }
          : l
      )
    );
    toast("Claim approved.");
  }

  async function deny(log: EcoActivityLog) {
    await supabase
      .from("eco_activity_log")
      .update({ details: { ...(log.details ?? {}), status: "denied" } })
      .eq("id", log.id);
    setLogs((prev) =>
      prev.map((l) =>
        l.id === log.id
          ? { ...l, details: { ...(l.details ?? {}), status: "denied" } }
          : l
      )
    );
    toast("Claim denied.");
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">Loading claim requests...</div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
        <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No pending ecosystem claims.</p>
        <p className="text-gray-400 text-xs mt-1">
          Claim requests from ecosystem managers will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const d = log.details ?? {};
        const status = (d.status as string) ?? "pending";
        const ecosystemName = (d.ecosystem_name as string) ?? log.action.replace("CLAIM_REQUEST:", "");
        const claimerName = (d.name as string) ?? null;
        const claimerEmail = (d.email as string) ?? null;
        const linkedin = (d.linkedin as string) ?? null;
        const role = (d.role as string) ?? null;

        return (
          <div key={log.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{ecosystemName}</p>
                {claimerName && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    Claimed by <span className="font-medium">{claimerName}</span>
                    {role && <span className="text-gray-500"> · {role}</span>}
                  </p>
                )}
                {claimerEmail && (
                  <p className="text-xs text-gray-400">{claimerEmail}</p>
                )}
                {linkedin && (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 mt-1"
                  >
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-1">{formatDate(log.created_at)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {status === "pending" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(log)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => deny(log)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors border border-red-200"
                    >
                      <X className="w-3.5 h-3.5" />
                      Deny
                    </button>
                  </div>
                ) : (
                  <span
                    className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
                      status === "approved"
                        ? "bg-brand-100 text-brand-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {status}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Platform Stats Tab ───────────────────────────────────────────────────────

function StatsTab({ profiles }: { profiles: Profile[] }) {
  const total = profiles.length;

  const personaBreakdown: { label: string; count: number; color: string }[] = [
    {
      label: "Founders",
      count: profiles.filter((p) => p.persona === "founder").length,
      color: "bg-brand-500",
    },
    {
      label: "Investors",
      count: profiles.filter((p) => p.persona === "investor").length,
      color: "bg-blue-500",
    },
    {
      label: "Advisors",
      count: profiles.filter((p) => p.persona === "advisor").length,
      color: "bg-purple-500",
    },
    {
      label: "Ecosystem Managers",
      count: profiles.filter((p) => p.persona === "ecosystem_manager").length,
      color: "bg-amber-500",
    },
    {
      label: "Other / Unknown",
      count: profiles.filter(
        (p) =>
          !["founder", "investor", "advisor", "ecosystem_manager"].includes(
            p.persona ?? ""
          )
      ).length,
      color: "bg-gray-400",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-3xl font-bold text-gray-900">{total}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Registered Users</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-lg font-bold text-gray-900">March 2025</p>
          <p className="text-sm text-gray-500 mt-0.5">Platform Live Since</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <a
            href="https://founderopscenter.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-semibold text-sm transition-colors"
          >
            founderopscenter.vercel.app
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-xs text-gray-500 mt-1">Production Deployment</p>
        </div>
      </div>

      {/* Persona breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">User Breakdown by Persona</h3>
        <div className="space-y-3">
          {personaBreakdown.map((row) => {
            const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
            return (
              <div key={row.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{row.label}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {row.count} <span className="text-xs text-gray-400">({pct}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", row.color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 text-sm text-brand-800">
        <p className="font-semibold mb-1">Platform Health</p>
        <p>
          The platform is live and actively growing. User counts above are sourced directly from
          the Supabase profiles table. Deployment is managed via Vercel connected to GitHub (main branch).
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Prefetch profiles for stats tab reuse
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (session?.user?.email !== ADMIN_EMAIL) return;
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setAllProfiles(data as Profile[]);
      });
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
        <p className="text-gray-500 text-sm">
          This page is restricted to platform administrators. If you believe this is an error,
          please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Admin header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🔐 Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Signed in as <span className="font-medium text-gray-700">{session.user?.name ?? "Russell Cole"}</span>
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700">
          Admin Mode
        </div>
      </div>

      {/* Tab panel */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap",
                activeTab === tab.id
                  ? "border-brand-600 text-brand-700 bg-brand-50"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "users" && <UsersTab toast={showToast} />}
          {activeTab === "venture" && <VentureTab toast={showToast} />}
          {activeTab === "claims" && <ClaimsTab toast={showToast} />}
          {activeTab === "stats" && <StatsTab profiles={allProfiles} />}
        </div>
      </div>

      {/* Toast */}
      {toastMsg && <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} />}
    </div>
  );
}
