"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  X,
  ExternalLink,
  Settings,
  Plug,
  ClipboardList,
  Kanban,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = "idea" | "pre-seed" | "seed" | "series-a";
type Status = "screening" | "active" | "graduated" | "rejected";

interface EcoStartup {
  id: string;
  manager_id: string;
  name: string;
  founder_name: string;
  founder_email: string;
  stage: Stage;
  sector: string;
  status: Status;
  cohort: string | null;
  joined: string | null;
  mentor_names: string | null;
  notes: string | null;
  source: string | null;
  milestones: string[] | null;
  readiness: number | null;
  created_at: string;
}

interface EcoSettings {
  program_name: string;
  program_type: string;
  cohort_name: string;
  location: string;
  website: string;
}

const MILESTONES = [
  "MVP Complete",
  "First Pilot",
  "LOI Secured",
  "Seed Round",
];

const STAGE_OPTIONS: { value: Stage; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "pre-seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
];

const STATUS_COLUMNS: { value: Status; label: string; color: string; bg: string }[] = [
  { value: "screening", label: "Screening", color: "text-amber-700", bg: "bg-amber-100" },
  { value: "active", label: "Active", color: "text-brand-700", bg: "bg-brand-100" },
  { value: "graduated", label: "Graduated", color: "text-blue-700", bg: "bg-blue-100" },
  { value: "rejected", label: "Rejected", color: "text-red-700", bg: "bg-red-100" },
];

const PROGRAM_TYPES = [
  "Accelerator",
  "Incubator",
  "Innovation Hub",
  "Research Program",
  "Corporate Program",
];

type Tab = "pipeline" | "applications" | "settings" | "integrations";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "pipeline", label: "Pipeline", icon: <Kanban className="w-4 h-4" /> },
  { id: "applications", label: "Applications", icon: <ClipboardList className="w-4 h-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  { id: "integrations", label: "Integrations", icon: <Plug className="w-4 h-4" /> },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors";
const selectCls = inputCls;

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-brand-700 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-3">
      <span>{message}</span>
      <button onClick={onDismiss} className="hover:text-brand-200 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status }) {
  const col = STATUS_COLUMNS.find((s) => s.value === status);
  if (!col) return null;
  return (
    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", col.bg, col.color)}>
      {col.label}
    </span>
  );
}

// ─── Readiness Bar ────────────────────────────────────────────────────────────

function ReadinessBar({ value }: { value: number | null }) {
  const pct = value ?? 0;
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── Pipeline Tab ─────────────────────────────────────────────────────────────

function PipelineTab({
  profile,
  toast,
}: {
  profile: { id: string } | null;
  toast: (msg: string) => void;
}) {
  const [startups, setStartups] = useState<EcoStartup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showCsvInfo, setShowCsvInfo] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    founder_name: "",
    founder_email: "",
    sector: "",
    stage: "idea" as Stage,
    notes: "",
  });

  useEffect(() => {
    if (!profile) return;
    loadStartups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function loadStartups() {
    setLoading(true);
    const { data, error } = await supabase
      .from("eco_startups")
      .select("*")
      .eq("manager_id", profile!.id)
      .order("created_at", { ascending: false });
    if (!error && data) setStartups(data as EcoStartup[]);
    setLoading(false);
  }

  async function addStartup() {
    if (!form.name.trim() || !profile) return;
    const { error } = await supabase.from("eco_startups").insert({
      manager_id: profile.id,
      name: form.name,
      founder_name: form.founder_name,
      founder_email: form.founder_email,
      sector: form.sector,
      stage: form.stage,
      notes: form.notes,
      status: "screening",
      readiness: 0,
      milestones: [],
    });
    if (!error) {
      toast("Startup added successfully!");
      setShowForm(false);
      setForm({ name: "", founder_name: "", founder_email: "", sector: "", stage: "idea", notes: "" });
      loadStartups();
    }
  }

  async function deleteStartup(id: string) {
    await supabase.from("eco_startups").delete().eq("id", id);
    setStartups((prev) => prev.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
    toast("Startup removed.");
  }

  async function toggleMilestone(startup: EcoStartup, milestone: string) {
    const current = startup.milestones ?? [];
    const next = current.includes(milestone)
      ? current.filter((m) => m !== milestone)
      : [...current, milestone];
    await supabase.from("eco_startups").update({ milestones: next }).eq("id", startup.id);
    setStartups((prev) =>
      prev.map((s) => (s.id === startup.id ? { ...s, milestones: next } : s))
    );
  }

  const filtered = startups.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.founder_name.toLowerCase().includes(q) ||
      (s.sector ?? "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
        Loading startups...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search startups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Startup
        </button>
        <button
          onClick={() => setShowCsvInfo((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors border border-gray-300"
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </button>
      </div>

      {/* CSV Instructions */}
      {showCsvInfo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
          <div className="flex justify-between items-start mb-2">
            <p className="font-semibold">CSV Import Instructions</p>
            <button onClick={() => setShowCsvInfo(false)} className="text-amber-600 hover:text-amber-800">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-amber-800 mb-2">
            Paste CSV rows with the following column order:
          </p>
          <code className="block bg-amber-100 rounded px-3 py-2 text-xs font-mono">
            Name, Founder, Email, Sector, Stage
          </code>
          <p className="text-amber-700 text-xs mt-2">
            Full CSV import via file upload is coming soon. For now, add startups using the form above.
          </p>
        </div>
      )}

      {/* Inline Add Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Add New Startup</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Startup Name *</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., GreenHarvest AI"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Founder Name</label>
              <input
                className={inputCls}
                value={form.founder_name}
                onChange={(e) => setForm((f) => ({ ...f, founder_name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Founder Email</label>
              <input
                type="email"
                className={inputCls}
                value={form.founder_email}
                onChange={(e) => setForm((f) => ({ ...f, founder_email: e.target.value }))}
                placeholder="founder@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Sector</label>
              <input
                className={inputCls}
                value={form.sector}
                onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
                placeholder="e.g., Precision Agriculture"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Stage</label>
              <select
                className={selectCls}
                value={form.stage}
                onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as Stage }))}
              >
                {STAGE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
              <textarea
                className={inputCls + " resize-none"}
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Initial notes about this startup..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={addStartup}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Add Startup
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && !showForm && (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-16 text-center">
          <p className="text-gray-500 text-sm mb-4">
            {search ? "No startups match your search." : "No startups in your pipeline yet."}
          </p>
          {!search && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add your first startup
            </button>
          )}
        </div>
      )}

      {/* Grouped list by status */}
      {STATUS_COLUMNS.map((col) => {
        const group = filtered.filter((s) => s.status === col.value);
        if (group.length === 0) return null;
        return (
          <div key={col.value} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full", col.bg, col.color)}>
                {col.label}
              </span>
              <span className="text-xs text-gray-400">{group.length} startup{group.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-2">
              {group.map((startup) => {
                const expanded = expandedId === startup.id;
                return (
                  <div
                    key={startup.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                  >
                    {/* Card header — always visible */}
                    <button
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedId(expanded ? null : startup.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-gray-900">{startup.name}</p>
                            <StatusBadge status={startup.status} />
                            {startup.sector && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {startup.sector}
                              </span>
                            )}
                          </div>
                          {startup.founder_name && (
                            <p className="text-xs text-gray-500 mt-0.5">{startup.founder_name}</p>
                          )}
                          <ReadinessBar value={startup.readiness} />
                          {startup.notes && (
                            <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">
                              {startup.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-gray-400">
                          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {expanded && (
                      <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">
                        {startup.notes && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Notes</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{startup.notes}</p>
                          </div>
                        )}

                        {startup.mentor_names && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Mentor Notes</p>
                            <p className="text-sm text-gray-700">{startup.mentor_names}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2">Milestones</p>
                          <div className="space-y-1.5">
                            {MILESTONES.map((m) => {
                              const done = (startup.milestones ?? []).includes(m);
                              return (
                                <button
                                  key={m}
                                  onClick={() => toggleMilestone(startup, m)}
                                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-brand-700 transition-colors"
                                >
                                  {done ? (
                                    <CheckSquare className="w-4 h-4 text-brand-600 flex-shrink-0" />
                                  ) : (
                                    <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  )}
                                  <span className={done ? "line-through text-gray-400" : ""}>{m}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <div className="text-xs text-gray-400 flex-1">
                            {startup.founder_email && (
                              <span>
                                <span className="font-medium">Email:</span> {startup.founder_email}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteStartup(startup.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors border border-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Applications Tab ─────────────────────────────────────────────────────────

function ApplicationsTab({ toast }: { toast: (msg: string) => void }) {
  const [appNotes, setAppNotes] = useState("");
  const [toolLink, setToolLink] = useState("");

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-amber-800 mb-1">Application tracking coming soon.</p>
        <p className="text-sm text-amber-700">
          Use the <strong>Pipeline</strong> tab to manage startups. Full application tracking with form links,
          review queues, and scoring rubrics is on the roadmap.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Application Notes</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes / Instructions for applicants</label>
            <textarea
              className={inputCls + " resize-none"}
              rows={4}
              value={appNotes}
              onChange={(e) => setAppNotes(e.target.value)}
              placeholder="Add notes about your application process..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Link to your external application tool</label>
            <input
              type="url"
              className={inputCls}
              value={toolLink}
              onChange={(e) => setToolLink(e.target.value)}
              placeholder="https://your-application-tool.com"
            />
            <p className="text-xs text-gray-400 mt-1">
              e.g. Typeform, Google Form, F6S, or your own portal.
            </p>
          </div>
          <button
            onClick={() => toast("Notes saved locally.")}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({
  profile,
  toast,
}: {
  profile: { id: string } | null;
  toast: (msg: string) => void;
}) {
  const [settings, setSettings] = useState<EcoSettings>({
    program_name: "",
    program_type: "",
    cohort_name: "",
    location: "",
    website: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const { data } = await supabase
        .from("eco_settings")
        .select("*")
        .eq("manager_id", profile!.id)
        .single();
      if (data) {
        setSettings({
          program_name: data.program_name ?? "",
          program_type: data.program_type ?? "",
          cohort_name: data.cohort_name ?? "",
          location: data.location ?? "",
          website: data.website ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, [profile]);

  async function save() {
    if (!profile) return;
    setSaving(true);
    await supabase.from("eco_settings").upsert(
      { manager_id: profile.id, ...settings },
      { onConflict: "manager_id" }
    );
    setSaving(false);
    toast("Settings saved!");
  }

  if (loading) {
    return <div className="py-8 text-center text-sm text-gray-400">Loading settings...</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-lg">
      <h3 className="text-sm font-bold text-gray-900 mb-5">Program Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Program Name</label>
          <input
            className={inputCls}
            value={settings.program_name}
            onChange={(e) => setSettings((s) => ({ ...s, program_name: e.target.value }))}
            placeholder="e.g., AgTech Accelerator 2026"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Program Type</label>
          <select
            className={selectCls}
            value={settings.program_type}
            onChange={(e) => setSettings((s) => ({ ...s, program_type: e.target.value }))}
          >
            <option value="">Select type...</option>
            {PROGRAM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Cohort Name</label>
          <input
            className={inputCls}
            value={settings.cohort_name}
            onChange={(e) => setSettings((s) => ({ ...s, cohort_name: e.target.value }))}
            placeholder="e.g., Spring 2026"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
          <input
            className={inputCls}
            value={settings.location}
            onChange={(e) => setSettings((s) => ({ ...s, location: e.target.value }))}
            placeholder="e.g., Guelph, Ontario"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Website</label>
          <input
            type="url"
            className={inputCls}
            value={settings.website}
            onChange={(e) => setSettings((s) => ({ ...s, website: e.target.value }))}
            placeholder="https://your-program.com"
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="mt-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

// ─── Integrations Tab ─────────────────────────────────────────────────────────

function IntegrationsTab({ toast }: { toast: (msg: string) => void }) {
  const [airtablePat, setAirtablePat] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("wks_at_pat") ?? "";
    return "";
  });
  const [patInput, setPatInput] = useState("");
  const [showPatForm, setShowPatForm] = useState(false);

  function saveAirtablePat() {
    localStorage.setItem("wks_at_pat", patInput);
    setAirtablePat(patInput);
    setShowPatForm(false);
    setPatInput("");
    toast("Airtable token saved!");
  }

  function disconnectAirtable() {
    localStorage.removeItem("wks_at_pat");
    setAirtablePat("");
    toast("Airtable disconnected.");
  }

  const integrations = [
    {
      id: "airtable",
      label: "Airtable",
      icon: "🟡",
      description:
        "Sync your startup pipeline to Airtable. Two-way sync keeps your CRM and Airtable in lockstep.",
      connected: !!airtablePat,
      custom: true,
    },
    {
      id: "hubspot",
      label: "HubSpot",
      icon: "🟠",
      description:
        "Import contacts and companies from HubSpot into your pipeline.",
      connected: false,
      custom: false,
    },
    {
      id: "sheets",
      label: "Google Sheets",
      icon: "🟢",
      description: "Export your pipeline to Google Sheets for reporting and sharing.",
      connected: false,
      custom: false,
    },
    {
      id: "notion",
      label: "Notion",
      icon: "⚫",
      description: "Sync your Notion workspace with your startup pipeline.",
      connected: false,
      custom: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {integrations.map((intg) => (
          <div key={intg.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{intg.icon}</span>
                <p className="text-sm font-bold text-gray-900">{intg.label}</p>
              </div>
              {intg.connected && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                  Connected
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-4">{intg.description}</p>

            {/* Airtable — custom PAT flow */}
            {intg.id === "airtable" && (
              <div>
                {intg.connected ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">
                      PAT token saved. Sync is available when the integration is live.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPatForm(true)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors border border-gray-300"
                      >
                        Update Token
                      </button>
                      <button
                        onClick={disconnectAirtable}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors border border-red-200"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : showPatForm ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-600">
                      Paste your Airtable Personal Access Token
                    </label>
                    <input
                      type="password"
                      className={inputCls}
                      value={patInput}
                      onChange={(e) => setPatInput(e.target.value)}
                      placeholder="pat..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveAirtablePat}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Save Token
                      </button>
                      <button
                        onClick={() => setShowPatForm(false)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPatForm(true)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Connect Airtable
                  </button>
                )}
              </div>
            )}

            {/* All other integrations — coming soon */}
            {intg.id !== "airtable" && (
              <button
                onClick={() => toast("Coming soon! This integration is on our roadmap.")}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors border border-gray-300"
              >
                Connect {intg.label}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Claim Your Ecosystem */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-brand-900 mb-1">Claim Your Ecosystem</h3>
        <p className="text-sm text-brand-800 mb-4">
          If you manage an ecosystem listed in the Partner Ecosystems directory, you can claim it to verify
          your organization and unlock additional features like a verified badge, featured placement, and
          enhanced analytics.
        </p>
        <a
          href="/accelerators"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Claim Ecosystem <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EcosystemWorkspacePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("pipeline");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ id: string } | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", session!.user!.email)
        .single();
      if (data) setProfile({ id: data.id });
    }
    loadProfile();
  }, [session]);

  function showToast(msg: string) {
    setToastMsg(msg);
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="text-4xl mb-4">🏢</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Ecosystem Workspace</h1>
        <p className="text-gray-500 text-sm mb-6">
          Sign in to access your CRM pipeline, settings, and integrations for managing your accelerator or
          incubator.
        </p>
        <button
          onClick={() => signIn()}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ecosystem Workspace</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your startup pipeline, settings, and integrations.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold transition-colors border-b-2 -mb-px",
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
          {activeTab === "pipeline" && (
            <PipelineTab profile={profile} toast={showToast} />
          )}
          {activeTab === "applications" && (
            <ApplicationsTab toast={showToast} />
          )}
          {activeTab === "settings" && (
            <SettingsTab profile={profile} toast={showToast} />
          )}
          {activeTab === "integrations" && (
            <IntegrationsTab toast={showToast} />
          )}
        </div>
      </div>

      {/* Toast */}
      {toastMsg && <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} />}
    </div>
  );
}
